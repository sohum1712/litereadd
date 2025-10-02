import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Trash2, Calendar, FileText, Link as LinkIcon, Upload, Lock } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { analysisService, SavedAnalysis } from "@/services/analysisService";

interface LocalAnalysis {
  id: string;
  inputType: string;
  inputContent: string;
  summary: string;
  keywords: string[];
  markdownContent: string;
  createdAt: string;
}

const Library = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [analyses, setAnalyses] = useState<(SavedAnalysis | LocalAnalysis)[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<(SavedAnalysis | LocalAnalysis)[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = analyses.filter(
        (analysis) =>
          analysis.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          analysis.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredAnalyses(filtered);
    } else {
      setFilteredAnalyses(analyses);
    }
  }, [searchQuery, analyses]);

  const fetchAnalyses = async () => {
    try {
      if (isAuthenticated) {
        // Fetch from backend for authenticated users
        const response = await analysisService.getAnalyses(1, 50); // Get first 50 analyses
        setAnalyses(response.analyses);
        setFilteredAnalyses(response.analyses);
      } else {
        // Fetch from localStorage for non-authenticated users
        const savedAnalyses = JSON.parse(localStorage.getItem('savedAnalyses') || '[]');
        setAnalyses(savedAnalyses);
        setFilteredAnalyses(savedAnalyses);
      }
    } catch (error: any) {
      console.error('Fetch analyses error:', error);
      toast.error("Failed to load analyses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (isAuthenticated) {
        // Delete from backend for authenticated users
        await analysisService.deleteAnalysis(id);
        const updatedAnalyses = analyses.filter((a) => ('_id' in a ? a._id : a.id) !== id);
        setAnalyses(updatedAnalyses);
        toast.success("Analysis deleted");
      } else {
        // Delete from localStorage for non-authenticated users
        const savedAnalyses = JSON.parse(localStorage.getItem('savedAnalyses') || '[]');
        const updatedAnalyses = savedAnalyses.filter((a: LocalAnalysis) => a.id !== id);
        localStorage.setItem('savedAnalyses', JSON.stringify(updatedAnalyses));
        
        setAnalyses(updatedAnalyses);
        toast.success("Analysis deleted");
      }
    } catch (error: any) {
      console.error('Delete analysis error:', error);
      toast.error(error.message || "Failed to delete analysis");
    }
  };

  const getInputIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="w-4 h-4" />;
      case "url":
        return <LinkIcon className="w-4 h-4" />;
      case "file":
        return <Upload className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
        <Navigation />
        <div className="container mx-auto px-6 pt-32 pb-16 text-center">
          <p className="text-muted-foreground">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-6 pt-32 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Your Analysis <span className="gradient-text">Library</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Access all your saved article analyses in one place
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search analyses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass border-white/20"
              />
            </div>
          </div>

          {/* Authentication Notice for Non-Authenticated Users */}
          {!isAuthenticated && (
            <div className="mb-8 p-6 glass rounded-2xl border border-yellow-500/30 bg-yellow-500/10">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-foreground">Local Storage Only</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Your analyses are currently saved in your browser's local storage. 
                Sign up for an account to save your analyses permanently and access them from any device.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => navigate('/signup')} className="bg-gradient-primary">
                  Create Account
                </Button>
                <Button onClick={() => navigate('/login')} variant="outline">
                  Sign In
                </Button>
              </div>
            </div>
          )}

          {/* Analyses Grid */}
          {filteredAnalyses.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                {searchQuery ? "No analyses found matching your search" : "No saved analyses yet"}
              </p>
              <Button
                onClick={() => navigate("/")}
                className="mt-6 bg-gradient-primary glow-primary"
              >
                Start Analyzing
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredAnalyses.map((analysis) => {
                const analysisId = '_id' in analysis ? analysis._id : analysis.id;
                const createdAt = '_id' in analysis ? analysis.createdAt : analysis.createdAt;
                
                return (
                  <Card key={analysisId} className="glass-strong p-6 glow-primary hover:scale-[1.02] transition-transform">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getInputIcon(analysis.inputType)}
                        <span className="capitalize">{analysis.inputType}</span>
                        {!isAuthenticated && (
                          <Badge variant="outline" className="text-xs">
                            Local
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(analysisId)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                      {analysis.inputContent}
                    </p>

                    <p className="text-foreground/90 mb-4 line-clamp-3">
                      {analysis.summary}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {analysis.keywords.slice(0, 4).map((keyword, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="bg-primary/20 border-primary/50 text-xs"
                        >
                          {keyword}
                        </Badge>
                      ))}
                      {analysis.keywords.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{analysis.keywords.length - 4}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-end text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Library;
