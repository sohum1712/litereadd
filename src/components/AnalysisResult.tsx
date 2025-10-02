import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Download, Save } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';

interface AnalysisResultProps {
  summary: string;
  keywords: string[];
  markdownContent: string;
  onSave?: () => void;
}

export const AnalysisResult = ({
  summary,
  keywords,
  markdownContent,
  onSave,
}: AnalysisResultProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    toast.success("Analysis copied to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analysis-result.md";
    a.click();
    toast.success("Analysis downloaded successfully!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Full Markdown Analysis */}
      <Card className="glass-strong p-8 glow-primary">
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            className="text-foreground/90 leading-relaxed"
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold gradient-text mb-6">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-semibold gradient-text mb-4 mt-8">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold text-primary mb-3 mt-6">{children}</h3>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>
              ),
              li: ({ children }) => (
                <li className="text-foreground/80">{children}</li>
              ),
              p: ({ children }) => (
                <p className="mb-4 text-foreground/90 leading-relaxed">{children}</p>
              ),
            }}
          >
            {markdownContent}
          </ReactMarkdown>
        </div>
      </Card>

      {/* Keywords Display */}
      {keywords.length > 0 && (
        <Card className="glass-strong p-6 glow-primary">
          <h3 className="text-xl font-semibold gradient-text mb-4">Quick Keywords</h3>
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
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          onClick={handleCopy}
          variant="outline"
          className="border-primary/50 hover:bg-primary/10"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Markdown
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
