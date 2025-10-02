// import { useState } from "react";
// import { Navigation } from "@/components/Navigation";
// import { Footer } from "@/components/Footer";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Input } from "@/components/ui/input";
// import { toast } from "sonner";
// import { AnalysisResult } from "@/components/AnalysisResult";
// import { useAuth } from "@/contexts/AuthContext";
// import { Loader2, FileText, Link as LinkIcon, Upload, Sparkles } from "lucide-react";
// import { geminiService, AnalysisResult as GeminiAnalysisResult } from "@/services/geminiService";
// import { analysisService } from "@/services/analysisService";

// const Home = () => {
//   const [activeTab, setActiveTab] = useState("text");
//   const [textInput, setTextInput] = useState("");
//   const [urlInput, setUrlInput] = useState("");
//   const [file, setFile] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [analysis, setAnalysis] = useState<GeminiAnalysisResult | null>(null);
//   const { user, isAuthenticated } = useAuth();

//   const handleAnalyze = async () => {

//     setLoading(true);
//     setAnalysis(null);

//     try {
//       let result: GeminiAnalysisResult;
      
//       if (activeTab === "text") {
//         if (!textInput.trim()) {
//           toast.error("Please enter some text to analyze");
//           return;
//         }
        
//         result = await geminiService.analyzeText(textInput, "text", textInput.substring(0, 100) + "...");
//       } else if (activeTab === "url") {
//         if (!urlInput.trim()) {
//           toast.error("Please enter a URL to analyze");
//           return;
//         }
        
//         const extractedText = await geminiService.extractTextFromUrl(urlInput);
//         result = await geminiService.analyzeText(extractedText, "url", urlInput);
//       } else if (activeTab === "file") {
//         if (!file) {
//           toast.error("Please upload a file to analyze");
//           return;
//         }
        
//         const extractedText = await geminiService.extractTextFromFile(file);
//         result = await geminiService.analyzeText(extractedText, "file", file.name);
//       } else {
//         throw new Error("Invalid tab selection");
//       }

//       setAnalysis(result);
//       toast.success("Analysis complete!");
//     } catch (error: any) {
//       console.error("Analysis error:", error);
//       toast.error(error.message || "Failed to analyze content");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveAnalysis = async () => {
//     if (!analysis) return;

//     try {
//       if (isAuthenticated) {
//         // Save to backend if authenticated
//         const title = analysis.summary.substring(0, 50) + (analysis.summary.length > 50 ? '...' : '');
//         await analysisService.saveAnalysis({
//           title,
//           summary: analysis.summary,
//           keywords: analysis.keywords,
//           markdownContent: analysis.markdownContent,
//           inputContent: analysis.inputContent,
//           inputType: analysis.inputType as 'text' | 'url' | 'file',
//           originalUrl: activeTab === 'url' ? urlInput : undefined,
//           fileName: activeTab === 'file' ? file?.name : undefined,
//         });
//         toast.success("Analysis saved to your library!");
//       } else {
//         // Save to localStorage for non-authenticated users
//         const savedAnalyses = JSON.parse(localStorage.getItem('savedAnalyses') || '[]');
//         const newAnalysis = {
//           id: Date.now().toString(),
//           ...analysis,
//           createdAt: new Date().toISOString(),
//         };
        
//         savedAnalyses.unshift(newAnalysis);
//         localStorage.setItem('savedAnalyses', JSON.stringify(savedAnalyses));
        
//         toast.success("Analysis saved locally! Sign up to save permanently.");
//       }
//     } catch (error: any) {
//       console.error('Save analysis error:', error);
//       toast.error(error.message || "Failed to save analysis");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <Navigation />
      
//       <div className="container mx-auto px-6 pt-32 pb-16">
//         {/* Hero Section */}
//         <div className="text-center mb-16">
//           <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
//             Read Smarter, Not Harder
//           </h1>
//           <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
//             Unlock the power of AI to analyze and summarize articles, documents, 
//             and web content. Get key insights in seconds.
//           </p>
          
//           {/* Main Input Section - Matching Reference Image */}
//           <div className="max-w-2xl mx-auto mb-16">
//             <div className="flex items-center gap-4 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
//               <div className="flex-1">
//                 <input
//                   type="text"
//                   placeholder="Paste URL, text, or upload a file..."
//                   value={activeTab === 'text' ? textInput : activeTab === 'url' ? urlInput : file?.name || ''}
//                   onChange={(e) => {
//                     if (activeTab === 'text') setTextInput(e.target.value);
//                     if (activeTab === 'url') setUrlInput(e.target.value);
//                   }}
//                   className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none text-lg"
//                 />
//               </div>
//               <div className="flex items-center gap-2">
//                 <input
//                   type="file"
//                   accept=".txt,.md,.csv,.json,.pdf,.docx"
//                   onChange={(e) => {
//                     setFile(e.target.files?.[0] || null);
//                     setActiveTab('file');
//                   }}
//                   className="hidden"
//                   id="file-input"
//                 />
//                 <label
//                   htmlFor="file-input"
//                   className="p-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
//                 >
//                   <Upload className="w-5 h-5 text-muted-foreground" />
//                 </label>
//                 <Button
//                   onClick={handleAnalyze}
//                   disabled={loading}
//                   className="bg-gradient-primary text-white px-8 py-3 rounded-xl font-medium hover:scale-105 transition-transform"
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                       Analyzing...
//                     </>
//                   ) : (
//                     'Analyze'
//                   )}
//                 </Button>
//               </div>
//             </div>
            
//             {/* Tab Selector */}
//             <div className="flex justify-center mt-4">
//               <div className="flex bg-card/50 rounded-full p-1">
//                 <button
//                   onClick={() => setActiveTab('text')}
//                   className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
//                     activeTab === 'text' 
//                       ? 'bg-primary text-primary-foreground' 
//                       : 'text-muted-foreground hover:text-foreground'
//                   }`}
//                 >
//                   <FileText className="w-4 h-4 mr-1 inline" />
//                   Text
//                 </button>
//                 <button
//                   onClick={() => setActiveTab('url')}
//                   className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
//                     activeTab === 'url' 
//                       ? 'bg-primary text-primary-foreground' 
//                       : 'text-muted-foreground hover:text-foreground'
//                   }`}
//                 >
//                   <LinkIcon className="w-4 h-4 mr-1 inline" />
//                   URL
//                 </button>
//                 <button
//                   onClick={() => setActiveTab('file')}
//                   className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
//                     activeTab === 'file' 
//                       ? 'bg-primary text-primary-foreground' 
//                       : 'text-muted-foreground hover:text-foreground'
//                   }`}
//                 >
//                   <Upload className="w-4 h-4 mr-1 inline" />
//                   File
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Additional Text Input for Text Mode */}
//         {activeTab === 'text' && (
//           <div className="max-w-4xl mx-auto mb-12">
//             <div className="glass-strong rounded-2xl p-6">
//               <Textarea
//                 placeholder="Paste your article text here..."
//                 value={textInput}
//                 onChange={(e) => setTextInput(e.target.value)}
//                 rows={10}
//                 className="w-full bg-transparent border-border/50 resize-none text-foreground placeholder-muted-foreground"
//               />
//             </div>
//           </div>
//         )}

//         {/* Results Section */}
//         {analysis && (
//           <div className="max-w-4xl mx-auto">
//             <AnalysisResult
//               summary={analysis.summary}
//               keywords={analysis.keywords}
//               markdownContent={analysis.markdownContent}
//               onSave={handleSaveAnalysis}
//             />
//           </div>
//         )}

//         {/* Analysis Types Section */}
//         <div className="max-w-6xl mx-auto mt-20">
//           <div className="glass-strong rounded-3xl p-8">
//             <div className="flex justify-between items-start mb-8">
//               <div>
//                 <h2 className="text-3xl font-bold text-foreground mb-4">Our Analysis Types</h2>
//                 <p className="text-muted-foreground max-w-md">
//                   Here are our types of analysis tools that will help you in understanding content better
//                 </p>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {/* Beginner Analysis */}
//               <div className="glass rounded-2xl p-6 hover:scale-105 transition-transform">
//                 <div className="flex items-center justify-between mb-4">
//                   <div>
//                     <h3 className="text-xl font-semibold text-foreground">Quick</h3>
//                     <h4 className="text-xl font-semibold text-foreground">Analysis</h4>
//                   </div>
//                   <div className="bg-gradient-primary rounded-full p-2">
//                     <span className="text-white font-bold">→</span>
//                   </div>
//                 </div>
//                 <p className="text-sm text-muted-foreground mb-4">
//                   For those who want quick insights and summaries
//                 </p>
//                 <div className="bg-gradient-primary rounded-xl p-4 h-24 flex items-center justify-center">
//                   <Sparkles className="w-8 h-8 text-white" />
//                 </div>
//               </div>

//               {/* Expert Analysis */}
//               <div className="glass rounded-2xl p-6 hover:scale-105 transition-transform border-2 border-primary">
//                 <div className="flex items-center justify-between mb-4">
//                   <div>
//                     <h3 className="text-xl font-semibold text-foreground">Deep</h3>
//                     <h4 className="text-xl font-semibold text-foreground">Analysis</h4>
//                   </div>
//                   <div className="bg-gradient-primary rounded-full p-2">
//                     <span className="text-white font-bold">→</span>
//                   </div>
//                 </div>
//                 <p className="text-sm text-muted-foreground mb-4">
//                   For those who want comprehensive analysis and insights
//                 </p>
//                 <div className="bg-gradient-primary rounded-xl p-4 h-24 flex items-center justify-center">
//                   <FileText className="w-8 h-8 text-white" />
//                 </div>
//               </div>

//               {/* Professional Analysis */}
//               <div className="glass rounded-2xl p-6 hover:scale-105 transition-transform">
//                 <div className="flex items-center justify-between mb-4">
//                   <div>
//                     <h3 className="text-xl font-semibold text-foreground">Professional</h3>
//                     <h4 className="text-xl font-semibold text-foreground">Analysis</h4>
//                   </div>
//                   <div className="bg-gradient-primary rounded-full p-2">
//                     <span className="text-white font-bold">→</span>
//                   </div>
//                 </div>
//                 <p className="text-sm text-muted-foreground mb-4">
//                   For business users who need detailed reports
//                 </p>
//                 <div className="bg-gradient-primary rounded-xl p-4 h-24 flex items-center justify-center">
//                   <Upload className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//             </div>

//             <div className="text-center mt-12">
//               <h3 className="text-2xl font-bold text-foreground mb-2">
//                 KEEP <span className="gradient-text">ANALYZING</span> UNTIL YOU
//               </h3>
//               <h4 className="text-2xl font-bold text-foreground mb-4">
//                 FIND YOUR OWN <span className="gradient-text">INSIGHTS</span>
//               </h4>
//               <p className="text-muted-foreground">
//                 Powered by Google Gemini AI
//               </p>
//               <p className="text-muted-foreground">
//                 LiteRead Team
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default Home;
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AnalysisResult } from "@/components/AnalysisResult";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, FileText, Link as LinkIcon, Upload, Sparkles } from "lucide-react";
import { geminiService, AnalysisResult as GeminiAnalysisResult } from "@/services/geminiService";
import { analysisService } from "@/services/analysisService";

const Home = () => {
  const [activeTab, setActiveTab] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<GeminiAnalysisResult | null>(null);
  const { isAuthenticated } = useAuth();

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);

    try {
      let result: GeminiAnalysisResult;

      if (activeTab === "text") {
        if (!textInput.trim()) {
          toast.error("Please enter some text to analyze");
          return;
        }

        result = await geminiService.analyzeText(textInput, "text", textInput.substring(0, 100) + "...");
      } else if (activeTab === "url") {
        if (!urlInput.trim()) {
          toast.error("Please enter a URL to analyze");
          return;
        }

        const extractedText = await geminiService.extractTextFromUrl(urlInput);
        result = await geminiService.analyzeText(extractedText, "url", urlInput);
      } else if (activeTab === "file") {
        if (!file) {
          toast.error("Please upload a file to analyze");
          return;
        }

        const extractedText = await geminiService.extractTextFromFile(file);
        result = await geminiService.analyzeText(extractedText, "file", file.name);
      } else {
        throw new Error("Invalid tab selection");
      }

      setAnalysis(result);
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

    try {
      if (isAuthenticated) {
        // Save to backend if authenticated
        const title = analysis.summary.substring(0, 50) + (analysis.summary.length > 50 ? "..." : "");
        await analysisService.saveAnalysis({
          title,
          summary: analysis.summary,
          keywords: analysis.keywords,
          markdownContent: analysis.markdownContent,
          inputContent: analysis.inputContent,
          inputType: analysis.inputType as "text" | "url" | "file",
          originalUrl: activeTab === "url" ? urlInput : undefined,
          fileName: activeTab === "file" ? file?.name : undefined,
        });
        toast.success("Analysis saved to your library!");
      } else {
        // Save to localStorage for non-authenticated users
        const savedAnalyses = JSON.parse(localStorage.getItem("savedAnalyses") || "[]");
        const newAnalysis = {
          id: Date.now().toString(),
          ...analysis,
          createdAt: new Date().toISOString(),
        };

        savedAnalyses.unshift(newAnalysis);
        localStorage.setItem("savedAnalyses", JSON.stringify(savedAnalyses));

        toast.success("Analysis saved locally! Sign up to save permanently.");
      }
    } catch (error: any) {
      console.error("Save analysis error:", error);
      toast.error(error.message || "Failed to save analysis");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-6 pt-32 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">Read Smarter, Not Harder</h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Unlock the power of AI to analyze and summarize articles, documents, and web content. Get key insights in seconds.
          </p>

          {/* Main Input Section */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="flex items-center gap-4 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Paste URL, text, or upload a file..."
                  value={activeTab === "text" ? textInput : activeTab === "url" ? urlInput : file?.name || ""}
                  onChange={(e) => {
                    if (activeTab === "text") setTextInput(e.target.value);
                    if (activeTab === "url") setUrlInput(e.target.value);
                  }}
                  className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none text-lg"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".txt,.md,.csv,.json,.pdf,.docx"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] || null);
                    setActiveTab("file");
                  }}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="p-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </label>
                <Button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="bg-gradient-primary text-white px-8 py-3 rounded-xl font-medium hover:scale-105 transition-transform"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze"
                  )}
                </Button>
              </div>
            </div>

            {/* Tab Selector */}
            <div className="flex justify-center mt-4">
              <div className="flex bg-card/50 rounded-full p-1">
                <button
                  onClick={() => setActiveTab("text")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === "text" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText className="w-4 h-4 mr-1 inline" />
                  Text
                </button>
                <button
                  onClick={() => setActiveTab("url")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === "url" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LinkIcon className="w-4 h-4 mr-1 inline" />
                  URL
                </button>
                <button
                  onClick={() => setActiveTab("file")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === "file" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Upload className="w-4 h-4 mr-1 inline" />
                  File
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Text Input for Text Mode */}
        {activeTab === "text" && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="glass-strong rounded-2xl p-6">
              <Textarea
                placeholder="Paste your article text here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={10}
                className="w-full bg-transparent border-border/50 resize-none text-foreground placeholder-muted-foreground"
              />
            </div>
          </div>
        )}

        {/* Results Section */}
        {analysis && (
          <div className="max-w-4xl mx-auto">
            <AnalysisResult summary={analysis.summary} keywords={analysis.keywords} markdownContent={analysis.markdownContent} onSave={handleSaveAnalysis} />
          </div>
        )}

        {/* Analysis Types Section */}
        <div className="max-w-6xl mx-auto mt-20">
          <div className="glass-strong rounded-3xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Our Analysis Types</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Here is our range of analysis tools to help you learn and analyze content, from quick to professional reports.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Beginner Card */}
              <div className="bg-[#e9e9ea] rounded-2xl p-6 flex flex-col justify-between shadow-lg transition-transform hover:scale-105 border-2 border-transparent relative">
                <div className="absolute -top-5 -right-5 bg-[#e7722f] text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold shadow-lg">
                  <span>&#8594;</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-zinc-800">Beginner Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">For those who are just getting insights and starting with analysis</p>
                <div className="flex-1 flex items-center justify-center mb-4">
                  <Sparkles className="w-16 h-16 text-[#e7722f]" />
                </div>
              </div>
              {/* Expert Card */}
              <div className="bg-[#ff5100] rounded-2xl p-6 flex flex-col justify-between shadow-2xl hover:scale-105 relative border-2 border-[#e7722f]">
                <div className="absolute -top-5 -right-5 bg-[#e7722f] text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold shadow-lg">
                  <span>&#8594;</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Expert Analysis</h3>
                <p className="text-sm text-white/90 mb-4">For those who want to deep dive and gain advanced insights</p>
                <div className="flex-1 flex items-center justify-center mb-4">
                  <FileText className="w-16 h-16 text-white" />
                </div>
              </div>
              {/* Employee Card / Professional */}
              <div className="bg-[#e9e9ea] rounded-2xl p-6 flex flex-col justify-between shadow-lg transition-transform hover:scale-105 border-2 border-transparent relative">
                <div className="absolute -top-5 -right-5 bg-[#e7722f] text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold shadow-lg">
                  <span>&#8594;</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-zinc-800">Professional Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">For business users and professionals who need detailed, actionable reports</p>
                <div className="flex-1 flex items-center justify-center mb-4">
                  <Upload className="w-16 h-16 text-[#e7722f]" />
                </div>
              </div>
            </div>
            <div className="text-center mt-12">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                KEEP <span className="text-[#ff5100]">ANALYZING</span> UNTIL YOU
              </h3>
              <h4 className="text-2xl font-bold text-foreground mb-4">
                FIND YOUR OWN <span className="text-[#ff5100]">INSIGHTS</span>
              </h4>
              <p className="text-muted-foreground">Powered by Google Gemini AI</p>
              <p className="text-muted-foreground">LiteRead Team</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
