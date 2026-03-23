import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useResumeStore, type AISuggestion } from "@/store/resumeStore";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Sparkles, Loader2, CheckCircle, AlertTriangle, Lightbulb,
  ArrowRight, Brain, Wand2, Zap, PenTool
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AIImprove() {
  const [loading, setLoading] = useState(false);
  const { resumeData, rawText, suggestions, setSuggestions, resumeId } = useResumeStore();
  const { user } = useAuth();
  const [summaryOpt, setSummaryOpt] = useState("");
  const [actionVerbs, setActionVerbs] = useState<string[]>([]);

  const handleImprove = async () => {
    if (!resumeData || !rawText || !user) {
      toast.error("Please upload a resume first.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-resume", {
        body: { resumeText: rawText, action: "improve" },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      const result = data.result;
      const newSuggestions: AISuggestion[] = (result.suggestions || []).map((s: any) => ({
        type: s.type, original: s.original || "", improved: s.improved, reason: s.reason, applied: false,
      }));
      setSuggestions(newSuggestions);
      setSummaryOpt(result.summary_suggestion || "");
      setActionVerbs(result.action_verbs || []);

      if (resumeId) {
        for (const s of newSuggestions) {
          await supabase.from("ai_suggestions").insert({
            user_id: user.id, resume_id: resumeId,
            suggestion_type: s.type, original_text: s.original, improved_text: s.improved,
          } as any);
        }
      }
      toast.success("AI suggestions generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate suggestions");
    } finally {
      setLoading(false);
    }
  };

  const typeConfig: Record<string, { icon: React.ElementType; gradient: string; label: string }> = {
    bullet_point: { icon: ArrowRight, gradient: "from-blue-500 to-cyan-500", label: "Bullet Point" },
    summary: { icon: Brain, gradient: "from-violet-500 to-purple-500", label: "Summary" },
    project: { icon: Zap, gradient: "from-emerald-500 to-teal-500", label: "Project" },
    skill: { icon: Sparkles, gradient: "from-amber-500 to-orange-500", label: "Skill" },
    general: { icon: Lightbulb, gradient: "from-pink-500 to-rose-500", label: "General" },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">AI Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Resume Enhancer</h1>
        <p className="text-muted-foreground mt-1">Get intelligent suggestions to strengthen every section of your resume</p>
      </div>

      {/* CTA Card */}
      <Card className="glass-card overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <CardContent className="pt-8 pb-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/20">
              <Wand2 className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-bold text-xl mb-2">Transform Your Resume</h3>
              <p className="text-muted-foreground leading-relaxed max-w-lg">
                Our AI analyzes each bullet point, project description, and summary — then rewrites them with stronger action verbs, quantifiable achievements, and role-specific language.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleImprove}
                disabled={loading || !resumeData}
                size="lg"
                className="gradient-primary text-primary-foreground h-12 px-8 font-semibold"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-5 h-5 mr-2" /> Generate Suggestions</>
                )}
              </Button>
              {!resumeData && (
                <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle className="w-4 h-4" /> Upload a resume first
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Suggestion */}
      {summaryOpt && (
        <Card className="glass-card animate-slide-up border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              Optimized Professional Summary
              <Badge className="ml-auto" variant="secondary">AI Generated</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed bg-primary/5 rounded-xl p-5 border border-primary/10">{summaryOpt}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Verbs */}
      {actionVerbs.length > 0 && (
        <Card className="glass-card animate-slide-up">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PenTool className="w-4 h-4 text-accent" /> Powerful Action Verbs
              <Badge variant="secondary" className="ml-auto text-[10px]">{actionVerbs.length} suggestions</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {actionVerbs.map((verb) => (
                <Badge key={verb} variant="outline" className="bg-accent/10 text-accent-foreground border-accent/20 px-3 py-1.5 text-sm font-medium">
                  {verb}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl">Improvement Suggestions</h3>
            <Badge variant="secondary">{suggestions.length} items</Badge>
          </div>
          {suggestions.map((s, i) => {
            const config = typeConfig[s.type] || typeConfig.general;
            const Icon = config.icon;
            return (
              <Card key={i} className="glass-card hover:shadow-lg transition-all group">
                <CardContent className="pt-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <Badge variant="outline" className="text-xs font-semibold capitalize">{config.label}</Badge>
                    <span className="text-xs text-muted-foreground ml-auto">#{i + 1}</span>
                  </div>

                  {s.original && (
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Original</p>
                      <p className="text-sm bg-red-500/5 rounded-xl p-4 border border-red-500/10 line-through opacity-60 leading-relaxed">
                        {s.original}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Improved</p>
                    <p className="text-sm bg-green-500/5 rounded-xl p-4 border border-green-500/10 leading-relaxed">
                      {s.improved}
                    </p>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/30 rounded-lg p-3">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                    {s.reason}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
