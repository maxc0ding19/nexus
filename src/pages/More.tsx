import { ChevronRight, Gauge, Goal, NotebookPen, Settings2 } from "lucide-react";
import { Panel, SectionLabel } from "@/components/nexus/Panel";

const items = [
  { icon: NotebookPen, title: "Journal", description: "Reflection and contextual entries" },
  { icon: Goal, title: "Goals", description: "Long-term outcomes and progress" },
  { icon: Gauge, title: "Custom dashboards", description: "Your selected signals and widgets" },
  { icon: Settings2, title: "Settings", description: "Preferences, data, and appearance" },
];

export default function More() {
  return (
    <div className="mx-auto max-w-3xl animate-[enter_350ms_ease-out_both]">
      <SectionLabel>System</SectionLabel>
      <h1 className="mt-4 text-3xl font-medium tracking-[-0.045em]">More</h1>
      <p className="mt-2 text-sm text-[#767e80]">Secondary tools, kept out of the execution path.</p>
      <Panel className="mt-8 divide-y divide-white/[0.055] overflow-hidden">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.title} className="group flex w-full items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-white/[0.025]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-[#8b9395]"><Icon className="h-[18px] w-[18px]" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-[#dfe3e1]">{item.title}</span>
                <span className="mt-1 block text-xs text-[#687073]">{item.description}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-[#555d5f] transition-transform group-hover:translate-x-0.5" />
            </button>
          );
        })}
      </Panel>
      <p className="mt-5 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-[#4e5557]">NEXUS OS · Local mode · Schema v1</p>
    </div>
  );
}
