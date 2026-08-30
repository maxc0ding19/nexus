import { ArrowDownRight, ArrowUpRight, BrainCircuit, Lightbulb } from "lucide-react";
import type { Metric } from "@/types/nexus";
import { Panel, SectionLabel } from "./Panel";

export function SystemSummary({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="space-y-5">
      <div>
        <SectionLabel>System status</SectionLabel>
        <Panel className="mt-3 grid grid-cols-2 divide-x divide-y divide-white/[0.055] overflow-hidden sm:grid-cols-4 sm:divide-y-0 lg:grid-cols-2 lg:divide-y xl:grid-cols-4 xl:divide-y-0">
          {metrics.map((metric) => {
            const improving = (metric.trend ?? 0) > 0;
            const Trend = improving ? ArrowUpRight : ArrowDownRight;
            return (
              <div key={metric.id} className="p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#626a6c]">{metric.label}</p>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <p className="text-xl font-medium tracking-[-0.03em] text-[#e1e5e3]">{metric.value}<span className="ml-1 font-mono text-[9px] text-[#697173]">{metric.unit}</span></p>
                  <Trend className={`h-3.5 w-3.5 ${metric.tone === "positive" ? "text-[#55c98b]" : "text-[#72797b]"}`} />
                </div>
              </div>
            );
          })}
        </Panel>
      </div>

      <Panel className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#78a8d6]/15 bg-[#78a8d6]/10 text-[#82acd5]"><BrainCircuit className="h-4 w-4" /></div>
          <div>
            <SectionLabel>System insight</SectionLabel>
            <p className="mt-3 text-sm font-medium leading-6 text-[#d9dddb]">Lower evening screen use is aligning with steadier mornings.</p>
            <p className="mt-2 text-xs leading-5 text-[#737b7d]">This is an observed pattern, not a guaranteed cause.</p>
            <div className="mt-4 flex items-center gap-2 border-t border-white/[0.055] pt-4 text-xs text-[#8e9698]">
              <Lightbulb className="h-3.5 w-3.5 text-[#caa969]" />
              Keep the phone boundary for 7 more days.
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
