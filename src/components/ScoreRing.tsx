interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export default function ScoreRing({ score, size = 140, strokeWidth = 10, label = "ATS Score" }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 75) return "hsl(var(--score-high))";
    if (score >= 50) return "hsl(var(--score-mid))";
    return "hsl(var(--score-low))";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ "--score-offset": offset } as React.CSSProperties}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color: getColor() }}>{score}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
