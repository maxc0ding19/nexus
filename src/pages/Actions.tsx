import { useMemo, useState } from "react";
import { Archive, FolderCog, MoreHorizontal, Plus, Search, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { ActionCreator } from "@/components/actions/ActionCreator";
import { CategoryManager } from "@/components/actions/CategoryManager";
import { Panel, SectionLabel } from "@/components/nexus/Panel";
import { useNexus } from "@/hooks/use-nexus";
import { scheduleLabel } from "@/lib/action-schedule";
import { cn } from "@/lib/utils";
import type { ActionDefinition } from "@/types/nexus";

export default function Actions() {
  const { state, createAction, updateAction, archiveAction, createCategory, updateCategory, reorderCategory } = useNexus();
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [editing, setEditing] = useState<ActionDefinition | undefined>();
  const [showArchived, setShowArchived] = useState(false);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => state.actions.filter((action) => action.archived === showArchived && (category === "all" || action.categoryId === category) && action.name.toLowerCase().includes(query.toLowerCase())), [state.actions, showArchived, category, query]);
  const openEdit = (action: ActionDefinition) => { setEditing(action); setCreatorOpen(true); };
  const openCreate = () => { setEditing(undefined); setCreatorOpen(true); };

  return (
    <div className="animate-[enter_380ms_ease-out_both]">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><SectionLabel>Behavior system</SectionLabel><h1 className="mt-4 text-[2.2rem] font-medium tracking-[-0.05em] sm:text-[2.7rem]">Actions</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#747c7e]">Build the system that fits your life. Nothing here is fixed.</p></div>
        <div className="flex gap-2"><button onClick={() => setCategoriesOpen(true)} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-xs font-medium text-[#aab0b1] hover:bg-white/[0.05]"><FolderCog className="h-4 w-4" /> Categories</button><button onClick={openCreate} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#e8eeea] px-5 text-sm font-semibold text-[#101412] hover:bg-white sm:flex-none"><Plus className="h-4 w-4" /> New action</button></div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-xl border border-white/[0.07] bg-[#0f1213] p-1">{[[false, "Active"], [true, "Archived"]].map(([value, label]) => <button key={label as string} onClick={() => setShowArchived(value as boolean)} className={cn("flex-1 rounded-lg px-5 py-2 font-mono text-[9px] uppercase tracking-[0.14em] sm:flex-none", showArchived === value ? "bg-white/[0.075] text-white" : "text-[#626a6c]")}>{label as string}</button>)}</div>
        <label className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3"><Search className="h-3.5 w-3.5 text-[#596164]" /><input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-xs outline-none placeholder:text-[#51595b] sm:w-48" placeholder="Search actions" /></label>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">{["all", ...state.categories.filter((item) => !item.archived).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((item) => item.id)].map((id) => { const item = state.categories.find((candidate) => candidate.id === id); return <button key={id} onClick={() => setCategory(id)} className={cn("whitespace-nowrap rounded-full border px-3 py-2 text-[11px]", category === id ? "border-white/[0.16] bg-white/[0.08] text-[#e2e6e4]" : "border-white/[0.06] text-[#687073]")}>{id === "all" ? "All actions" : item?.name}</button>; })}</div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((action) => {
          const categoryItem = state.categories.find((item) => item.id === action.categoryId);
          const completionCount = state.completions.filter((item) => item.actionId === action.id).length;
          return <Panel key={action.id} interactive className="group relative p-5"><Link to={`/actions/${action.id}`} className="block"><div className="flex items-start justify-between gap-3"><span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#727a7c]">{action.type}</span>{action.priority === "high" && <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#c6a367]">High priority</span>}</div><h2 className="mt-7 text-lg font-medium tracking-[-0.025em] text-[#e3e6e4]">{action.name}</h2><p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-[#6e7678]">{action.description || "No description"}</p><div className="mt-5 flex items-center justify-between border-t border-white/[0.055] pt-4 font-mono text-[9px] uppercase tracking-[0.1em] text-[#596164]"><span>{categoryItem?.name ?? "Uncategorized"}</span><span>{scheduleLabel(action)}</span></div><div className="mt-3 flex items-center justify-between text-[11px] text-[#747c7e]"><span>{completionCount} historical {completionCount === 1 ? "entry" : "entries"}</span><span className="text-[#55c98b]">Open →</span></div></Link><button onClick={() => openEdit(action)} aria-label={`Edit ${action.name}`} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#5d6567] opacity-0 transition-opacity hover:bg-white/[0.06] group-hover:opacity-100 focus:opacity-100"><MoreHorizontal className="h-4 w-4" /></button></Panel>;
        })}
      </div>

      {!visible.length && <Panel className="mt-5 py-16 text-center"><SlidersHorizontal className="mx-auto h-6 w-6 text-[#535b5d]" /><p className="mt-4 text-sm font-medium text-[#c5cac8]">{showArchived ? "No archived actions" : "No actions match this view"}</p><p className="mt-2 text-xs text-[#626a6c]">{showArchived ? "Archived actions retain their complete history." : "Create an action or adjust the filters."}</p>{!showArchived && <button onClick={openCreate} className="mt-5 rounded-xl bg-white/[0.07] px-4 py-2 text-xs text-white">Create action</button>}</Panel>}

      {showArchived && visible.length > 0 && <p className="mt-5 flex items-center gap-2 text-xs text-[#626a6c]"><Archive className="h-3.5 w-3.5" /> Archived actions remain available with their complete history.</p>}

      <ActionCreator open={creatorOpen} onOpenChange={setCreatorOpen} categories={state.categories} action={editing} onSave={(draft) => editing ? updateAction(editing.id, draft) : createAction(draft)} />
      <CategoryManager open={categoriesOpen} onOpenChange={setCategoriesOpen} categories={state.categories} onCreate={createCategory} onUpdate={updateCategory} onReorder={reorderCategory} />
    </div>
  );
}
