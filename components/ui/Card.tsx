import { cn } from "@/lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}

const pads = { sm: "p-4", md: "p-6", lg: "p-8" };

export function Card({ children, className, padding = "md", style }: CardProps) {
  return (
    <div style={style} className={cn("bg-ink-surface rounded-xl border border-white/[0.08] transition-all duration-300", pads[padding], className)}>
      {children}
    </div>
  );
}
