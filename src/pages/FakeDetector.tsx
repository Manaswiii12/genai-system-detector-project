import { useState } from "react";
import {
  ShieldAlert, ShieldCheck, AlertTriangle, Search, Eye,
  FileWarning, Scale, Brain, Newspaper, MessageSquare, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface SuspiciousPattern {
  pattern: string;
  severity: string;
  evidence?: string;
  explanation: string;
}

interface FakeAnalysis {
  verdict: string;
  confidence_score: number;
  authenticity_score: number;
  suspicious_patterns: SuspiciousPattern[];
  language_analysis: {
    tone: string;
    objectivity_score: number;
    sensationalism_level: string;
  };
  fact_check_suggestions?: string[];
  summary: string;
}

export default function FakeDetector() {
  const [text, setText] = useState("");
  const [contentType, setContentType] = useState<"review" | "news">("review");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FakeAnalysis | null>(null);
  const { toast } = useToast();

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect-fake`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text, type: contentType }),
      });
      if (!resp.ok) throw new Error((await resp.json().catch(() => ({}))).error || "Detection failed");
      setResult(await resp.json());
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const verdictConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
    "Likely Genuine": { icon: <ShieldCheck className="w-10 h-10" />, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30" },
    "Suspicious": { icon: <AlertTriangle className="w-10 h-10" />, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
    "Likely Fake": { icon: <ShieldAlert className="w-10 h-10" />, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
  };

  const severityConfig: Record<string, string> = {
    Low: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    Medium: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    High: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Detection Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Fake Content Detector</h1>
        <p className="text-muted-foreground mt-1">Analyze reviews or news articles for authenticity with AI-powered pattern detection</p>
      </div>

      {/* Input */}
      <Card className="glass-card overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5" />
        <CardContent className="pt-6 space-y-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">Analyze Content</p>
              <p className="text-xs text-muted-foreground">Select type and paste the text to verify</p>
            </div>
          </div>

          <Tabs value={contentType} onValueChange={(v) => setContentType(v as "review" | "news")}>
            <TabsList className="bg-secondary">
              <TabsTrigger value="review" className="gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Product Review
              </TabsTrigger>
              <TabsTrigger value="news" className="gap-1.5">
                <Newspaper className="w-3.5 h-3.5" /> News Article
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={contentType === "review" ? "Paste the product review text here..." : "Paste the news article text here..."}
            className="min-h-[180px] text-sm"
          />

          <Button onClick={analyze} disabled={loading || !text.trim()} className="gradient-primary text-primary-foreground h-12 font-semibold w-full sm:w-auto px-8">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" /> Analyzing...</>
            ) : (
              <><Shield className="w-5 h-5 mr-2" /> Detect Fake Content</>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6 animate-slide-up">
          {/* Verdict */}
          <Card className={`glass-card border-2 ${verdictConfig[result.verdict]?.border || "border-border"}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-6 flex-wrap">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${verdictConfig[result.verdict]?.bg}`}>
                  <span className={verdictConfig[result.verdict]?.color}>{verdictConfig[result.verdict]?.icon}</span>
                </div>
                <div className="flex-1">
                  <h2 className={`text-2xl font-extrabold ${verdictConfig[result.verdict]?.color}`}>{result.verdict}</h2>
                  <p className="text-sm text-muted-foreground mt-1">Confidence: {result.confidence_score}%</p>
                </div>
                <div className="text-center bg-primary/5 rounded-2xl px-6 py-4 border border-primary/10">
                  <div className="text-4xl font-extrabold text-primary">{result.authenticity_score}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Authenticity</p>
                </div>
              </div>
              <p className="mt-5 text-sm text-muted-foreground leading-relaxed bg-secondary/30 rounded-xl p-4">{result.summary}</p>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Language Analysis */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" /> Language Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tone</span>
                  <Badge variant="outline" className="font-medium">{result.language_analysis.tone}</Badge>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Objectivity</span>
                    <span className="font-bold text-primary">{result.language_analysis.objectivity_score}%</span>
                  </div>
                  <Progress value={result.language_analysis.objectivity_score} className="h-2" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sensationalism</span>
                  <Badge variant={
                    result.language_analysis.sensationalism_level === "None" || result.language_analysis.sensationalism_level === "Low"
                      ? "secondary"
                      : "destructive"
                  }>{result.language_analysis.sensationalism_level}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Suspicious Patterns */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileWarning className="w-4 h-4 text-orange-500" /> Suspicious Patterns
                  <Badge variant="outline" className="ml-auto text-[10px]">{result.suspicious_patterns.length} found</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.suspicious_patterns.length === 0 ? (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    No suspicious patterns detected
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {result.suspicious_patterns.map((p, i) => (
                      <div key={i} className="bg-secondary/30 rounded-xl p-4 border border-border/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{p.pattern}</span>
                          <Badge variant="outline" className={severityConfig[p.severity] || ""}>{p.severity}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{p.explanation}</p>
                        {p.evidence && <p className="text-xs italic text-muted-foreground/60 bg-background/50 rounded-lg p-2">"{p.evidence}"</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Fact Check */}
          {result.fact_check_suggestions && result.fact_check_suggestions.length > 0 && (
            <Card className="glass-card border-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" /> Claims to Fact-Check
                  <Badge variant="secondary" className="ml-auto text-[10px]">{result.fact_check_suggestions.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.fact_check_suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 bg-primary/5 rounded-xl p-3 border border-primary/10">
                      <Search className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                      <p className="text-sm leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
