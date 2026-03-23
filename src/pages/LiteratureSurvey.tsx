import { useState } from "react";
import {
  BookOpen, Upload, FileText, AlertTriangle, CheckCircle,
  Layers, Search, Brain, Eye, Microscope, Library
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

interface LiteratureAnalysis {
  is_literature_survey: boolean;
  confidence: number;
  document_type: string;
  title?: string;
  summary: string;
  key_sections: {
    methodologies: string[];
    references_found: number;
    summarized_works: { author?: string; topic: string }[];
  };
  coverage_analysis: {
    topics_covered: string[];
    depth_rating: string;
    relevance_score: number;
  };
  gaps: string[];
  recommendations: string[];
}

export default function LiteratureSurvey() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LiteratureAnalysis | null>(null);
  const { toast } = useToast();

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return fullText.replace(/\u0000/g, "");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const content = file.type === "application/pdf" ? await extractTextFromPDF(file) : await file.text();
      setText(content);
      toast({ title: "File loaded", description: `${file.name} ready for analysis.` });
    } catch {
      toast({ title: "Error", description: "Failed to read file.", variant: "destructive" });
    }
  };

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-literature`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text }),
      });
      if (!resp.ok) throw new Error((await resp.json().catch(() => ({}))).error || "Analysis failed");
      setResult(await resp.json());
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Research Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Literature Survey Detection</h1>
        <p className="text-muted-foreground mt-1">Upload academic documents to analyze structure, coverage depth, and research gaps</p>
      </div>

      {/* Upload Card */}
      <Card className="glass-card overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />
        <CardContent className="pt-6 space-y-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Microscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">Input Document</p>
              <p className="text-xs text-muted-foreground">Upload PDF/TXT or paste academic text</p>
            </div>
          </div>

          <div className="flex gap-3">
            <label className="cursor-pointer">
              <input type="file" accept=".pdf,.txt,.md,.tex" className="hidden" onChange={handleFileUpload} />
              <Button variant="outline" asChild>
                <span><Upload className="w-4 h-4 mr-2" /> Upload File</span>
              </Button>
            </label>
            {text && <Badge variant="secondary" className="flex items-center gap-1"><FileText className="w-3 h-3" /> {text.length.toLocaleString()} chars</Badge>}
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Or paste your academic document text here..."
            className="min-h-[200px] font-mono text-xs"
          />

          <Button onClick={analyze} disabled={loading || !text.trim()} className="gradient-primary text-primary-foreground h-12 font-semibold w-full sm:w-auto px-8">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" /> Analyzing...</>
            ) : (
              <><Search className="w-5 h-5 mr-2" /> Analyze Document</>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6 animate-slide-up">
          {/* Verdict */}
          <Card className={`glass-card border-2 ${result.is_literature_survey ? "border-green-500/30" : "border-yellow-500/30"}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-6 flex-wrap">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${result.is_literature_survey ? "bg-green-500/10" : "bg-yellow-500/10"}`}>
                  {result.is_literature_survey ? <CheckCircle className="w-10 h-10 text-green-500" /> : <AlertTriangle className="w-10 h-10 text-yellow-500" />}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-extrabold">
                    {result.is_literature_survey ? "Literature Survey Detected" : "Not a Literature Survey"}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant="outline">{result.document_type}</Badge>
                    {result.title && <span className="text-sm text-muted-foreground">{result.title}</span>}
                  </div>
                </div>
                <div className="text-center bg-primary/5 rounded-2xl px-6 py-4 border border-primary/10">
                  <div className="text-4xl font-extrabold text-primary">{result.confidence}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Confidence</p>
                </div>
              </div>
              <p className="mt-5 text-sm text-muted-foreground leading-relaxed bg-secondary/30 rounded-xl p-4">{result.summary}</p>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Coverage */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" /> Coverage Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Relevance Score</span>
                    <span className="font-bold text-primary">{result.coverage_analysis.relevance_score}%</span>
                  </div>
                  <Progress value={result.coverage_analysis.relevance_score} className="h-2" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Depth Rating</span>
                  <Badge className={
                    result.coverage_analysis.depth_rating === "Comprehensive" || result.coverage_analysis.depth_rating === "Deep"
                      ? "bg-green-500/10 text-green-600 border-green-500/20"
                      : result.coverage_analysis.depth_rating === "Moderate"
                      ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                      : "bg-red-500/10 text-red-600 border-red-500/20"
                  } variant="outline">{result.coverage_analysis.depth_rating}</Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Topics Covered</p>
                  <div className="flex flex-wrap gap-2">
                    {result.coverage_analysis.topics_covered.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Sections */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Library className="w-4 h-4 text-primary" /> Key Sections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary/30 rounded-xl p-4 text-center">
                  <p className="text-3xl font-extrabold text-primary">{result.key_sections.references_found}</p>
                  <p className="text-xs text-muted-foreground mt-1">References Found</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Methodologies</p>
                  <div className="flex flex-wrap gap-2">
                    {result.key_sections.methodologies.map((m) => (
                      <Badge key={m} variant="outline" className="text-xs bg-accent/10 border-accent/20">{m}</Badge>
                    ))}
                  </div>
                </div>
                {result.key_sections.summarized_works.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Summarized Works</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {result.key_sections.summarized_works.slice(0, 8).map((w, i) => (
                        <div key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="w-5 h-5 rounded bg-secondary flex items-center justify-center shrink-0 text-[10px] font-bold">{i+1}</span>
                          {w.author ? <span><strong>{w.author}:</strong> {w.topic}</span> : w.topic}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gaps */}
            <Card className="glass-card border-red-500/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Identified Gaps
                  <Badge variant="destructive" className="ml-auto text-[10px]">{result.gaps.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.gaps.map((g, i) => (
                    <div key={i} className="flex items-start gap-3 bg-red-500/5 rounded-xl p-3 border border-red-500/10">
                      <AlertTriangle className="w-4 h-4 mt-0.5 text-red-500 shrink-0" />
                      <p className="text-sm leading-relaxed">{g}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="glass-card border-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" /> Recommendations
                  <Badge variant="secondary" className="ml-auto text-[10px]">{result.recommendations.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.recommendations.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 bg-primary/5 rounded-xl p-3 border border-primary/10">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                      <p className="text-sm leading-relaxed">{r}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
