import { useEffect, useState } from "react";
import { Check, Clock3 } from "lucide-react";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { ActionCompletion, ActionDefinition, CustomFieldDefinition } from "@/types/nexus";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: ActionDefinition;
  onComplete: (actionId: string, value: boolean | number | string, customValues?: ActionCompletion["customFieldValues"]) => void;
}

function CustomFieldInput({ field, value, onChange }: { field: CustomFieldDefinition; value: string | number | boolean | string[] | undefined; onChange: (value: string | number | boolean | string[]) => void }) {
  const fieldClass = "h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-sm text-[#e6e9e7] outline-none focus:border-[#55c98b]/45";
  if (field.type === "boolean") return <button onClick={() => onChange(!value)} className={cn(fieldClass, "text-left", value && "border-[#55c98b]/30 text-[#65d395]")}>{value ? "Yes" : "No"}</button>;
  if (field.type === "dropdown") return <select value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={fieldClass}><option value="">Select</option>{field.options?.map((option) => <option key={option}>{option}</option>)}</select>;
  if (field.type === "multiselect") return <div className="flex flex-wrap gap-2">{field.options?.map((option) => { const selected = Array.isArray(value) && value.includes(option); return <button key={option} onClick={() => onChange(selected ? (value as string[]).filter((item) => item !== option) : [...(Array.isArray(value) ? value : []), option])} className={cn("rounded-full border px-3 py-2 text-[11px]", selected ? "border-[#55c98b]/30 bg-[#55c98b]/10 text-[#65d395]" : "border-white/[0.08] text-[#737b7d]")}>{option}</button>; })}</div>;
  return <input type={field.type === "datetime" ? "datetime-local" : field.type === "text" ? "text" : "number"} min={field.type === "scale" ? 1 : undefined} max={field.type === "scale" ? 10 : undefined} value={typeof value === "string" || typeof value === "number" ? value : ""} onChange={(e) => onChange(field.type === "number" || field.type === "scale" ? Number(e.target.value) : e.target.value)} className={fieldClass} />;
}

export function ActionCompletionDrawer({ open, onOpenChange, action, onComplete }: Props) {
  const [value, setValue] = useState<boolean | number | string>(true);
  const [customValues, setCustomValues] = useState<NonNullable<ActionCompletion["customFieldValues"]>>({});
  useEffect(() => {
    if (!action || !open) return;
    setValue(action.type === "journal" || action.type === "event" ? "" : action.type === "scale" ? Math.min(5, action.target ?? 10) : action.type === "boolean" || action.type === "avoidance" ? true : action.target ?? 0);
    setCustomValues({});
  }, [action, open]);
  if (!action) return null;

  const submit = () => {
    onComplete(action.id, value, customValues);
    toast.success("Action complete", { description: `${action.name} was recorded.` });
    onOpenChange(false);
  };
  const fieldClass = "h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-sm text-[#e6e9e7] outline-none focus:border-[#55c98b]/45";
  const primaryComplete = (action.type !== "journal" && action.type !== "event") || String(value).trim().length > 0;
  const requiredFieldsComplete = (action.customFieldDefinitions ?? []).filter((field) => field.required).every((field) => {
    const fieldValue = customValues[field.id];
    return fieldValue !== undefined && fieldValue !== "" && (!Array.isArray(fieldValue) || fieldValue.length > 0);
  });
  const canSubmit = primaryComplete && requiredFieldsComplete;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent className="max-h-[90vh] rounded-t-[1.8rem] border-white/[0.09] bg-[#101314] text-[#edf0ee] outline-none">
        <div className="mx-auto w-full max-w-xl overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6">
          <DrawerHeader className="px-0 pb-5 pt-5 text-left"><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#55c98b]">Record completion</p><DrawerTitle className="mt-2 text-2xl font-medium tracking-[-0.04em]">{action.name}</DrawerTitle><DrawerDescription className="text-[#747c7e]">{action.description || "Record what you completed."}</DrawerDescription></DrawerHeader>
          <div className="space-y-5">
            {(action.type === "boolean" || action.type === "avoidance") && <button onClick={() => setValue(!value)} className={cn("flex h-20 w-full items-center justify-center gap-3 rounded-2xl border text-sm font-medium transition-colors", value ? "border-[#55c98b]/30 bg-[#55c98b]/10 text-[#69d599]" : "border-white/[0.08] text-[#737b7d]")}><Check className="h-5 w-5" /> {action.type === "avoidance" ? "Boundary kept" : "Completed"}</button>}
            {(["quantity", "duration", "count"].includes(action.type)) && <label><span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-[#727a7c]">Amount completed · {action.unit}</span><input autoFocus type="number" min="0" value={value as number} onChange={(e) => setValue(Number(e.target.value))} className={`${fieldClass} text-lg`} /></label>}
            {action.type === "scale" && <div><div className="flex items-end justify-between"><span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#727a7c]">Current rating</span><span className="text-2xl font-medium text-white">{value}<small className="ml-1 text-xs text-[#687073]">/{action.target ?? 10}</small></span></div><input type="range" min="1" max={action.target ?? 10} value={value as number} onChange={(e) => setValue(Number(e.target.value))} className="mt-5 w-full accent-[#55c98b]" /></div>}
            {(action.type === "journal" || action.type === "event") && <label><span className="mb-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[#727a7c]"><Clock3 className="h-3 w-3" /> {action.type === "journal" ? "Entry" : "Event detail"}</span><textarea autoFocus value={value as string} onChange={(e) => setValue(e.target.value)} className="min-h-28 w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.035] p-3 text-sm leading-6 outline-none placeholder:text-[#51595b] focus:border-[#55c98b]/45" placeholder={action.type === "journal" ? "Write a brief reflection…" : "What happened?"} /></label>}
            {(action.customFieldDefinitions ?? []).map((field) => <label key={field.id}><span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-[#727a7c]">{field.name}{field.required ? " · Required" : ""}</span><CustomFieldInput field={field} value={customValues[field.id]} onChange={(fieldValue) => setCustomValues((current) => ({ ...current, [field.id]: fieldValue }))} /></label>)}
          </div>
          <button onClick={submit} disabled={!canSubmit} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e8eeea] text-sm font-semibold text-[#101412] hover:bg-white disabled:opacity-40"><Check className="h-4 w-4" /> Record completion</button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
