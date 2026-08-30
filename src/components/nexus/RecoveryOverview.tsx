import { ArrowUpRight, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { RecoveryEntry } from "@/types/nexus";
import { Panel, SectionLabel } from "./Panel";

function TrendLine({ entries }: { entries: RecoveryEntry[] }) {
  const points = entries.map((entry, index) => `${(index / Math.max(entries.length - 1, 1)) * 100},${44 - (entry.score - 50) * 0.8}`).join(" ");

  return (
    <div className="relative h-[74px] overflow-hidden">
      <div className="absolute inset-x-0 top-4 border-t border-dashed border-white/[0.06]" />
      <div className="absolute inset-x-0 top-11 border-t border-dashed border-white/[0.06]" />
      <svg viewBox="0 0 100 48" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-label="Recovery trend improving">
        <polyline points={points} fill="none" stroke="#55c98b" strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        {entries.map((entry, index) => (
          <circle key={entry.id} cx={(index / Math.max(entries.length - 1, 1)) * 100} cy={44 - (entry.score - 50) * 0.8} r="1.25" fill="#090b0c" stroke="#73d89f" strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
    </div>
  );
}

export function RecoveryOverview({ entries }: { entries: RecoveryEntry[] }) {
  const current = entries.at(-1);
  const previous = entries.at(-2);
  const delta = current && previous ? current.score - previous.score : 0;

  return (
    <Panel className="relative overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[url('/assets/nexus-grid-texture.png')] bg-cover bg-center opacity-[0.07] mix-blend-screen" />
      <div className="relative">
        <SectionLabel detail={<span className="font-mono text-[10px] text-[#55c98b]">7 DAY SIGNAL</span>}>Recovery status</SectionLabel>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[2.8rem] font-medium leading-none tracking-[-0.055em] text-white">{current?.score ?? "—"}</span>
              <span className="rounded-full border border-[#55c98b]/20 bg-[#55c98b]/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#72d69e]">Steady</span>
            </div>
            <p className="mt-2 text-sm text-[#8b9294]">Continue forward. Your recent signal is stabilizing.</p>
          </div>
          <div className="mb-1 flex items-center gap-1 rounded-full bg-white/[0.045] px-2.5 py-1.5 font-mono text-[10px] text-[#76dba3]">
            <ArrowUpRight className="h-3 w-3" /> {delta > 0 ? "+" : ""}{delta}
          </div>
        </div>
        <div className="mt-5"><TrendLine entries={entries} /></div>
        <div className="mt-2 flex items-center justify-between border-t border-white/[0.06] pt-4">
          <div className="flex gap-5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#596164]">
            <span>Low <b className="ml-1 font-medium text-[#a8adaf]">58</b></span>
            <span>High <b className="ml-1 font-medium text-[#a8adaf]">78</b></span>
          </div>
          <Link to="/recovery" className="flex items-center gap-1 text-xs font-medium text-[#aeb4b5] hover:text-white">Open recovery <ChevronRight className="h-3.5 w-3.5" /></Link>
        </div>
      </div>
    </Panel>
  );
}
