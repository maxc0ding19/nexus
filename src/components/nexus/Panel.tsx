import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}

export function Panel({ children, className, interactive = false }: PanelProps) {
  return (
    <section
      className={cn(
        "rounded-[1.4rem] border border-white/[0.075] bg-[#111416]/90 shadow-[0_18px_55px_rgba(0,0,0,0.24)] backdrop-blur-xl",
        interactive && "transition-colors duration-200 hover:border-white/[0.13] hover:bg-[#141719]",
        className,
      )}
    >
      {children}
    </section>
  );
}

interface SectionLabelProps {
  children: ReactNode;
  detail?: ReactNode;
  className?: string;
}

export function SectionLabel({ children, detail, className }: SectionLabelProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#737a7d]">{children}</p>
      {detail}
    </div>
  );
}
