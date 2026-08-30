import { BrainCircuit, FlaskConical, Info, ScanSearch } from "lucide-react";
import type { RecoveryContext, RecoveryEvent } from "@/types/nexus";
import { Panel, SectionLabel } from "@/components/nexus/Panel";
import { deriveInsight } from "./recovery-utils";

export function RecoveryInsight({ events, contexts, expanded = false }: { events: RecoveryEvent[]; contexts: RecoveryContext[]; expanded?: boolean }) {
  const insight = deriveInsight(events, contexts);
  return (
    <Panel className="overflow-hidden">
      <div className="flex items-start gap-4 p-5 sm:p-6">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${insight.enough ? "border-[#78a8d6]/20 bg-[#78a8d6]/10 text-[#89b5dc]" : "border-white/[0.08] bg-white/[0.03] text-[#747c7e]"}`}><BrainCircuit className="h-[18px] w-[18px]" /></div>
        <div className="min-w-0 flex-1">
          <SectionLabel detail={<span className="font-mono text-[9px] text-[#626a6c]">CONFIDENCE · {insight.confidence.toUpperCase()}</span>}>{insight.enough ? "Pattern detected" : "Not enough data"}</SectionLabel>
          <h3 className="mt-3 text-base font-medium leading-6 text-[#e0e4e2]">{insight.title}</h3>
        </div>
      </div>
      <div className="grid border-t border-white/[0.055] sm:grid-cols-2 sm:divide-x sm:divide-white/[0.055]">
        <div className="p-5 sm:p-6"><div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[#697173]"><ScanSearch className="h-3.5 w-3.5" /> Observation</div><p className="mt-3 text-xs leading-5 text-[#858d8f]">{insight.observation}</p></div>
        <div className="border-t border-white/[0.055] p-5 sm:border-t-0 sm:p-6"><div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[#697173]"><FlaskConical className="h-3.5 w-3.5" /> Suggested action</div><p className="mt-3 text-xs leading-5 text-[#858d8f]">{insight.action}</p></div>
      </div>
      {expanded && <div className="flex items-start gap-2 border-t border-white/[0.055] bg-white/[0.015] px-5 py-4 text-[11px] leading-5 text-[#666e70]"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> NEXUS reports observations and possible correlations only. Logged patterns do not establish causation.</div>}
    </Panel>
  );
}
