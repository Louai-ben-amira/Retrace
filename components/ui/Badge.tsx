import { cn } from "@/lib/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "brand" | "amber" | "rose" | "stone";
  className?: string;
}

const variants = {
  default: "bg-white/10 text-cream/70",
  brand:   "bg-brand-500/15 text-brand-400",
  amber:   "bg-amber-400/15 text-amber-300",
  rose:    "bg-rose-400/15 text-rose-300",
  stone:   "bg-white/10 text-cream/50",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full", variants[variant], className)}>
      {children}
    </span>
  );
}
