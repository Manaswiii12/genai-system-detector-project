import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SkillTagsProps {
  skills: string[];
  matchedSkills?: string[];
  missingSkills?: string[];
  variant?: "default" | "matched" | "missing";
}

export default function SkillTags({ skills, matchedSkills = [], missingSkills = [], variant = "default" }: SkillTagsProps) {
  const getVariant = (skill: string) => {
    if (variant !== "default") return variant;
    const lower = skill.toLowerCase();
    if (matchedSkills.some((s) => s.toLowerCase() === lower)) return "matched";
    if (missingSkills.some((s) => s.toLowerCase() === lower)) return "missing";
    return "default";
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => {
        const v = getVariant(skill);
        return (
          <Badge
            key={skill}
            className={cn(
              "text-xs font-medium transition-all",
              v === "matched" && "bg-success/15 text-success border-success/30 hover:bg-success/25",
              v === "missing" && "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/25",
              v === "default" && "bg-secondary text-secondary-foreground"
            )}
            variant="outline"
          >
            {skill}
          </Badge>
        );
      })}
    </div>
  );
}
