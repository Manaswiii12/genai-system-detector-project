import { create } from "zustand";

export interface ResumeData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  experience: { title: string; company: string; duration?: string; description?: string }[];
  education: { degree: string; institution: string; year?: string }[];
  projects: { name: string; description?: string; technologies?: string[] }[];
  certifications?: string[];
}

export interface ATSScore {
  overall_score: number;
  keyword_match_score: number;
  formatting_score: number;
  section_completeness_score: number;
  experience_score?: number;
  skills_score?: number;
  missing_keywords: string[];
  weak_sections: string[];
  strengths?: string[];
  recommendations: string[];
}

export interface JobMatchResult {
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  recommended_skills: string[];
  job_required_skills: string[];
  skill_gap_priority?: { skill: string; priority: string; reason?: string }[];
  resume_tips?: string[];
}

export interface AISuggestion {
  id?: string;
  type: string;
  original?: string;
  improved: string;
  reason: string;
  applied?: boolean;
}

interface ResumeStore {
  resumeData: ResumeData | null;
  rawText: string;
  resumeId: string | null;
  atsScore: ATSScore | null;
  jobMatch: JobMatchResult | null;
  suggestions: AISuggestion[];
  isLoading: boolean;
  loadingMessage: string;
  setResumeData: (data: ResumeData) => void;
  setRawText: (text: string) => void;
  setResumeId: (id: string) => void;
  setATSScore: (score: ATSScore) => void;
  setJobMatch: (match: JobMatchResult) => void;
  setSuggestions: (suggestions: AISuggestion[]) => void;
  setLoading: (loading: boolean, message?: string) => void;
  reset: () => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  resumeData: null,
  rawText: "",
  resumeId: null,
  atsScore: null,
  jobMatch: null,
  suggestions: [],
  isLoading: false,
  loadingMessage: "",
  setResumeData: (data) => set({ resumeData: data }),
  setRawText: (text) => set({ rawText: text }),
  setResumeId: (id) => set({ resumeId: id }),
  setATSScore: (score) => set({ atsScore: score }),
  setJobMatch: (match) => set({ jobMatch: match }),
  setSuggestions: (suggestions) => set({ suggestions }),
  setLoading: (loading, message = "") => set({ isLoading: loading, loadingMessage: message }),
  reset: () =>
    set({
      resumeData: null,
      rawText: "",
      resumeId: null,
      atsScore: null,
      jobMatch: null,
      suggestions: [],
      isLoading: false,
      loadingMessage: "",
    }),
}));
