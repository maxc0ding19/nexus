import { useEffect, useState } from "react";
import { Activity, BookOpen, Brain, BriefcaseBusiness, Check, ChevronDown, CircleCheck, Droplets, Dumbbell, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { ActionDraft } from "@/hooks/use-nexus";
import type { ActionDefinition, ActionSchedule, ActionType, Category, CustomFieldDefinition, CustomFieldType } from "@/types/nexus";

const actionTypes: { value: ActionType; label: string; hint: string }[] = [
  { value: "boolean", label: "Boolean", hint: "Done or not done" },
  { value: "quantity", label: "Quantity", hint: "A measured amount" },
  { value: "duration", label: "Duration", hint: "Time spent" },
  { value: "count", label: "Count", hint: "Repeated units" },
  { value: "scale", label: "Scale", hint: "A 1–10 rating" },
  { value: "avoidance", label: "Boundary", hint: "A limit kept" },
  { value: "journal", label: "Journal", hint: "A written entry" },
  { value: "event", label: "Event", hint: "Timestamped log" },
];
const iconOptions = ["circle-check", "book", "brain", "dumbbell", "droplets", "shield", "briefcase"];
const iconMap = { "circle-check": CircleCheck, book: BookOpen, brain: Brain, dumbbell: Dumbbell, droplets: Droplets, shield: ShieldCheck, briefcase: BriefcaseBusiness };
const weekdays = [{ value: 1, label: "M" }, { value: 2, label: "T" }, { value: 3, label: "W" }, { value: 4, label: "T" }, { value: 5, label: "F" }, { value: 6, label: "S" }, { value: 0, label: "S" }];
const fieldTypes: CustomFieldType[] = ["text", "number", "boolean", "scale", "datetime", "dropdown", "multiselect"];

const emptyDraft = (categoryId: string): ActionDraft => ({
  name: "", description: "", icon: "circle-check", type: "boolean", categoryId, schedule: ["daily"], scheduleConfig: { mode: "daily" }, target: 1, unit: "", reminder: "", notes: "", priority: "normal", customFields: {}, customFieldDefinitions: [], includeInAnalytics: true, includeInRecovery: false, classification: "positive", color: "", active: true,
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  action?: ActionDefinition;
  onSave: (draft: ActionDraft) => void;
}

export function ActionCreator({ open, onOpenChange, categories, action, onSave }: Props) {
  const [draft, setDraft] = useState<ActionDraft>(() => action ? { ...action } : emptyDraft(categories[0]?.id ?? ""));
  const [advanced, setAdvanced] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(action ? { ...action } : emptyDraft(categories.find((category) => !category.archived)?.id ?? ""));
    setAdvanced(Boolean(action));
  }, [open, action, categories]);

  const update = <K extends keyof ActionDraft>(key: K, value: ActionDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const updateSchedule = (updates: Partial<ActionSchedule>) => update("scheduleConfig", { ...(draft.scheduleConfig ?? { mode: "daily" }), ...updates } as ActionSchedule);
  const addCustomField = () => update("customFieldDefinitions", [...(draft.customFieldDefinitions ?? []), { id: `field-${Date.now()}`, name: "New field", type: "text", required: false }]);
  const updateCustomField = (id: string, updates: Partial<CustomFieldDefinition>) => update("customFieldDefinitions", (draft.customFieldDefinitions ?? []).map((field) => field.id === id ? { ...field, ...updates } : field));
  const removeCustomField = (id: string) => update("customFieldDefinitions", (draft.customFieldDefinitions ?? []).filter((field) => field.id !== id));

  const save = () => {
    if (!draft.name.trim() || !draft.categoryId) return;
    const scheduleConfig: ActionSchedule = draft.scheduleConfig?.mode === "weekly_target"
      ? { ...draft.scheduleConfig, weeklyTarget: draft.scheduleConfig.weeklyTarget ?? 3 }
      : draft.scheduleConfig?.mode === "custom"
        ? { ...draft.scheduleConfig, intervalDays: draft.scheduleConfig.intervalDays ?? 2, startDate: draft.scheduleConfig.startDate ?? new Date().toISOString().slice(0, 10) }
        : draft.scheduleConfig ?? { mode: "daily" };
    const schedule = scheduleConfig.mode === "daily" ? ["daily"] : scheduleConfig.mode === "weekdays" ? (scheduleConfig.weekdays ?? []).map(String) : [];
    onSave({ ...draft, name: draft.name.trim(), schedule, scheduleConfig });
    toast.success(action ? "Action updated" : "Action created", { description: "Your schedule is ready." });
    onOpenChange(false);
  };

  const needsTarget = ["quantity", "duration", "count", "scale"].includes(draft.type);
  const fieldClass = "h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-sm text-[#e6e9e7] outline-none placeholder:text-[#51595b] focus:border-[#55c98b]/45";
  const labelClass = "mb-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-[#727a7c]";

  return (
    <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent className="max-h-[94vh] rounded-t-[1.8rem] border-white/[0.09] bg-[#101314] text-[#edf0ee] outline-none">
        <div className="mx-auto w-full max-w-3xl overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6">
          <DrawerHeader className="px-0 pb-4 pt-5 text-left">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#55c98b]">Action configuration</p>
            <DrawerTitle className="mt-2 text-2xl font-medium tracking-[-0.04em]">{action ? "Edit action" : "Create an action"}</DrawerTitle>
            <DrawerDescription className="text-[#747c7e]">Start simple. Advanced settings stay out of the way until you need them.</DrawerDescription>
          </DrawerHeader>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
              <label><span className={labelClass}>Name</span><input autoFocus value={draft.name} onChange={(e) => update("name", e.target.value)} className={fieldClass} placeholder="Read" /></label>
              <label><span className={labelClass}>Category</span><select value={draft.categoryId} onChange={(e) => update("categoryId", e.target.value)} className={fieldClass}>{categories.filter((category) => !category.archived).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            </div>
            <label><span className={labelClass}>Description</span><input value={draft.description ?? ""} onChange={(e) => update("description", e.target.value)} className={fieldClass} placeholder="What does completing this mean?" /></label>

            <div><span className={labelClass}>Action type</span><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{actionTypes.map((type) => <button key={type.value} onClick={() => update("type", type.value)} className={cn("rounded-xl border p-3 text-left transition-colors", draft.type === type.value ? "border-[#55c98b]/30 bg-[#55c98b]/10" : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14]")}><span className={cn("block text-xs font-medium", draft.type === type.value ? "text-[#65d395]" : "text-[#c7ccca]")}>{type.label}</span><span className="mt-1 block text-[10px] text-[#626a6c]">{type.hint}</span></button>)}</div></div>

            {needsTarget && <div className="grid grid-cols-2 gap-4"><label><span className={labelClass}>{draft.type === "scale" ? "Scale maximum" : "Target"}</span><input type="number" min="1" value={draft.target ?? ""} onChange={(e) => update("target", Number(e.target.value))} className={fieldClass} placeholder={draft.type === "duration" ? "30" : "1"} /></label><label><span className={labelClass}>Unit</span><input value={draft.unit ?? ""} onChange={(e) => update("unit", e.target.value)} className={fieldClass} placeholder={draft.type === "duration" ? "minutes" : draft.type === "scale" ? "/10" : "units"} /></label></div>}

            <div><span className={labelClass}>Schedule</span><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{(["daily", "weekdays", "weekly_target", "custom"] as const).map((mode) => <button key={mode} onClick={() => updateSchedule({ mode })} className={cn("rounded-xl border px-3 py-3 text-xs capitalize", draft.scheduleConfig?.mode === mode ? "border-white/[0.16] bg-white/[0.08] text-white" : "border-white/[0.07] text-[#747c7e]")}>{mode.replace("_", " ")}</button>)}</div></div>
            {draft.scheduleConfig?.mode === "weekdays" && <div className="flex gap-2">{weekdays.map((day, index) => { const selected = draft.scheduleConfig?.weekdays?.includes(day.value); return <button key={`${day.value}-${index}`} onClick={() => updateSchedule({ weekdays: selected ? draft.scheduleConfig?.weekdays?.filter((value) => value !== day.value) : [...(draft.scheduleConfig?.weekdays ?? []), day.value] })} className={cn("flex h-9 flex-1 items-center justify-center rounded-lg border font-mono text-[9px]", selected ? "border-[#55c98b]/30 bg-[#55c98b]/10 text-[#65d395]" : "border-white/[0.07] text-[#646c6e]")}>{day.label}</button>; })}</div>}
            {draft.scheduleConfig?.mode === "weekly_target" && <label><span className={labelClass}>Times per week</span><input type="number" min="1" max="7" value={draft.scheduleConfig.weeklyTarget ?? 3} onChange={(e) => updateSchedule({ weeklyTarget: Number(e.target.value) })} className={fieldClass} /></label>}
            {draft.scheduleConfig?.mode === "custom" && <div className="grid grid-cols-2 gap-4"><label><span className={labelClass}>Repeat every</span><input type="number" min="1" value={draft.scheduleConfig.intervalDays ?? 2} onChange={(e) => updateSchedule({ intervalDays: Number(e.target.value) })} className={fieldClass} /></label><label><span className={labelClass}>Starting</span><input type="date" value={draft.scheduleConfig.startDate ?? new Date().toISOString().slice(0, 10)} onChange={(e) => updateSchedule({ startDate: e.target.value })} className={fieldClass} /></label></div>}

            <button onClick={() => setAdvanced((value) => !value)} className="flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-xs font-medium text-[#a6adae]">Advanced settings <ChevronDown className={cn("h-4 w-4 transition-transform", advanced && "rotate-180")} /></button>

            {advanced && <div className="space-y-5 rounded-2xl border border-white/[0.07] bg-[#0c0f10] p-4">
              <div className="grid gap-4 sm:grid-cols-3"><label><span className={labelClass}>Reminder</span><input type="time" value={draft.reminder ?? ""} onChange={(e) => update("reminder", e.target.value)} className={fieldClass} /></label><label><span className={labelClass}>Priority</span><select value={draft.priority} onChange={(e) => update("priority", e.target.value as ActionDraft["priority"])} className={fieldClass}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option></select></label><label><span className={labelClass}>Classification</span><select value={draft.classification} onChange={(e) => update("classification", e.target.value as ActionDraft["classification"])} className={fieldClass}><option value="positive">Positive</option><option value="neutral">Neutral</option><option value="negative">Negative</option></select></label></div>
              <div><span className={labelClass}>Icon</span><div className="flex flex-wrap gap-2">{iconOptions.map((icon) => { const Icon = iconMap[icon as keyof typeof iconMap]; return <button key={icon} onClick={() => update("icon", icon)} className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", draft.icon === icon ? "border-[#55c98b]/30 bg-[#55c98b]/10 text-[#65d395]" : "border-white/[0.07] text-[#687073]")}><Icon className="h-4 w-4" /></button>; })}<label className="ml-auto"><span className="sr-only">Custom color</span><input type="color" value={draft.color || "#55c98b"} onChange={(e) => update("color", e.target.value)} className="h-10 w-10 cursor-pointer rounded-xl border border-white/[0.07] bg-transparent p-1" /></label></div></div>
              <label><span className={labelClass}>Notes</span><textarea value={draft.notes ?? ""} onChange={(e) => update("notes", e.target.value)} className="min-h-20 w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.035] p-3 text-sm outline-none placeholder:text-[#51595b] focus:border-[#55c98b]/45" placeholder="Private setup notes" /></label>
              <div className="grid gap-2 sm:grid-cols-3">{[["includeInAnalytics", "Include in analytics"], ["includeInRecovery", "Recovery analysis"], ["active", "Action is active"]].map(([key, label]) => <label key={key} className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-3 text-xs text-[#a7adaf]"><span>{label}</span><input type="checkbox" checked={Boolean(draft[key as keyof ActionDraft])} onChange={(e) => update(key as keyof ActionDraft, e.target.checked as never)} className="h-4 w-4 accent-[#55c98b]" /></label>)}</div>
              <div><div className="flex items-center justify-between"><span className={labelClass}>Custom fields</span><button onClick={addCustomField} className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[#65d395]"><Plus className="h-3 w-3" /> Add field</button></div><div className="space-y-3">{(draft.customFieldDefinitions ?? []).map((field) => <div key={field.id} className="grid grid-cols-[1fr_110px_36px] gap-2 rounded-xl border border-white/[0.055] p-2"><input value={field.name} onChange={(e) => updateCustomField(field.id, { name: e.target.value })} className={fieldClass} /><select value={field.type} onChange={(e) => updateCustomField(field.id, { type: e.target.value as CustomFieldType })} className={fieldClass}>{fieldTypes.map((type) => <option key={type}>{type}</option>)}</select><button onClick={() => removeCustomField(field.id)} className="flex h-11 items-center justify-center rounded-xl border border-white/[0.07] text-[#7b6565]"><Trash2 className="h-3.5 w-3.5" /></button><label className="col-span-2 flex items-center gap-2 px-1 text-[10px] text-[#747c7e]"><input type="checkbox" checked={field.required} onChange={(e) => updateCustomField(field.id, { required: e.target.checked })} className="h-3.5 w-3.5 accent-[#55c98b]" /> Required when completing</label>{(field.type === "dropdown" || field.type === "multiselect") && <input value={field.options?.join(", ") ?? ""} onChange={(e) => updateCustomField(field.id, { options: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} className={`${fieldClass} col-span-3`} placeholder="Options, separated by commas" />}</div>)}</div></div>
            </div>}
          </div>

          <button onClick={save} disabled={!draft.name.trim() || !draft.categoryId} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e8eeea] text-sm font-semibold text-[#101412] transition-colors hover:bg-white disabled:opacity-40"><Check className="h-4 w-4" /> {action ? "Save changes" : "Create action"}</button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
