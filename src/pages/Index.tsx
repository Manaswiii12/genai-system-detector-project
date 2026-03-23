import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  FileText, Target, Sparkles, ArrowRight, BarChart3,
  BookOpen, ShieldAlert, MessageCircle, Upload, Zap,
  TrendingUp, Search, Brain, CheckCircle2, Bot,
  Layers, Shield, Eye, Cpu, Star, ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

const modules = [
  {
    icon: BarChart3,
    badge: "ATS Engine",
    title: "Resume Analyzer & ATS Scorer",
    desc: "Upload PDF/DOCX resumes for AI-powered parsing. Extract name, skills, experience, education & projects. Get real ATS scores with keyword matching, section completeness, and formatting analysis.",
    highlights: [
      "NLP-powered data extraction",
      "ATS score 0–100% (real formula)",
      "Section-wise breakdown charts",
      "Missing keyword detection",
      "Industry benchmark comparison",
      "Structured JSON preview",
    ],
    gradient: "from-blue-600 via-blue-500 to-cyan-400",
    iconBg: "bg-blue-500",
    number: "01",
  },
  {
    icon: Target,
    badge: "Job Match",
    title: "Smart Job Description Matcher",
    desc: "Paste any job listing to get instant compatibility analysis. AI extracts required skills, compares against your profile, ranks skill gaps by priority, and generates personalized improvement roadmaps.",
    highlights: [
      "Real-time match score calculation",
      "Matched vs missing skill breakdown",
      "Priority-ranked skill gaps",
      "Personalized recommendations",
      "Results stored in database",
      "Visual analytics & charts",
    ],
    gradient: "from-violet-600 via-purple-500 to-fuchsia-400",
    iconBg: "bg-violet-500",
    number: "02",
  },
  {
    icon: BookOpen,
    badge: "Research",
    title: "Literature Survey Detection",
    desc: "Upload academic PDFs or paste text to automatically detect literature surveys. Extract methodologies, references, and summarized works with intelligent coverage depth assessment.",
    highlights: [
      "Auto-detect survey type",
      "Methodology extraction",
      "Reference analysis",
      "Coverage & depth scoring",
      "Research gap identification",
      "Actionable recommendations",
    ],
    gradient: "from-emerald-600 via-teal-500 to-cyan-400",
    iconBg: "bg-emerald-500",
    number: "03",
  },
  {
    icon: ShieldAlert,
    badge: "Detection",
    title: "Fake Content Detector",
    desc: "Analyze reviews or news articles with AI-powered authenticity detection. Identify suspicious patterns, assess language objectivity, rate sensationalism levels, and get fact-checking suggestions.",
    highlights: [
      "Authenticity confidence score",
      "Suspicious pattern flagging",
      "Severity-level indicators",
      "Language objectivity analysis",
      "Sensationalism rating",
      "Fact-check suggestions",
    ],
    gradient: "from-orange-600 via-red-500 to-rose-400",
    iconBg: "bg-orange-500",
    number: "04",
  },
];

const aiFeatures = [
  { icon: Sparkles, title: "AI Bullet Rewriter", desc: "Transform weak resume points into impactful achievements" },
  { icon: Brain, title: "Smart Summary Generator", desc: "Generate role-tailored professional summaries instantly" },
  { icon: Zap, title: "Action Verb Optimizer", desc: "Replace passive language with powerful action verbs" },
  { icon: Eye, title: "Real-time Processing", desc: "Instant analysis with live loading states & streaming" },
  { icon: Cpu, title: "Gemini AI Powered", desc: "Advanced language models for deep content understanding" },
  { icon: Layers, title: "Database Persistence", desc: "All analyses saved with full history & trend tracking" },
];

const stats = [
  { value: "4", label: "AI Engines" },
  { value: "100%", label: "Real Scores" },
  { value: "6+", label: "Analysis Types" },
  { value: "∞", label: "Improvements" },
];

const typingTexts = [
  "Analyzing your resume...",
  "Matching job descriptions...",
  "Detecting fake content...",
  "Surveying literature...",
];

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [typingIndex, setTypingIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTypingIndex((prev) => (prev + 1) % typingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <Cpu className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">Genius<span className="text-primary">AI</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
              Features
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(user ? "/dashboard" : "/auth")}
              className="gradient-primary text-primary-foreground font-semibold"
            >
              {user ? "Dashboard" : "Get Started"}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground relative overflow-hidden pt-16">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/8 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-28 md:py-40 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/20 rounded-full px-5 py-2 mb-8 text-sm backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Multi-Domain AI Platform — 4 Engines, One Interface
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-[0.95] tracking-tight">
              Analyze.<br />
              Match.<br />
              <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                Optimize.
              </span>
            </h1>

            <p className="text-lg md:text-xl opacity-60 max-w-2xl mb-4 leading-relaxed">
              Resume optimization, job matching, academic analysis, and fake content detection — powered by advanced AI with real scoring algorithms, not dummy data.
            </p>

            {/* Typing animation */}
            <div className="flex items-center gap-2 mb-10 h-8">
              <Bot className="w-4 h-4 opacity-50" />
              <span className="text-sm opacity-50 font-mono">{typingTexts[typingIndex]}</span>
              <span className="w-0.5 h-4 bg-primary-foreground/50 animate-pulse" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => navigate(user ? "/dashboard" : "/auth")}
                className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 font-bold px-10 h-14 text-base shadow-2xl shadow-white/10"
              >
                Launch Platform <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 font-semibold px-10 h-14 text-base backdrop-blur-sm"
              >
                See All Features
              </Button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-10 border-t border-primary-foreground/10">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-extrabold">{s.value}</div>
                <div className="text-sm opacity-50 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Modules */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-28">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-4">
            <Layers className="w-3.5 h-3.5" /> Platform Modules
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">
            Four Engines. Zero Guesswork.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Each module runs real AI algorithms with formula-based scoring, database persistence, and visual analytics.
          </p>
        </div>

        <div className="space-y-8">
          {modules.map((m, idx) => (
            <div
              key={m.title}
              className="group relative bg-card border border-border/60 rounded-3xl overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Left section */}
                <div className="lg:w-1/2 p-8 md:p-12">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-6xl font-black text-muted/30 select-none">{m.number}</span>
                    <div>
                      <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-gradient-to-r ${m.gradient} text-white`}>
                        {m.badge}
                      </span>
                    </div>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.gradient} flex items-center justify-center shadow-xl mb-6`}>
                    <m.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">{m.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{m.desc}</p>
                </div>
                {/* Right section - highlights */}
                <div className="lg:w-1/2 bg-secondary/30 p-8 md:p-12 flex items-center">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    {m.highlights.map((h) => (
                      <div key={h} className="flex items-start gap-3 bg-background/60 rounded-xl px-4 py-3 border border-border/40">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm font-medium">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Capabilities Grid */}
      <section className="bg-secondary/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" /> AI Capabilities
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">
              Built-in Intelligence
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Every feature is powered by real AI — no hardcoded values, no dummy scores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiFeatures.map((f) => (
              <div
                key={f.title}
                className="group bg-card border border-border/50 rounded-2xl p-7 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chatbot Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase mb-6">
              <Bot className="w-3.5 h-3.5" /> AI Assistant
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
              Multi-Domain<br />AI Chatbot
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              An intelligent assistant that routes queries across 4 specialized domains with context-aware responses using your actual data.
            </p>
            <div className="space-y-4">
              {[
                { domain: "Resume", query: "How can I improve my resume for FAANG?", color: "bg-blue-500" },
                { domain: "Research", query: "Summarize gaps in my literature survey", color: "bg-emerald-500" },
                { domain: "Detection", query: "Is this product review authentic?", color: "bg-orange-500" },
                { domain: "General", query: "Rewrite my project description professionally", color: "bg-violet-500" },
              ].map((q) => (
                <div key={q.query} className="flex items-center gap-4 bg-card rounded-2xl px-5 py-4 border border-border/50 hover:border-primary/20 transition-colors">
                  <span className={`${q.color} text-white text-[9px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shrink-0`}>
                    {q.domain}
                  </span>
                  <span className="text-sm text-muted-foreground">{q.query}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 ml-auto shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Chat preview mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-80 bg-card border border-border rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
              <div className="gradient-primary p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary-foreground text-sm">GeniusAI Assistant</h4>
                    <p className="text-primary-foreground/60 text-[10px]">Intelligent multi-domain routing</p>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-3">
                  {["General", "Resume", "Research", "Fake"].map((d, i) => (
                    <span
                      key={d}
                      className={`px-2.5 py-1 rounded-full text-[9px] font-semibold ${
                        i === 1 ? "bg-primary-foreground text-primary" : "bg-primary-foreground/15 text-primary-foreground/70"
                      }`}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 text-xs text-secondary-foreground max-w-[88%] leading-relaxed">
                  Hi! I'm your AI assistant. I can help with resumes, research papers, and content analysis. What would you like?
                </div>
                <div className="gradient-primary rounded-2xl rounded-br-md px-4 py-3 text-xs text-primary-foreground max-w-[80%] ml-auto">
                  Analyze my resume for a SDE role
                </div>
                <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 text-xs text-secondary-foreground max-w-[88%] leading-relaxed">
                  Based on your resume, I found <strong>3 key improvements</strong> for SDE roles...
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 bg-secondary/60 rounded-full px-4 py-2.5 text-[10px] text-muted-foreground">
                    Ask anything...
                  </div>
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="gradient-primary rounded-[2rem] p-14 md:p-20 text-center text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[80px]" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-5 tracking-tight">
              Ready to Get Smarter?
            </h2>
            <p className="opacity-70 mb-10 max-w-xl mx-auto text-lg">
              Four AI engines. Real algorithms. Production-ready analysis. Start for free.
            </p>
            <Button
              size="lg"
              onClick={() => navigate(user ? "/dashboard" : "/auth")}
              className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 font-bold px-12 h-14 text-base shadow-2xl shadow-black/20"
            >
              Launch GeniusAI <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Cpu className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Genius<span className="text-primary">AI</span></span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 GeniusAI — Multi-Domain AI Platform. Production-ready & built with ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}
