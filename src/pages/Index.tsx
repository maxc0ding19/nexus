import { useState } from "react";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { ActionCompletionDrawer } from "@/components/actions/ActionCompletionDrawer";
import { ActionList } from "@/components/nexus/ActionList";
import { Panel, SectionLabel } from "@/components/nexus/Panel";
import { PriorityList } from "@/components/nexus/PriorityList";
import { RecoveryOverview } from "@/components/nexus/RecoveryOverview";
import { SystemSummary } from "@/components/nexus/SystemSummary";
import { useNexus } from "@/hooks/use-nexus";
import type { ActionDefinition } from "@/types/nexus";

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const Index = () => {
  const { state, actionsToday, completedActionIds, prioritiesToday, toggleAction, completeAction, togglePriority } = useNexus();
  const [selectedAction, setSelectedAction] = useState<ActionDefinition | undefined>();
  const [completionOpen, setCompletionOpen] = useState(false);
  const nextAction = actionsToday.find((action) => !completedActionIds.has(action.id));
  const completedCount = actionsToday.filter((action) => completedActionIds.has(action.id)).length;
  const completion = actionsToday.length ? Math.round((completedCount / actionsToday.length) * 100) : 0;
  const dateLabel = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  const actOn = (action: ActionDefinition) => {
    if (action.type === "boolean" || action.type === "avoidance") toggleAction(action.id);
    else { setSelectedAction(action); setCompletionOpen(true); }
  };

  return (
    <div className="animate-[enter_380ms_ease-out_both]">
      <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
        <div>
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#656d6f]">
            <span>{dateLabel}</span>
            <span className="h-1 w-1 rounded-full bg-[#55c98b]" />
            <span>Day signal 04</span>
          </div>
          <h1 className="text-[2rem] font-medium tracking-[-0.05em] text-[#f0f2f1] sm:text-[2.5rem]">{greeting()}, {state.preferences.name}.</h1>
          <p className="mt-2 text-sm text-[#767e80]">The system is stable. Keep today clear.</p>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <div className="text-right">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5f6769]">Daily execution</p>
            <p className="mt-1 text-sm font-medium text-[#cdd1cf]">{completion}% complete</p>
          </div>
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full" style={{ background: `conic-gradient(#55c98b ${completion * 3.6}deg, #202426 0deg)` }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b0d0e] font-mono text-[8px] text-[#9ba1a2]">{completedCount}/{actionsToday.length}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)] lg:gap-6 xl:gap-8">
        <div className="space-y-7">
          {state.preferences.recoveryWidgetDetail === "summary" && <RecoveryOverview entries={state.recoveryEntries} />}
          {state.preferences.recoveryWidgetDetail === "status-only" && (
            <Panel className="flex items-center justify-between p-5">
              <div><SectionLabel>Recovery status</SectionLabel><p className="mt-2 text-sm font-medium text-[#dce0de]">Continue forward.</p></div>
              <span className="rounded-full border border-[#55c98b]/20 bg-[#55c98b]/10 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#72d69e]">Steady</span>
            </Panel>
          )}
          <PriorityList priorities={prioritiesToday} onToggle={togglePriority} />
          <ActionList actions={actionsToday} completedIds={completedActionIds} onAction={actOn} />
        </div>

        <aside className="space-y-7">
          <div>
            <SectionLabel>Next action</SectionLabel>
            <Panel className="mt-3 overflow-hidden border-[#55c98b]/15 bg-[#121714]">
              {nextAction ? (
                <button onClick={() => actOn(nextAction)} className="group w-full p-5 text-left sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#55c98b]/20 bg-[#55c98b]/10 text-[#65d394]"><ShieldCheck className="h-[18px] w-[18px]" /></div>
                    <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#55c98b]">Ready now</span>
                  </div>
                  <h2 className="mt-7 text-xl font-medium tracking-[-0.025em] text-white">{nextAction.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#7f8789]">{nextAction.description}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4 text-xs font-medium text-[#cbd0cd]">
                    Mark complete
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              ) : (
                <div className="p-6 text-center">
                  <Check className="mx-auto h-6 w-6 text-[#55c98b]" />
                  <h2 className="mt-4 text-lg font-medium">Today is clear.</h2>
                  <p className="mt-2 text-sm text-[#737b7d]">All scheduled actions are complete.</p>
                </div>
              )}
            </Panel>
          </div>
          <SystemSummary metrics={state.metrics} />
        </aside>
      </div>
      <ActionCompletionDrawer open={completionOpen} onOpenChange={setCompletionOpen} action={selectedAction} onComplete={completeAction} />
    </div>
  );
};

export default Index;
