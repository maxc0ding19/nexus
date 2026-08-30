import { useState } from "react";
import { Archive, ArrowDown, ArrowUp, Check, Folder, Plus } from "lucide-react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import type { Category } from "@/types/nexus";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onCreate: (input: Pick<Category, "name" | "icon" | "color">) => void;
  onUpdate: (id: string, updates: Partial<Pick<Category, "name" | "icon" | "color" | "archived">>) => void;
  onReorder: (id: string, direction: -1 | 1) => void;
}

export function CategoryManager({ open, onOpenChange, categories, onCreate, onUpdate, onReorder }: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#55c98b");
  const ordered = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const create = () => { if (!name.trim()) return; onCreate({ name: name.trim(), icon: "folder", color }); setName(""); };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent className="max-h-[90vh] rounded-t-[1.8rem] border-white/[0.09] bg-[#101314] text-[#edf0ee] outline-none">
        <div className="mx-auto w-full max-w-xl overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6">
          <DrawerHeader className="px-0 pb-4 pt-5 text-left"><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#55c98b]">System structure</p><DrawerTitle className="mt-2 text-2xl font-medium tracking-[-0.04em]">Categories</DrawerTitle><DrawerDescription className="text-[#747c7e]">Organize actions around the areas that matter to you.</DrawerDescription></DrawerHeader>
          <div className="flex gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3"><input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && create()} placeholder="New category" className="h-10 min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-[#0b0e0f] px-3 text-sm outline-none placeholder:text-[#525a5c] focus:border-[#55c98b]/40" /><input aria-label="Category color" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-10 rounded-xl border border-white/[0.08] bg-transparent p-1" /><button onClick={create} disabled={!name.trim()} className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8eeea] text-[#101412] disabled:opacity-40"><Plus className="h-4 w-4" /></button></div>
          <div className="mt-4 divide-y divide-white/[0.055] overflow-hidden rounded-2xl border border-white/[0.07]">
            {ordered.map((category, index) => <div key={category.id} className={`flex items-center gap-3 p-3 ${category.archived ? "opacity-45" : ""}`}><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025]" style={{ color: category.color || "#8b9395" }}><Folder className="h-4 w-4" /></span><input defaultValue={category.name} onBlur={(e) => e.target.value.trim() && onUpdate(category.id, { name: e.target.value.trim() })} className="min-w-0 flex-1 bg-transparent text-sm text-[#d9dddb] outline-none" /><div className="flex gap-1"><button onClick={() => onReorder(category.id, -1)} disabled={index === 0} aria-label="Move category up" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#687073] hover:bg-white/[0.05] disabled:opacity-20"><ArrowUp className="h-3.5 w-3.5" /></button><button onClick={() => onReorder(category.id, 1)} disabled={index === ordered.length - 1} aria-label="Move category down" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#687073] hover:bg-white/[0.05] disabled:opacity-20"><ArrowDown className="h-3.5 w-3.5" /></button><button onClick={() => onUpdate(category.id, { archived: !category.archived })} aria-label={category.archived ? "Restore category" : "Archive category"} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#817070] hover:bg-white/[0.05]">{category.archived ? <Check className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}</button></div></div>)}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
