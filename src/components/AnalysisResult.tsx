import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Download, Save, SmilePlus, Meh, Frown } from "lucide-react";
import { toast } from "sonner";

interface AnalysisResultProps {
  summary: string;
  keywords: string[];
  sentiment: string;
  sentimentScore?: number;
  onSave?: () => void;
}

export const AnalysisResult = ({
  summary,
  keywords,
  sentiment,
  sentimentScore,
  onSave,
}: AnalysisResultProps) => {
  const handleCopy = () => {
    const text = `Summary: ${summary}\n\nKeywords: ${keywords.join(", ")}\n\nSentiment: ${sentiment}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    const text = `Article Analysis\n\nSummary:\n${summary}\n\nKeywords:\n${keywords.join(", ")}\n\nSentiment: ${sentiment} (${sentimentScore})`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analysis-result.txt";
    a.click();
    toast.success("Downloaded successfully!");
  };

  const getSentimentIcon = () => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return <SmilePlus className="w-5 h-5 text-green-400" />;
      case "negative":
        return <Frown className="w-5 h-5 text-red-400" />;
      default:
        return <Meh className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getSentimentColor = () => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "bg-green-500/20 border-green-500/50";
      case "negative":
        return "bg-red-500/20 border-red-500/50";
      default:
        return "bg-yellow-500/20 border-yellow-500/50";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Card */}
      <Card className="glass-strong p-6 glow-primary">
        <h3 className="text-xl font-semibold gradient-text mb-4">Summary</h3>
        <p className="text-foreground/90 leading-relaxed">{summary}</p>
      </Card>

      {/* Keywords Card */}
      <Card className="glass-strong p-6 glow-primary">
        <h3 className="text-xl font-semibold gradient-text mb-4">Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <Badge
              key={index}
              variant="outline"
              className="bg-primary/20 border-primary/50 text-primary-foreground px-4 py-1 text-sm"
            >
              {keyword}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Sentiment Card */}
      <Card className={`glass-strong p-6 ${getSentimentColor()}`}>
        <h3 className="text-xl font-semibold gradient-text mb-4">Sentiment Analysis</h3>
        <div className="flex items-center gap-3">
          {getSentimentIcon()}
          <span className="text-lg font-medium capitalize">{sentiment}</span>
          {sentimentScore && (
            <span className="text-muted-foreground">({sentimentScore.toFixed(2)})</span>
          )}
        </div>
        <div className="mt-4 h-2 bg-background/30 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              sentiment.toLowerCase() === "positive"
                ? "bg-green-500"
                : sentiment.toLowerCase() === "negative"
                ? "bg-red-500"
                : "bg-yellow-500"
            }`}
            style={{
              width: sentimentScore ? `${(sentimentScore + 1) * 50}%` : "50%",
            }}
          />
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          onClick={handleCopy}
          variant="outline"
          className="border-primary/50 hover:bg-primary/10"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy
        </Button>
        <Button
          onClick={handleDownload}
          variant="outline"
          className="border-primary/50 hover:bg-primary/10"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        {onSave && (
          <Button
            onClick={onSave}
            className="bg-gradient-accent glow-accent"
          >
            <Save className="w-4 h-4 mr-2" />
            Save to Library
          </Button>
        )}
      </div>
    </div>
  );
};
