import { ArrowLeft, Layers3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Panel, SectionLabel } from "./Panel";

export function ModulePage({ label, title, description }: { label: string; title: string; description: string }) {
  return (
    <div className="mx-auto max-w-3xl animate-[enter_350ms_ease-out_both]">
      <Link to="/" className="mb-8 inline-flex items-center gap-2 text-xs text-[#798083] hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> Back to command center</Link>
      <Panel className="overflow-hidden">
        <div className="relative border-b border-white/[0.06] bg-[url('/assets/nexus-grid-texture.png')] bg-cover bg-center p-7 sm:p-10">
          <div className="absolute inset-0 bg-[#101314]/90" />
          <div className="relative">
            <SectionLabel>{label}</SectionLabel>
            <h1 className="mt-5 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#8a9193]">{description}</p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-7 sm:p-10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.035] text-[#55c98b]"><Layers3 className="h-4 w-4" /></div>
          <div>
            <p className="text-sm font-medium text-[#dce0de]">Foundation connected</p>
            <p className="mt-1 text-sm leading-6 text-[#737b7d]">This module is represented in the local data model and navigation. Its full workflow is intentionally reserved for the next build phase.</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
