import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AnalysisResult } from "@/components/AnalysisResult";
import { Loader2, FileText, Link as LinkIcon, Upload, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Analysis {
  summary: string;
  keywords: string[];
  sentiment: string;
  sentimentScore: number;
  inputContent: string;
  inputType: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const handleAnalyze = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Please login to analyze content");
      navigate("/login");
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      let response;
      
      if (activeTab === "text") {
        if (!textInput.trim()) {
          toast.error("Please enter some text to analyze");
          return;
        }
        
        response = await supabase.functions.invoke("analyze-text", {
          body: { text: textInput },
        });
      } else if (activeTab === "url") {
        if (!urlInput.trim()) {
          toast.error("Please enter a URL to analyze");
          return;
        }
        
        response = await supabase.functions.invoke("analyze-url", {
          body: { url: urlInput },
        });
      } else if (activeTab === "file") {
        if (!file) {
          toast.error("Please upload a file to analyze");
          return;
        }
        
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target?.result as string;
          response = await supabase.functions.invoke("analyze-text", {
            body: { text: content },
          });
          
          if (response.error) {
            throw new Error(response.error.message);
          }

          setAnalysis({
            ...response.data,
            inputContent: file.name,
            inputType: "file",
          });
        };
        reader.readAsText(file);
        return;
      }

      if (response?.error) {
        throw new Error(response.error.message);
      }

      const inputContent = activeTab === "text" ? textInput : urlInput;
      setAnalysis({
        ...response?.data,
        inputContent,
        inputType: activeTab,
      });
      
      toast.success("Analysis complete!");
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to analyze content");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!analysis) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please login to save analyses");
      return;
    }

    try {
      const { error } = await supabase.from("analyses").insert({
        user_id: user.id,
        input_type: analysis.inputType,
        input_content: analysis.inputContent,
        summary: analysis.summary,
        keywords: analysis.keywords,
        sentiment: analysis.sentiment,
        sentiment_score: analysis.sentimentScore,
      });

      if (error) throw error;

      toast.success("Analysis saved to library!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save analysis");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      <Navigation />
      
      <div className="container mx-auto px-6 pt-32 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold gradient-text mb-4 animate-fade-in">
            LITE READ
          </h1>
          <p className="text-2xl text-muted-foreground animate-fade-in">
            Read Smarter, Not Harder
          </p>
          <p className="text-lg text-muted-foreground mt-2 animate-fade-in">
            AI-Powered Article Analysis & Summarization
          </p>
        </div>

        {/* Input Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="glass-strong rounded-2xl p-8 glow-primary">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Paste Text
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload File
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Enter URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <Textarea
                  placeholder="Paste your article text here..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={10}
                  className="glass border-white/20 resize-none"
                />
              </TabsContent>

              <TabsContent value="file" className="space-y-4">
                <div className="glass border-white/20 rounded-lg p-8 border-2 border-dashed text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <Input
                    type="file"
                    accept=".txt,.pdf,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="max-w-xs mx-auto"
                  />
                  {file && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="url" className="space-y-4">
                <Input
                  type="url"
                  placeholder="https://example.com/article"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="glass border-white/20"
                />
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full mt-6 bg-gradient-primary glow-primary text-lg py-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {analysis && (
          <div className="max-w-4xl mx-auto">
            <AnalysisResult
              summary={analysis.summary}
              keywords={analysis.keywords}
              sentiment={analysis.sentiment}
              sentimentScore={analysis.sentimentScore}
              onSave={handleSaveAnalysis}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
