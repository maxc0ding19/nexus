import { Check, ChevronRight, Circle, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionDefinition } from "@/types/nexus";
import { Panel, SectionLabel } from "./Panel";

export function ActionList({ actions, completedIds, onToggle }: { actions: ActionDefinition[]; completedIds: Set<string>; onToggle: (id: string) => void }) {
  const completedCount = actions.filter((action) => completedIds.has(action.id)).length;

  return (
    <div>
      <SectionLabel detail={<span className="font-mono text-[9px] text-[#808789]">{completedCount}/{actions.length} COMPLETE</span>}>Today's actions</SectionLabel>
      <Panel className="mt-3 divide-y divide-white/[0.055] overflow-hidden">
        {actions.map((action) => {
          const completed = completedIds.has(action.id);
          return (
            <button key={action.id} onClick={() => onToggle(action.id)} className="group flex w-full items-center gap-3.5 px-4 py-4 text-left transition-colors hover:bg-white/[0.025] sm:px-5">
              <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all", completed ? "border-[#55c98b] bg-[#55c98b] text-[#0a120d]" : "border-white/[0.13] text-transparent group-hover:border-white/30")}>
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-medium text-[#dfe3e1]", completed && "text-[#6e7677] line-through")}>{action.name}</p>
                <div className="mt-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.11em] text-[#5e6668]">
                  <span>{action.type}</span><Circle className="h-1 w-1 fill-current" />
                  <span>{action.target} {action.unit}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#5f6769]">
                {action.reminder && <><Clock3 className="h-3 w-3" /><span className="hidden font-mono text-[9px] sm:inline">{action.reminder}</span></>}
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </button>
          );
        })}
      </Panel>
    </div>
  );
}
