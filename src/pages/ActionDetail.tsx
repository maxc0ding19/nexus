import { useMemo, useState } from "react";
import { Archive, ArrowLeft, BarChart3, CalendarDays, Check, Clock3, Pencil, RotateCcw } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ActionCompletionDrawer } from "@/components/actions/ActionCompletionDrawer";
import { ActionCreator } from "@/components/actions/ActionCreator";
import { Panel, SectionLabel } from "@/components/nexus/Panel";
import { useNexus } from "@/hooks/use-nexus";
import { dateKey, isActionScheduled, scheduleLabel } from "@/lib/action-schedule";

export default function ActionDetail() {
  const { actionId } = useParams();
  const navigate = useNavigate();
  const { state, completeAction, updateAction, archiveAction } = useNexus();
  const [completionOpen, setCompletionOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const action = state.actions.find((item) => item.id === actionId);
  const history = useMemo(() => state.completions.filter((item) => item.actionId === actionId).sort((a, b) => (b.completedAt ?? b.date).localeCompare(a.completedAt ?? a.date)), [state.completions, actionId]);

  if (!action) return <div className="py-20 text-center"><p className="text-sm text-[#7b8385]">Action not found.</p><Link to="/actions" className="mt-4 inline-block text-xs text-[#55c98b]">Return to Actions</Link></div>;

  const todayCompletion = history.find((item) => item.date === dateKey());
  const last14 = Array.from({ length: 14 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (13 - index)); const key = dateKey(date); return { key, scheduled: isActionScheduled(action, date, state.completions), complete: history.some((item) => item.date === key) }; });
  const scheduledDays = last14.filter((day) => day.scheduled).length;
  const consistency = scheduledDays ? Math.round((last14.filter((day) => day.scheduled && day.complete).length / scheduledDays) * 100) : 0;
  const category = state.categories.find((item) => item.id === action.categoryId);
  const archive = () => { archiveAction(action.id, !action.archived); if (!action.archived) navigate("/actions"); };

  return (
    <div className="mx-auto max-w-5xl animate-[enter_380ms_ease-out_both]">
      <Link to="/actions" className="inline-flex items-center gap-2 text-xs text-[#737b7d] hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> All actions</Link>
      <div className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><div className="flex items-center gap-2"><span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#747c7e]">{action.type}</span><span className="font-mono text-[9px] text-[#5c6466]">{category?.name}</span></div><h1 className="mt-4 text-3xl font-medium tracking-[-0.045em] sm:text-4xl">{action.name}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#737b7d]">{action.description || "No description provided."}</p></div>
        <div className="flex gap-2"><button onClick={() => setEditOpen(true)} className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-xs text-[#a8aeaf]"><Pencil className="h-3.5 w-3.5" /> Edit</button><button onClick={() => setCompletionOpen(true)} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#e8eeea] px-4 text-xs font-semibold text-[#101412]"><Check className="h-3.5 w-3.5" /> {todayCompletion ? "Update today" : "Complete"}</button></div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <Panel className="p-5 sm:p-6"><SectionLabel detail={<span className="font-mono text-[9px] text-[#55c98b]">14 DAY VIEW</span>}>Recent consistency</SectionLabel><div className="mt-6 flex items-end justify-between"><div><p className="text-4xl font-medium tracking-[-0.05em] text-white">{consistency}%</p><p className="mt-2 text-xs text-[#697173]">Completed on scheduled days</p></div><BarChart3 className="h-5 w-5 text-[#596164]" /></div><div className="mt-7 grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1.5">{last14.map((day) => <div key={day.key} title={day.key} className={`h-12 rounded-md border ${day.complete ? "border-[#55c98b]/30 bg-[#55c98b]/35" : day.scheduled ? "border-white/[0.08] bg-white/[0.035]" : "border-white/[0.035] bg-transparent"}`} />)}</div><div className="mt-3 flex justify-between font-mono text-[8px] uppercase tracking-[0.1em] text-[#555d5f]"><span>14 days ago</span><span>Today</span></div></Panel>
        <Panel className="p-5 sm:p-6"><SectionLabel>Current progress</SectionLabel><p className="mt-6 text-3xl font-medium tracking-[-0.04em] text-[#e2e6e4]">{todayCompletion ? String(todayCompletion.value) : "—"}<span className="ml-2 text-xs text-[#687073]">{action.unit}</span></p><p className="mt-2 text-xs text-[#697173]">{todayCompletion ? "Recorded today" : "No completion recorded today"}</p><div className="mt-6 border-t border-white/[0.055] pt-4"><p className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#596164]">Target</p><p className="mt-1 text-sm text-[#b7bcba]">{action.target ?? (action.type === "boolean" || action.type === "avoidance" ? "Complete" : "Open entry")} {action.target ? action.unit : ""}</p></div></Panel>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Panel className="p-5 sm:p-6"><SectionLabel>Configuration</SectionLabel><div className="mt-5 space-y-4 text-xs">{[["Schedule", scheduleLabel(action)], ["Reminder", action.reminder || "None"], ["Priority", action.priority || "Normal"], ["Analytics", action.includeInAnalytics ? "Included" : "Excluded"], ["Recovery analysis", action.includeInRecovery ? "Included" : "Excluded"]].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-white/[0.055] pb-3"><span className="text-[#667073]">{label}</span><span className="capitalize text-[#b9bfbd]">{value}</span></div>)}</div></Panel>
        <Panel className="p-5 sm:p-6"><SectionLabel detail={<span className="font-mono text-[9px] text-[#596164]">{history.length} RECORDS</span>}>Completion history</SectionLabel>{history.length ? <div className="mt-4 max-h-64 divide-y divide-white/[0.055] overflow-y-auto">{history.map((entry) => <div key={entry.id} className="flex items-center justify-between py-3"><div className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#55c98b]/10 text-[#62cf92]"><Check className="h-3.5 w-3.5" /></span><div><p className="text-xs text-[#c9cecc]">{String(entry.value)}</p><p className="mt-0.5 font-mono text-[8px] uppercase text-[#596164]">{entry.actionTypeSnapshot ?? action.type} · {entry.targetSnapshot ?? action.target ?? "open"} {entry.unitSnapshot ?? action.unit ?? ""}</p></div></div><time className="font-mono text-[9px] text-[#626a6c]">{new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${entry.date}T12:00:00`))}</time></div>)}</div> : <div className="py-10 text-center"><Clock3 className="mx-auto h-5 w-5 text-[#525a5c]" /><p className="mt-3 text-xs text-[#697173]">No completions recorded yet.</p></div>}</Panel>
      </div>

      {action.notes && <Panel className="mt-5 p-5 sm:p-6"><SectionLabel>Notes</SectionLabel><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#858d8f]">{action.notes}</p></Panel>}
      <button onClick={archive} className="mt-6 flex items-center gap-2 text-xs text-[#806e6d] hover:text-[#c58a86]">{action.archived ? <RotateCcw className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />} {action.archived ? "Restore action" : "Archive action"}</button>

      <ActionCompletionDrawer open={completionOpen} onOpenChange={setCompletionOpen} action={action} onComplete={completeAction} />
      <ActionCreator open={editOpen} onOpenChange={setEditOpen} categories={state.categories} action={action} onSave={(draft) => updateAction(action.id, draft)} />
    </div>
  );
}
