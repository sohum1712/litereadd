import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trash2, Calendar, FileText, Link as LinkIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SavedAnalysis {
  id: string;
  input_type: string;
  input_content: string;
  summary: string;
  keywords: string[];
  sentiment: string;
  sentiment_score: number;
  created_at: string;
}

const Library = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<SavedAnalysis[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetchAnalyses();
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

  const checkAuthAndFetchAnalyses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Please login to view your library");
      navigate("/login");
      return;
    }

    await fetchAnalyses();
  };

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from("analyses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAnalyses(data || []);
      setFilteredAnalyses(data || []);
    } catch (error: any) {
      toast.error("Failed to load analyses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("analyses").delete().eq("id", id);

      if (error) throw error;

      setAnalyses(analyses.filter((a) => a.id !== id));
      toast.success("Analysis deleted");
    } catch (error: any) {
      toast.error("Failed to delete analysis");
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

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "negative":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      <Navigation />
      
      <div className="container mx-auto px-6 pt-32 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold gradient-text mb-4">Your Analysis Library</h1>
            <p className="text-muted-foreground">
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
              {filteredAnalyses.map((analysis) => (
                <Card key={analysis.id} className="glass-strong p-6 glow-primary hover:scale-[1.02] transition-transform">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {getInputIcon(analysis.input_type)}
                      <span className="capitalize">{analysis.input_type}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(analysis.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                    {analysis.input_content}
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

                  <div className="flex items-center justify-between text-sm">
                    <Badge className={getSentimentColor(analysis.sentiment)}>
                      {analysis.sentiment}
                    </Badge>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;
