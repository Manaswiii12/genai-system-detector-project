import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload, FileText, CheckCircle, Loader2, ArrowRight,
  Sparkles, Brain, BarChart3, Shield, Zap, Eye
} from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import SkillTags from "@/components/SkillTags";
import ScoreRing from "@/components/ScoreRing";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

const processingSteps = [
  { key: "reading", icon: Eye, label: "Reading file contents", desc: "Extracting text from your document" },
  { key: "parsing", icon: Brain, label: "AI parsing resume", desc: "Extracting skills, experience & education" },
  { key: "scoring", icon: BarChart3, label: "Calculating ATS score", desc: "Keyword matching & section analysis" },
  { key: "saving", icon: Shield, label: "Saving to database", desc: "Persisting your analysis results" },
  { key: "done", icon: CheckCircle, label: "Analysis complete!", desc: "Your resume has been fully analyzed" },
];

export default function UploadResume() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState<"idle" | "reading" | "parsing" | "scoring" | "saving" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const { setResumeData, setRawText, setResumeId, setATSScore, resumeData, atsScore } = useResumeStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const textParts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      textParts.push(pageText);
    }
    return textParts.join("\n");
  };

  const readFileText = async (file: File): Promise<string> => {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      return extractTextFromPDF(file);
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || "");
      reader.readAsText(file);
    });
  };

  const handleUpload = useCallback(async () => {
    if (!file || !user) return;
    try {
      setStep("reading");
      setProgress(10);
      const text = await readFileText(file);
      const cleanText = text.replace(/\u0000/g, "");
      if (!cleanText.trim()) {
        toast.error("Could not extract text. Try a different format.");
        setStep("idle");
        return;
      }
      setRawText(cleanText);
      setProgress(25);

      setStep("parsing");
      setProgress(35);
      const { data: parseResult, error: parseError } = await supabase.functions.invoke("analyze-resume", {
        body: { resumeText: cleanText, action: "parse" },
      });
      if (parseError || parseResult?.error) throw new Error(parseResult?.error || parseError?.message || "Parse failed");
      const parsed = parseResult.result;
      setResumeData({
        name: parsed.name || "", email: parsed.email || "", phone: parsed.phone || "",
        location: parsed.location || "", summary: parsed.summary || "",
        skills: parsed.skills || [], experience: parsed.experience || [],
        education: parsed.education || [], projects: parsed.projects || [],
        certifications: parsed.certifications || [],
      });
      setProgress(55);

      setStep("scoring");
      setProgress(65);
      const { data: atsResult, error: atsError } = await supabase.functions.invoke("analyze-resume", {
        body: { resumeText: cleanText, action: "ats_score" },
      });
      if (atsError || atsResult?.error) throw new Error(atsResult?.error || atsError?.message || "ATS scoring failed");
      setATSScore(atsResult.result);
      setProgress(80);

      setStep("saving");
      setProgress(90);
      const { data: savedResume, error: saveError } = await supabase.from("resumes").insert({
        user_id: user.id, file_name: file.name, raw_text: cleanText,
        parsed_data: parsed, skills: parsed.skills || [],
        ats_score: atsResult.result.overall_score,
        section_scores: {
          keyword_match: atsResult.result.keyword_match_score,
          formatting: atsResult.result.formatting_score,
          section_completeness: atsResult.result.section_completeness_score,
          experience: atsResult.result.experience_score,
          skills: atsResult.result.skills_score,
        },
      } as any).select().single();
      if (saveError) throw saveError;
      if (savedResume) setResumeId((savedResume as any).id);

      setProgress(100);
      setStep("done");
      toast.success("Resume analyzed successfully!");
    } catch (e: any) {
      console.error("Upload error:", e);
      toast.error(e.message || "Something went wrong");
      setStep("idle");
      setProgress(0);
    }
  }, [file, user, setResumeData, setRawText, setResumeId, setATSScore]);

  const currentStepIndex = processingSteps.findIndex((s) => s.key === step);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Upload Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Upload Resume</h1>
        <p className="text-muted-foreground mt-1">Drop your resume for AI-powered parsing, scoring, and analysis</p>
      </div>

      {/* Upload Zone */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="pt-6">
          <label
            htmlFor="file-upload"
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const droppedFile = e.dataTransfer.files?.[0];
              if (droppedFile) { setFile(droppedFile); setStep("idle"); setProgress(0); }
            }}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-14 cursor-pointer transition-all duration-300 ${
              dragOver
                ? "border-primary bg-primary/10 scale-[1.01]"
                : file
                ? "border-primary/40 bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-primary/5"
            }`}
          >
            {file ? (
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-lg">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB • Ready to analyze</p>
                </div>
                <Badge variant="outline" className="text-primary border-primary/30">Selected</Badge>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-5">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <p className="font-semibold text-lg mb-1">Drop your resume here</p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
                <div className="flex gap-2">
                  {["PDF", "TXT", "DOCX"].map((fmt) => (
                    <Badge key={fmt} variant="secondary" className="text-[10px] font-semibold">{fmt}</Badge>
                  ))}
                </div>
              </>
            )}
            <input
              id="file-upload"
              type="file"
              accept=".txt,.pdf,.docx,.doc"
              className="hidden"
              onChange={(e) => { setFile(e.target.files?.[0] || null); setStep("idle"); setProgress(0); }}
            />
          </label>

          {file && step === "idle" && (
            <Button onClick={handleUpload} className="w-full mt-6 gradient-primary text-primary-foreground h-12 text-base font-semibold">
              <Sparkles className="w-5 h-5 mr-2" /> Analyze Resume with AI
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Processing Pipeline */}
      {step !== "idle" && (
        <Card className="glass-card overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold">Processing Pipeline</p>
                <p className="text-xs text-muted-foreground">AI is analyzing your resume in real-time</p>
              </div>
              <div className="ml-auto">
                <Badge variant="outline" className="font-mono text-xs">{progress}%</Badge>
              </div>
            </div>

            <Progress value={progress} className="h-2 mb-6" />

            <div className="space-y-3">
              {processingSteps.map((s, i) => {
                const isActive = s.key === step;
                const isDone = currentStepIndex > i || step === "done";
                const isPending = currentStepIndex < i && step !== "done";
                return (
                  <div
                    key={s.key}
                    className={`flex items-center gap-4 rounded-xl p-4 transition-all duration-500 ${
                      isActive ? "bg-primary/10 border border-primary/20" :
                      isDone ? "bg-secondary/30" : "opacity-40"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isDone ? "bg-green-500/10" : isActive ? "bg-primary/20" : "bg-secondary"
                    }`}>
                      {isDone ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : isActive ? (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      ) : (
                        <s.icon className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isDone ? "text-green-600 dark:text-green-400" : isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {s.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                    {isDone && <Badge variant="outline" className="text-green-500 border-green-500/20 text-[10px]">Done</Badge>}
                    {isActive && <Badge variant="outline" className="text-primary border-primary/20 text-[10px] animate-pulse">Running</Badge>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {step === "done" && resumeData && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-slide-up">
          {/* Parsed Data */}
          <Card className="lg:col-span-3 glass-card">
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">Parsed Resume Data</h3>
                <Badge variant="secondary" className="ml-auto text-[10px]">AI Extracted</Badge>
              </div>

              <div className="flex items-center gap-4 bg-secondary/30 rounded-xl p-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-foreground">{resumeData.name?.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-lg">{resumeData.name}</p>
                  <p className="text-sm text-muted-foreground">{resumeData.email} {resumeData.phone && `• ${resumeData.phone}`}</p>
                </div>
              </div>

              {resumeData.summary && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Professional Summary</p>
                  <p className="text-sm bg-primary/5 rounded-xl p-4 border border-primary/10 leading-relaxed">{resumeData.summary}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Skills <Badge variant="secondary" className="ml-1 text-[10px]">{resumeData.skills.length}</Badge>
                </p>
                <SkillTags skills={resumeData.skills} />
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Experience</p>
                <div className="space-y-3">
                  {resumeData.experience.map((exp, i) => (
                    <div key={i} className="flex items-start gap-3 bg-secondary/20 rounded-xl p-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <BarChart3 className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{exp.title} <span className="text-muted-foreground">@ {exp.company}</span></p>
                        {exp.duration && <p className="text-xs text-muted-foreground">{exp.duration}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score + Actions */}
          <Card className="lg:col-span-2 glass-card">
            <CardContent className="pt-6 flex flex-col items-center gap-6">
              {atsScore && <ScoreRing score={atsScore.overall_score} size={180} />}
              <div className="w-full space-y-3">
                <Button onClick={() => navigate("/dashboard")} className="w-full gradient-primary text-primary-foreground h-11">
                  <BarChart3 className="w-4 h-4 mr-2" /> View Full Dashboard
                </Button>
                <Button onClick={() => navigate("/job-matcher")} variant="outline" className="w-full h-11">
                  <ArrowRight className="w-4 h-4 mr-2" /> Match a Job Description
                </Button>
                <Button onClick={() => navigate("/ai-improve")} variant="outline" className="w-full h-11">
                  <Sparkles className="w-4 h-4 mr-2" /> Get AI Improvements
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
