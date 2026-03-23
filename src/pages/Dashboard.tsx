import { useResumeStore } from "@/store/resumeStore";
import ScoreRing from "@/components/ScoreRing";
import SkillTags from "@/components/SkillTags";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  FileText, Target, TrendingUp, AlertTriangle, CheckCircle, Upload,
  Sparkles, BarChart3, Zap, ArrowUpRight, Brain, Layers, Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell
} from "recharts";

const quickActions = [
  { icon: Upload, label: "Upload Resume", to: "/upload", gradient: "from-blue-500 to-cyan-500" },
  { icon: Target, label: "Match a Job", to: "/job-matcher", gradient: "from-violet-500 to-purple-500" },
  { icon: Sparkles, label: "AI Improve", to: "/ai-improve", gradient: "from-amber-500 to-orange-500" },
  { icon: Brain, label: "Lit. Survey", to: "/literature-survey", gradient: "from-emerald-500 to-teal-500" },
];

export default function Dashboard() {
  const { resumeData, atsScore, jobMatch } = useResumeStore();
  const navigate = useNavigate();

  if (!resumeData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in">
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Upload className="w-12 h-12 text-primary" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-bounce">
            <ArrowUpRight className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold mb-3">Welcome to GeniusAI</h2>
        <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
          Upload your resume to unlock AI-powered ATS scoring, job matching, and intelligent improvement suggestions.
        </p>
        <Button size="lg" onClick={() => navigate("/upload")} className="gradient-primary text-primary-foreground font-semibold px-8 h-12">
          <Upload className="w-5 h-5 mr-2" /> Upload Your Resume
        </Button>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 w-full max-w-2xl">
          {quickActions.map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.to)}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <a.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const sectionData = atsScore
    ? [
        { name: "Keywords", score: atsScore.keyword_match_score, fill: "hsl(220, 70%, 55%)" },
        { name: "Format", score: atsScore.formatting_score, fill: "hsl(200, 80%, 50%)" },
        { name: "Sections", score: atsScore.section_completeness_score, fill: "hsl(165, 60%, 45%)" },
        { name: "Experience", score: atsScore.experience_score || 0, fill: "hsl(280, 60%, 55%)" },
        { name: "Skills", score: atsScore.skills_score || 0, fill: "hsl(38, 92%, 50%)" },
      ]
    : [];

  const radarData = sectionData.map((d) => ({ subject: d.name, A: d.score, fullMark: 100 }));

  const pieData = atsScore
    ? [
        { name: "Score", value: atsScore.overall_score },
        { name: "Gap", value: 100 - atsScore.overall_score },
      ]
    : [];

  const overallScore = atsScore?.overall_score || 0;
  const scoreColor = overallScore >= 70 ? "text-green-500" : overallScore >= 40 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Live Dashboard</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Analysis Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time insights from your resume analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/upload")}>
            <Upload className="w-4 h-4 mr-1" /> Re-upload
          </Button>
          <Button size="sm" onClick={() => navigate("/ai-improve")} className="gradient-primary text-primary-foreground">
            <Sparkles className="w-4 h-4 mr-1" /> Improve
          </Button>
        </div>
      </div>

      {/* Score Hero Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Score */}
        <Card className="md:col-span-4 glass-card overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <CardContent className="pt-8 pb-8 flex flex-col items-center relative z-10">
            <ScoreRing score={overallScore} size={180} />
            <div className="mt-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">Overall ATS Score</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Formula-based calculation</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Card */}
        <Card className="md:col-span-4 glass-card">
          <CardContent className="pt-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-primary-foreground">
                  {resumeData.name?.charAt(0) || "?"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg truncate">{resumeData.name}</p>
                <p className="text-sm text-muted-foreground truncate">{resumeData.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Skills", value: resumeData.skills.length, icon: Zap },
                { label: "Experience", value: resumeData.experience.length, icon: BarChart3 },
                { label: "Education", value: resumeData.education.length, icon: FileText },
                { label: "Projects", value: resumeData.projects?.length || 0, icon: Layers },
              ].map((stat) => (
                <div key={stat.label} className="bg-secondary/50 rounded-xl p-3 text-center">
                  <stat.icon className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Job Match Card */}
        <Card className="md:col-span-4 glass-card">
          <CardContent className="pt-6">
            {jobMatch ? (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1 mb-3">
                    <Target className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary">Job Match</span>
                  </div>
                  <p className="text-5xl font-extrabold text-primary">{jobMatch.match_score}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Compatibility Score</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-500/10 rounded-xl p-4 text-center border border-green-500/20">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{jobMatch.matched_skills.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Matched</p>
                  </div>
                  <div className="bg-red-500/10 rounded-xl p-4 text-center border border-red-500/20">
                    <AlertTriangle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{jobMatch.missing_skills.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Missing</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                  <Target className="w-8 h-8 text-violet-500" />
                </div>
                <div className="text-center">
                  <p className="font-medium mb-1">No Job Match Yet</p>
                  <p className="text-xs text-muted-foreground">Compare your resume against a job listing</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/job-matcher")}>
                  <Target className="w-4 h-4 mr-1" /> Match a Job
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Score Breakdown */}
      {atsScore && (
        <>
          {/* Section Score Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {sectionData.map((d) => {
              const scoreLevel = d.score >= 70 ? "text-green-500" : d.score >= 40 ? "text-yellow-500" : "text-red-500";
              return (
                <Card key={d.name} className="glass-card group hover:shadow-lg transition-all">
                  <CardContent className="pt-5 pb-5 text-center">
                    <p className={`text-3xl font-extrabold ${scoreLevel}`}>{d.score}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">{d.name}</p>
                    <Progress value={d.score} className="h-1.5 mt-3" />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" /> Section Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={sectionData} barCategoryGap="20%">
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                      {sectionData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Skills Radar Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <Radar dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Skills & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" /> Detected Skills
              <Badge variant="secondary" className="ml-auto text-xs">{resumeData.skills.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SkillTags skills={resumeData.skills} matchedSkills={jobMatch?.matched_skills} missingSkills={jobMatch?.missing_skills} />
          </CardContent>
        </Card>

        {atsScore && (
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-warning" /> AI Recommendations
                <Badge variant="secondary" className="ml-auto text-xs">{atsScore.recommendations.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {atsScore.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 bg-secondary/30 rounded-xl p-3 border border-border/40">
                    <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed">{r}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Missing keywords */}
      {atsScore && atsScore.missing_keywords.length > 0 && (
        <Card className="glass-card border-destructive/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" /> Missing Keywords
              <Badge variant="destructive" className="ml-auto text-xs">{atsScore.missing_keywords.length} gaps</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SkillTags skills={atsScore.missing_keywords} variant="missing" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
