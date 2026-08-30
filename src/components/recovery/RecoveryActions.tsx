import { useState } from "react";
import { Check, Plus, ShieldCheck, X } from "lucide-react";
import type { ActionDefinition } from "@/types/nexus";
import { Panel, SectionLabel } from "@/components/nexus/Panel";
import { cn } from "@/lib/utils";

interface Props {
  actions: ActionDefinition[];
  completedIds: Set<string>;
  onToggle: (id: string) => void;
  onAdd: (name: string) => void;
}

export function RecoveryActions({ actions, completedIds, onToggle, onAdd }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const save = () => { if (!name.trim()) return; onAdd(name); setName(""); setAdding(false); };

  return (
    <div>
      <SectionLabel detail={<button onClick={() => setAdding(true)} className="flex items-center gap-1 text-[9px] text-[#8b9395] hover:text-white"><Plus className="h-3 w-3" /> NEW ACTION</button>}>Recovery actions</SectionLabel>
      <Panel className="mt-3 overflow-hidden">
        {adding && <div className="flex gap-2 border-b border-white/[0.055] bg-white/[0.02] p-3"><input autoFocus value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => event.key === "Enter" && save()} placeholder="Name a supportive action" className="h-10 min-w-0 flex-1 rounded-xl border border-white/[0.09] bg-[#0c0f10] px-3 text-sm outline-none placeholder:text-[#525a5c] focus:border-[#55c98b]/40" /><button onClick={save} aria-label="Save action" className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8eeea] text-[#101412]"><Check className="h-4 w-4" /></button><button onClick={() => setAdding(false)} aria-label="Cancel" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] text-[#777f81]"><X className="h-4 w-4" /></button></div>}
        <div className="divide-y divide-white/[0.055]">
          {actions.map((action) => {
            const done = completedIds.has(action.id);
            return <button key={action.id} onClick={() => onToggle(action.id)} className="group flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.02]"><span className={cn("flex h-7 w-7 items-center justify-center rounded-lg border", done ? "border-[#55c98b]/30 bg-[#55c98b]/12 text-[#61cf91]" : "border-white/[0.08] text-[#5e6668]")}><ShieldCheck className="h-3.5 w-3.5" /></span><span className={cn("flex-1 text-xs font-medium", done ? "text-[#667073] line-through" : "text-[#cbd0ce]")}>{action.name}</span><span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#525a5c]">{done ? "Complete" : action.type}</span></button>;
          })}
        </div>
      </Panel>
    </div>
  );
}
