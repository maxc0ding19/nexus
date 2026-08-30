import { useEffect, useState } from "react";
import { Activity, ArrowDownToLine, Check, ChevronDown, Moon, RotateCcw, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { RecoveryLogInput } from "@/hooks/use-nexus";
import type { RecoveryEventType } from "@/types/nexus";
import { recoveryEventMeta } from "./recovery-utils";

const eventIcons = { urge: Activity, difficult: ShieldAlert, redirect: RotateCcw, setback: ArrowDownToLine, custom: Sparkles };
const responses = ["Exercise", "Left the environment", "Went outside", "Talked to someone", "Meditated", "Started another task", "Put the phone away"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (input: RecoveryLogInput) => void;
  initialType?: RecoveryEventType;
}

export function RecoveryLogDrawer({ open, onOpenChange, onSave, initialType = "urge" }: Props) {
  const [type, setType] = useState<RecoveryEventType>(initialType);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [sleepQuality, setSleepQuality] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [stress, setStress] = useState("");
  const [mood, setMood] = useState("");
  const [energy, setEnergy] = useState("");
  const [screenMinutes, setScreenMinutes] = useState("");
  const [exerciseMinutes, setExerciseMinutes] = useState("");
  const [socialInteraction, setSocialInteraction] = useState<"none" | "some" | "significant" | "">("");
  const [alone, setAlone] = useState<boolean | undefined>();
  const [generalContext, setGeneralContext] = useState("");
  const [precedingActivity, setPrecedingActivity] = useState("");
  const [helpfulResponse, setHelpfulResponse] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => { setType(initialType); }, [initialType, open]);

  const optionalNumber = (value: string) => value === "" ? undefined : Number(value);
  const reset = () => {
    setDetailsOpen(false); setCustomLabel(""); setSleepQuality(""); setSleepHours(""); setStress(""); setMood(""); setEnergy(""); setScreenMinutes(""); setExerciseMinutes(""); setSocialInteraction(""); setAlone(undefined); setGeneralContext(""); setPrecedingActivity(""); setHelpfulResponse(""); setNotes("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const save = () => {
    onSave({
      type,
      customLabel: type === "custom" ? customLabel : undefined,
      context: {
        sleepQuality: optionalNumber(sleepQuality), sleepHours: optionalNumber(sleepHours), stress: optionalNumber(stress), mood: optionalNumber(mood), energy: optionalNumber(energy), screenMinutes: optionalNumber(screenMinutes), exerciseMinutes: optionalNumber(exerciseMinutes),
        socialInteraction: socialInteraction || undefined, alone, generalContext: generalContext.trim() || undefined, precedingActivity: precedingActivity.trim() || undefined, helpfulResponse: helpfulResponse.trim() || undefined, notes: notes.trim() || undefined,
      },
    });
    toast.success("Event logged privately", { description: "Recorded as data. Continue forward." });
    handleOpenChange(false);
  };

  const fieldClass = "h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-sm text-[#e6e9e7] outline-none transition-colors placeholder:text-[#535b5d] focus:border-[#55c98b]/45";
  const labelClass = "mb-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-[#737b7d]";

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} shouldScaleBackground={false}>
      <DrawerContent className="max-h-[92vh] rounded-t-[1.8rem] border-white/[0.09] bg-[#101314] text-[#eef1ef] outline-none">
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-white/[0.13]" />
        <div className="mx-auto w-full max-w-2xl overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6">
          <DrawerHeader className="px-0 pb-3 pt-5 text-left">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#55c98b]">Private local log</p>
            <DrawerTitle className="mt-2 text-2xl font-medium tracking-[-0.035em]">What happened?</DrawerTitle>
            <DrawerDescription className="text-[#747c7e]">Choose one. Context is optional.</DrawerDescription>
          </DrawerHeader>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {(Object.keys(recoveryEventMeta) as RecoveryEventType[]).map((eventType) => {
              const Icon = eventIcons[eventType];
              return (
                <button key={eventType} onClick={() => setType(eventType)} className={cn("rounded-2xl border p-3 text-left transition-colors", type === eventType ? recoveryEventMeta[eventType].tone : "border-white/[0.07] bg-white/[0.025] text-[#747c7e] hover:border-white/[0.15]")}>
                  <Icon className="h-4 w-4" />
                  <span className="mt-4 block text-xs font-medium leading-4">{recoveryEventMeta[eventType].label}</span>
                </button>
              );
            })}
          </div>

          {type === "custom" && <input value={customLabel} onChange={(event) => setCustomLabel(event.target.value)} className={`${fieldClass} mt-3`} placeholder="Name this event" />}

          <button onClick={() => setDetailsOpen((value) => !value)} className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-xs font-medium text-[#a6adae]">
            Add context <ChevronDown className={cn("h-4 w-4 transition-transform", detailsOpen && "rotate-180")} />
          </button>

          {detailsOpen && (
            <div className="mt-4 space-y-5 rounded-2xl border border-white/[0.07] bg-[#0c0f10] p-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <label><span className={labelClass}>Sleep quality · 1–10</span><input type="number" min="1" max="10" value={sleepQuality} onChange={(e) => setSleepQuality(e.target.value)} className={fieldClass} placeholder="Optional" /></label>
                <label><span className={labelClass}>Sleep duration</span><input type="number" min="0" max="24" step="0.1" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} className={fieldClass} placeholder="Hours" /></label>
                <label><span className={labelClass}>Stress · 1–10</span><input type="number" min="1" max="10" value={stress} onChange={(e) => setStress(e.target.value)} className={fieldClass} placeholder="Optional" /></label>
                <label><span className={labelClass}>Mood · 1–10</span><input type="number" min="1" max="10" value={mood} onChange={(e) => setMood(e.target.value)} className={fieldClass} placeholder="Optional" /></label>
                <label><span className={labelClass}>Energy · 1–10</span><input type="number" min="1" max="10" value={energy} onChange={(e) => setEnergy(e.target.value)} className={fieldClass} placeholder="Optional" /></label>
                <label><span className={labelClass}>Screen time</span><input type="number" min="0" value={screenMinutes} onChange={(e) => setScreenMinutes(e.target.value)} className={fieldClass} placeholder="Minutes" /></label>
                <label><span className={labelClass}>Exercise</span><input type="number" min="0" value={exerciseMinutes} onChange={(e) => setExerciseMinutes(e.target.value)} className={fieldClass} placeholder="Minutes" /></label>
                <label><span className={labelClass}>Social interaction</span><select value={socialInteraction} onChange={(e) => setSocialInteraction(e.target.value as typeof socialInteraction)} className={fieldClass}><option value="">Optional</option><option value="none">None</option><option value="some">Some</option><option value="significant">Significant</option></select></label>
                <div><span className={labelClass}>Were you alone?</span><div className="flex h-11 rounded-xl border border-white/[0.08] bg-white/[0.025] p-1">{[{ label: "Yes", value: true }, { label: "No", value: false }].map((option) => <button key={option.label} onClick={() => setAlone(option.value)} className={cn("flex-1 rounded-lg text-xs", alone === option.value ? "bg-white/[0.09] text-white" : "text-[#697173]")}>{option.label}</button>)}</div></div>
              </div>

              <label><span className={labelClass}>General context</span><input value={generalContext} onChange={(e) => setGeneralContext(e.target.value)} className={fieldClass} placeholder="Where were you, or what was going on?" /></label>
              <label><span className={labelClass}>What happened beforehand?</span><input value={precedingActivity} onChange={(e) => setPrecedingActivity(e.target.value)} className={fieldClass} placeholder="Optional" /></label>

              {(type === "redirect" || type === "urge" || type === "difficult") && <div><span className={labelClass}>What helped?</span><div className="flex flex-wrap gap-2">{responses.map((response) => <button key={response} onClick={() => setHelpfulResponse(response)} className={cn("rounded-full border px-3 py-2 text-[11px] transition-colors", helpfulResponse === response ? "border-[#55c98b]/30 bg-[#55c98b]/10 text-[#6bd69a]" : "border-white/[0.08] text-[#777f81]")}>{response}</button>)}</div><input value={helpfulResponse} onChange={(e) => setHelpfulResponse(e.target.value)} className={`${fieldClass} mt-3`} placeholder="Or enter a custom response" /></div>}
              <label><span className={labelClass}>Private notes</span><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-20 w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.035] p-3 text-sm outline-none placeholder:text-[#535b5d] focus:border-[#55c98b]/45" placeholder="Anything else worth remembering?" /></label>
            </div>
          )}

          <button onClick={save} disabled={type === "custom" && !customLabel.trim()} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e8eeea] text-sm font-semibold text-[#101412] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">
            <Check className="h-4 w-4" /> Save and continue
          </button>
          <p className="mt-3 flex items-center justify-center gap-2 text-center font-mono text-[8px] uppercase tracking-[0.13em] text-[#50585a]"><Moon className="h-3 w-3" /> Stored only on this device</p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
