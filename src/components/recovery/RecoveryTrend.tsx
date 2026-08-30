import { useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import type { RecoveryEvent } from "@/types/nexus";
import { Panel, SectionLabel } from "@/components/nexus/Panel";
import { cn } from "@/lib/utils";

const ranges = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "ALL", days: 0 },
] as const;

export function RecoveryTrend({ events }: { events: RecoveryEvent[] }) {
  const [range, setRange] = useState<(typeof ranges)[number]>(ranges[0]);
  const filtered = useMemo(() => {
    if (!range.days) return events;
    const threshold = Date.now() - range.days * 86400000;
    return events.filter((event) => new Date(event.occurredAt).getTime() >= threshold);
  }, [events, range]);

  const buckets = useMemo(() => {
    const days = range.days || Math.max(7, Math.ceil((Date.now() - Math.min(...events.map((event) => new Date(event.occurredAt).getTime()), Date.now())) / 86400000) + 1);
    const count = days <= 7 ? 7 : days <= 30 ? 10 : 12;
    const bucketSize = days / count;
    return Array.from({ length: count }, (_, index) => {
      const end = Date.now() - (count - index - 1) * bucketSize * 86400000;
      const start = end - bucketSize * 86400000;
      const matching = filtered.filter((event) => {
        const time = new Date(event.occurredAt).getTime();
        return time > start && time <= end;
      });
      return {
        count: matching.length,
        redirects: matching.filter((event) => event.type === "redirect").length,
        label: days <= 7 ? new Intl.DateTimeFormat("en", { weekday: "narrow" }).format(new Date(end)) : "",
      };
    });
  }, [events, filtered, range]);
  const max = Math.max(1, ...buckets.map((bucket) => bucket.count));

  return (
    <Panel className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div><SectionLabel>Event signal</SectionLabel><p className="mt-2 text-sm text-[#7c8486]">Logged activity over time</p></div>
        <div className="flex rounded-xl border border-white/[0.07] bg-white/[0.025] p-1">
          {ranges.map((item) => <button key={item.label} onClick={() => setRange(item)} className={cn("rounded-lg px-2 py-1.5 font-mono text-[9px] transition-colors", range.label === item.label ? "bg-white/[0.09] text-white" : "text-[#5f6769] hover:text-[#aeb4b5]")}>{item.label}</button>)}
        </div>
      </div>

      {filtered.length ? (
        <div className="mt-7">
          <div className="flex h-32 items-end gap-2 border-b border-white/[0.07]">
            {buckets.map((bucket, index) => (
              <div key={index} className="flex h-full flex-1 flex-col justify-end gap-1">
                <div className="relative w-full rounded-t-sm bg-white/[0.08]" style={{ height: `${Math.max(bucket.count ? 12 : 2, (bucket.count / max) * 100)}%` }}>
                  {bucket.redirects > 0 && <div className="absolute inset-x-0 bottom-0 rounded-t-sm bg-[#55c98b]/70" style={{ height: `${Math.max(12, (bucket.redirects / bucket.count) * 100)}%` }} />}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[8px] uppercase text-[#555d5f]">{buckets.map((bucket, index) => <span key={index} className="flex-1 text-center">{bucket.label}</span>)}</div>
          <div className="mt-5 flex items-center gap-5 font-mono text-[9px] uppercase tracking-[0.1em] text-[#697173]"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-sm bg-white/[0.12]" /> All events</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-sm bg-[#55c98b]/70" /> Redirects</span></div>
        </div>
      ) : (
        <div className="mt-7 flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.015] text-center">
          <BarChart3 className="h-5 w-5 text-[#4e5658]" />
          <p className="mt-3 text-xs font-medium text-[#8a9294]">No activity in this range</p>
          <p className="mt-1 text-[11px] text-[#5f6769]">Your first log will begin the signal.</p>
        </div>
      )}
    </Panel>
  );
}
