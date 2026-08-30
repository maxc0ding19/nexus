import { Activity, ArrowDownToLine, RotateCcw, ShieldAlert, Sparkles } from "lucide-react";
import type { RecoveryContext, RecoveryEvent } from "@/types/nexus";
import { Panel, SectionLabel } from "@/components/nexus/Panel";
import { cn } from "@/lib/utils";
import { formatEventTime, recoveryEventMeta } from "./recovery-utils";

const icons = { urge: Activity, difficult: ShieldAlert, redirect: RotateCcw, setback: ArrowDownToLine, custom: Sparkles };

export function RecoveryHistory({ events, contexts, limit }: { events: RecoveryEvent[]; contexts: RecoveryContext[]; limit?: number }) {
  const visible = typeof limit === "number" ? events.slice(0, limit) : events;
  return (
    <div>
      <SectionLabel detail={events.length ? <span className="font-mono text-[9px] text-[#596164]">{events.length} TOTAL</span> : undefined}>Recent log</SectionLabel>
      <Panel className="mt-3 overflow-hidden">
        {visible.length ? <div className="divide-y divide-white/[0.055]">{visible.map((event) => {
          const Icon = icons[event.type];
          const meta = recoveryEventMeta[event.type];
          const context = contexts.find((item) => item.eventId === event.id);
          const details = context ? [
            context.sleepHours !== undefined ? `${context.sleepHours}h sleep` : null,
            context.stress !== undefined ? `Stress ${context.stress}/10` : null,
            context.energy !== undefined ? `Energy ${context.energy}/10` : null,
            context.alone !== undefined ? context.alone ? "Alone" : "Not alone" : null,
            context.helpfulResponse ? `Helped: ${context.helpfulResponse}` : null,
          ].filter(Boolean) : [];
          return (
            <div key={event.id} className="flex gap-3.5 p-4 sm:p-5">
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border", meta.tone)}><Icon className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-sm font-medium text-[#dce0de]">{event.customLabel || meta.label}</p><p className="mt-1 text-xs text-[#667073]">{meta.description}</p></div>
                  <time className="whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.08em] text-[#565e60]">{formatEventTime(event.occurredAt)}</time>
                </div>
                {details.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{details.map((detail) => <span key={detail as string} className="rounded-full border border-white/[0.06] bg-white/[0.025] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.08em] text-[#697173]">{detail}</span>)}</div>}
                {context?.notes && <p className="mt-3 border-l border-white/[0.1] pl-3 text-xs leading-5 text-[#747c7e]">{context.notes}</p>}
              </div>
            </div>
          );
        })}</div> : (
          <div className="px-6 py-10 text-center"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025]"><Activity className="h-4 w-4 text-[#626a6c]" /></div><p className="mt-4 text-sm font-medium text-[#c9cecb]">No recovery events logged</p><p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#697173]">Logging is optional and private. When something relevant happens, a brief entry is enough.</p></div>
        )}
      </Panel>
    </div>
  );
}
