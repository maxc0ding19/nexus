import { useState } from "react";
import { Activity, ArrowDownToLine, LockKeyhole, Plus, RotateCcw, ShieldAlert, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Panel, SectionLabel } from "@/components/nexus/Panel";
import { RecoveryActions } from "@/components/recovery/RecoveryActions";
import { RecoveryHistory } from "@/components/recovery/RecoveryHistory";
import { RecoveryInsight } from "@/components/recovery/RecoveryInsight";
import { RecoveryLogDrawer } from "@/components/recovery/RecoveryLogDrawer";
import { RecoveryTrend } from "@/components/recovery/RecoveryTrend";
import { getRecoveryStats, recoveryEventMeta } from "@/components/recovery/recovery-utils";
import { useNexus } from "@/hooks/use-nexus";
import type { RecoveryEventType } from "@/types/nexus";
import { cn } from "@/lib/utils";

const quickEvents: { type: RecoveryEventType; icon: typeof Activity }[] = [
  { type: "urge", icon: Activity },
  { type: "difficult", icon: ShieldAlert },
  { type: "redirect", icon: RotateCcw },
  { type: "setback", icon: ArrowDownToLine },
  { type: "custom", icon: Sparkles },
];

export default function Recovery() {
  const { state, recoveryActions, completedActionIds, addRecoveryEvent, addRecoveryAction, toggleAction, setRecoveryWidgetDetail } = useNexus();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [initialType, setInitialType] = useState<RecoveryEventType>("urge");
  const stats = getRecoveryStats(state.recoveryEvents);
  const hasData = state.recoveryEvents.length > 0;
  const recentDifficulty = stats.recent.filter((event) => event.type === "urge" || event.type === "difficult" || event.type === "setback").length;
  const log = (type: RecoveryEventType = "urge") => { setInitialType(type); setDrawerOpen(true); };

  return (
    <div className="animate-[enter_380ms_ease-out_both]">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[#626a6c]"><LockKeyhole className="h-3 w-3" /> Private · stored locally</div>
          <h1 className="mt-4 text-[2.2rem] font-medium tracking-[-0.05em] text-[#f0f2f1] sm:text-[2.7rem]">Recovery</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#747c7e]">Notice what is happening. Keep what helps. Treat every entry as information.</p>
        </div>
        <button onClick={() => log()} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#e8eeea] px-5 text-sm font-semibold text-[#101412] transition-colors hover:bg-white"><Plus className="h-4 w-4" /> Log an event</button>
      </div>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="h-11 w-full justify-start gap-1 rounded-xl border border-white/[0.07] bg-[#0f1213] p-1 sm:w-auto">
          {["overview", "log", "insights"].map((tab) => <TabsTrigger key={tab} value={tab} className="h-9 flex-1 rounded-lg px-5 font-mono text-[9px] uppercase tracking-[0.15em] text-[#667073] shadow-none data-[state=active]:bg-white/[0.075] data-[state=active]:text-[#e5e9e7] data-[state=active]:shadow-none sm:flex-none">{tab}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-7 focus-visible:ring-0">
          <Panel className="relative overflow-hidden p-5 sm:p-7">
            <div className="pointer-events-none absolute inset-0 bg-[url('/assets/nexus-grid-texture.png')] bg-cover opacity-[0.06] mix-blend-screen" />
            <div className="relative">
              <SectionLabel detail={<span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#55c98b]"><span className="h-1.5 w-1.5 rounded-full bg-[#55c98b]" /> Active</span>}>Current recovery status</SectionLabel>
              <div className="mt-6 grid gap-7 lg:grid-cols-[1.25fr_1fr] lg:items-end">
                <div>
                  <h2 className="text-2xl font-medium tracking-[-0.035em] text-white">{hasData ? "Continue forward." : "Baseline ready."}</h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#7d8587]">{hasData ? "Your log is building a clearer picture without reducing progress to a single number." : "No recovery events have been logged. Start only when there is something useful to record."}</p>
                </div>
                <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.07]">
                  <div className="bg-[#111516] p-3"><p className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#5e6668]">7 day events</p><p className="mt-2 text-xl font-medium text-[#e1e5e3]">{hasData ? stats.recent.length : "—"}</p></div>
                  <div className="bg-[#111516] p-3"><p className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#5e6668]">Redirects</p><p className="mt-2 text-xl font-medium text-[#72d69e]">{hasData ? stats.redirects.length : "—"}</p></div>
                  <div className="bg-[#111516] p-3"><p className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#5e6668]">Recent load</p><p className="mt-2 text-xl font-medium text-[#e1e5e3]">{hasData ? recentDifficulty : "—"}</p></div>
                </div>
              </div>
            </div>
          </Panel>

          <div className="grid gap-7 xl:grid-cols-[1.25fr_0.75fr]">
            <RecoveryTrend events={state.recoveryEvents} />
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
              <Panel className="p-4 sm:p-5"><p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#5d6567]">Days since setback</p><p className="mt-3 text-2xl font-medium tracking-[-0.04em] text-[#dce0de]">{stats.daysSinceSetback ?? "—"}</p><p className="mt-1 text-[11px] text-[#626a6c]">One signal, not your identity</p></Panel>
              <Panel className="p-4 sm:p-5"><p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#5d6567]">Long-term history</p><p className="mt-3 text-2xl font-medium tracking-[-0.04em] text-[#dce0de]">{hasData ? state.recoveryEvents.length : "—"}</p><p className="mt-1 text-[11px] text-[#626a6c]">Total private entries</p></Panel>
            </div>
          </div>

          <RecoveryInsight events={state.recoveryEvents} contexts={state.recoveryContexts} />
          <div className="grid gap-7 xl:grid-cols-[1.15fr_0.85fr]">
            <RecoveryHistory events={state.recoveryEvents} contexts={state.recoveryContexts} limit={4} />
            <RecoveryActions actions={recoveryActions} completedIds={completedActionIds} onToggle={toggleAction} onAdd={addRecoveryAction} />
          </div>
        </TabsContent>

        <TabsContent value="log" className="mt-6 space-y-7 focus-visible:ring-0">
          <div>
            <SectionLabel>Quick log</SectionLabel>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
              {quickEvents.map(({ type, icon: Icon }) => <button key={type} onClick={() => log(type)} className="group rounded-2xl border border-white/[0.07] bg-[#111416] p-4 text-left transition-colors hover:border-white/[0.14] hover:bg-[#141719]"><Icon className={cn("h-5 w-5", recoveryEventMeta[type].tone.split(" ")[0])} /><p className="mt-6 text-xs font-medium text-[#d7dbd9]">{recoveryEventMeta[type].label}</p><p className="mt-1 text-[11px] leading-4 text-[#626a6c]">{recoveryEventMeta[type].description}</p></button>)}
            </div>
          </div>
          <RecoveryHistory events={state.recoveryEvents} contexts={state.recoveryContexts} />
        </TabsContent>

        <TabsContent value="insights" className="mt-6 space-y-7 focus-visible:ring-0">
          <RecoveryInsight events={state.recoveryEvents} contexts={state.recoveryContexts} expanded />
          <div className="grid gap-7 md:grid-cols-2">
            <Panel className="p-5 sm:p-6"><SectionLabel>Data coverage</SectionLabel><div className="mt-5 space-y-4">{[["Recovery events", state.recoveryEvents.length], ["Context records", state.recoveryContexts.length], ["Successful redirects", stats.redirects.length]].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-white/[0.055] pb-3"><span className="text-xs text-[#7b8385]">{label}</span><span className="font-mono text-xs text-[#c6ccca]">{value}</span></div>)}</div><p className="mt-4 text-[11px] leading-5 text-[#5e6668]">More entries can improve pattern confidence. Complete context is never required.</p></Panel>
            <Panel className="p-5 sm:p-6"><SectionLabel>Privacy controls</SectionLabel><p className="mt-4 text-sm font-medium text-[#d8dcda]">Today screen visibility</p><p className="mt-1 text-xs leading-5 text-[#687073]">Control how much recovery information appears outside this private section.</p><select value={state.preferences.recoveryWidgetDetail} onChange={(event) => setRecoveryWidgetDetail(event.target.value as "summary" | "status-only" | "hidden")} className="mt-5 h-11 w-full rounded-xl border border-white/[0.08] bg-[#0c0f10] px-3 text-xs text-[#c8cdca] outline-none focus:border-[#55c98b]/40"><option value="summary">Summary and trend</option><option value="status-only">Status only</option><option value="hidden">Hidden from Today</option></select><div className="mt-4 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.12em] text-[#596164]"><LockKeyhole className="h-3 w-3" /> No sensitive notification text</div></Panel>
          </div>
        </TabsContent>
      </Tabs>

      <RecoveryLogDrawer open={drawerOpen} onOpenChange={setDrawerOpen} onSave={addRecoveryEvent} initialType={initialType} />
    </div>
  );
}
