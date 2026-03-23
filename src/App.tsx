import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import ChatBot from "@/components/ChatBot";
import AuthPage from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import UploadResume from "@/pages/UploadResume";
import JobMatcher from "@/pages/JobMatcher";
import AIImprove from "@/pages/AIImprove";
import LiteratureSurvey from "@/pages/LiteratureSurvey";
import FakeDetector from "@/pages/FakeDetector";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthRoute><AuthPage /></AuthRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><UploadResume /></ProtectedRoute>} />
          <Route path="/job-matcher" element={<ProtectedRoute><JobMatcher /></ProtectedRoute>} />
          <Route path="/ai-improve" element={<ProtectedRoute><AIImprove /></ProtectedRoute>} />
          <Route path="/literature-survey" element={<ProtectedRoute><LiteratureSurvey /></ProtectedRoute>} />
          <Route path="/fake-detector" element={<ProtectedRoute><FakeDetector /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatBotWrapper />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

function ChatBotWrapper() {
  const { user } = useAuth();
  if (!user) return null;
  return <ChatBot />;
}

export default App;
