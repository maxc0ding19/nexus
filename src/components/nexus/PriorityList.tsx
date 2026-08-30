import { Check, Target } from "lucide-react";
import type { DailyPriority } from "@/types/nexus";
import { cn } from "@/lib/utils";
import { Panel, SectionLabel } from "./Panel";

export function PriorityList({ priorities, onToggle }: { priorities: DailyPriority[]; onToggle: (id: string) => void }) {
  return (
    <div>
      <SectionLabel detail={<span className="font-mono text-[9px] text-[#5f6769]">MAX 03</span>}>Today's priorities</SectionLabel>
      <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
        {priorities.map((priority, index) => (
          <Panel key={priority.id} interactive className={cn("group min-h-[146px] p-4", priority.completed && "opacity-55")}>
            <button onClick={() => onToggle(priority.id)} className="flex h-full w-full flex-col text-left" aria-label={`${priority.completed ? "Reopen" : "Complete"} ${priority.title}`}>
              <div className="flex w-full items-center justify-between">
                <span className="font-mono text-[9px] tracking-[0.14em] text-[#586063]">0{index + 1}</span>
                <span className={cn("flex h-6 w-6 items-center justify-center rounded-full border transition-colors", priority.completed ? "border-[#55c98b]/30 bg-[#55c98b] text-[#0b120e]" : "border-white/[0.11] text-transparent group-hover:border-white/25")}><Check className="h-3 w-3" strokeWidth={2.5} /></span>
              </div>
              <p className={cn("mt-5 text-sm font-medium leading-5 text-[#e3e6e4]", priority.completed && "line-through")}>{priority.title}</p>
              <p className="mt-1.5 text-xs leading-5 text-[#6f7779]">{priority.context}</p>
            </button>
          </Panel>
        ))}
      </div>
    </div>
  );
}
