import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/store/resumeStore";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Briefcase, Loader2, CheckCircle, ArrowRight, AlertTriangle,
  Target, TrendingUp, Zap, Shield, BarChart3
} from "lucide-react";
import SkillTags from "@/components/SkillTags";
import ScoreRing from "@/components/ScoreRing";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function JobMatcher() {
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const { resumeData, rawText, setJobMatch, jobMatch, resumeId } = useResumeStore();
  const { user } = useAuth();

  const handleMatch = async () => {
    if (!jobDesc.trim() || !resumeData || !user) {
      toast.error("Please upload a resume first and enter a job description.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("match-job", {
        body: { resumeSkills: resumeData.skills, resumeText: rawText, jobDescription: jobDesc },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      setJobMatch(data.result);

      const { data: savedJob } = await supabase.from("job_descriptions").insert({
        user_id: user.id, title: "Job Match", description: jobDesc,
        required_skills: data.result.job_required_skills || [],
      } as any).select().single();

      if (savedJob && resumeId) {
        await supabase.from("match_results").insert({
          user_id: user.id, resume_id: resumeId,
          job_description_id: (savedJob as any).id,
          match_score: data.result.match_score,
          matched_skills: data.result.matched_skills,
          missing_skills: data.result.missing_skills,
          recommendations: data.result.resume_tips || [],
        } as any);
      }
      toast.success("Job match analysis complete!");
    } catch (e: any) {
      toast.error(e.message || "Match failed");
    } finally {
      setLoading(false);
    }
  };

  const priorityData = jobMatch?.skill_gap_priority?.map((s) => ({
    skill: s.skill,
    priority: s.priority === "high" ? 100 : s.priority === "medium" ? 60 : 30,
    fill: s.priority === "high" ? "hsl(0, 72%, 55%)" : s.priority === "medium" ? "hsl(38, 92%, 50%)" : "hsl(165, 60%, 42%)",
  })) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Job Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Job Description Matcher</h1>
        <p className="text-muted-foreground mt-1">Compare your resume against any job listing for instant compatibility analysis</p>
      </div>

      <Card className="glass-card">
        <CardContent className="pt-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">Paste Job Description</p>
              <p className="text-xs text-muted-foreground">Include the full listing for best results</p>
            </div>
          </div>

          <Textarea
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste the full job description here — responsibilities, requirements, qualifications..."
            className="min-h-[200px] text-sm"
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleMatch}
              disabled={loading || !jobDesc.trim() || !resumeData}
              className="flex-1 gradient-primary text-primary-foreground h-12 text-base font-semibold"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Match...</>
              ) : (
                <><Target className="w-5 h-5 mr-2" /> Analyze Compatibility</>
              )}
            </Button>
          </div>

          {!resumeData && (
            <div className="flex items-center gap-3 bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
              <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
              <p className="text-sm text-muted-foreground">Upload a resume first to enable job matching</p>
            </div>
          )}
        </CardContent>
      </Card>

      {jobMatch && (
        <div className="space-y-6 animate-slide-up">
          {/* Score + Stats */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <Card className="md:col-span-4 glass-card overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5" />
              <CardContent className="pt-8 pb-8 flex flex-col items-center relative z-10">
                <ScoreRing score={jobMatch.match_score} label="Job Match" size={180} />
              </CardContent>
            </Card>

            <Card className="md:col-span-4 glass-card">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <h3 className="font-semibold text-sm">Matched Skills</h3>
                  <Badge className="ml-auto bg-green-500/10 text-green-600 border-green-500/20" variant="outline">{jobMatch.matched_skills.length}</Badge>
                </div>
                <SkillTags skills={jobMatch.matched_skills} variant="matched" />
              </CardContent>
            </Card>

            <Card className="md:col-span-4 glass-card">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <h3 className="font-semibold text-sm">Missing Skills</h3>
                  <Badge className="ml-auto bg-red-500/10 text-red-600 border-red-500/20" variant="outline">{jobMatch.missing_skills.length}</Badge>
                </div>
                <SkillTags skills={jobMatch.missing_skills} variant="missing" />
              </CardContent>
            </Card>
          </div>

          {/* Recommended Skills */}
          {jobMatch.recommended_skills.length > 0 && (
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" /> Recommended Skills to Learn
                  <Badge variant="secondary" className="ml-auto text-[10px]">{jobMatch.recommended_skills.length} suggestions</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SkillTags skills={jobMatch.recommended_skills} />
              </CardContent>
            </Card>
          )}

          {/* Skill Gap Priority */}
          {priorityData.length > 0 && (
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Skill Gap Priority Ranking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={Math.max(200, priorityData.length * 40)}>
                  <BarChart data={priorityData} layout="vertical" barCategoryGap="25%">
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="skill" type="category" width={130} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="priority" radius={[0, 8, 8, 0]}>
                      {priorityData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Resume Tips */}
          {jobMatch.resume_tips && jobMatch.resume_tips.length > 0 && (
            <Card className="glass-card border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" /> Resume Tips for This Job
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jobMatch.resume_tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 bg-secondary/30 rounded-xl p-4 border border-border/40">
                      <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed">{tip}</p>
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
