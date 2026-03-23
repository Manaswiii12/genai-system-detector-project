import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { FileText, LayoutDashboard, Upload, Briefcase, Sparkles, LogOut, BookOpen, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload Resume", icon: Upload },
  { to: "/job-matcher", label: "Job Matcher", icon: Briefcase },
  { to: "/ai-improve", label: "AI Improve", icon: Sparkles },
  { to: "/literature-survey", label: "Lit. Survey", icon: BookOpen },
  { to: "/fake-detector", label: "Fake Detector", icon: ShieldAlert },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Genius<span className="text-primary">AI</span></span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold">Genius<span className="text-primary">AI</span></span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
        <nav className="flex px-2 pb-2 gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground bg-secondary"
                )
              }
            >
              <item.icon className="w-3 h-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 md:p-6 p-4 pt-24 md:pt-6 overflow-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
