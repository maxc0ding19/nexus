import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Activity, BarChart3, CircleEllipsis, LayoutGrid, ListChecks, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Today", to: "/", icon: LayoutGrid },
  { label: "Recovery", to: "/recovery", icon: Activity },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
  { label: "Actions", to: "/actions", icon: ListChecks },
  { label: "More", to: "/more", icon: CircleEllipsis },
];

function NavigationLink({ item, mobile = false }: { item: (typeof navigation)[number]; mobile?: boolean }) {
  const location = useLocation();
  const active = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      className={cn(
        mobile
          ? "relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[9px] font-medium tracking-wide"
          : "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm",
        "transition-colors duration-150",
        active ? "bg-white/[0.075] text-white" : "text-[#71787b] hover:bg-white/[0.04] hover:text-[#c4c8c9]",
      )}
    >
      <Icon className={cn("h-[18px] w-[18px]", active && "text-[#55c98b]")} strokeWidth={1.8} />
      <span>{item.label}</span>
      {mobile && active && <span className="absolute -bottom-0.5 h-0.5 w-4 rounded-full bg-[#55c98b]" />}
    </NavLink>
  );
}

export function AppShell() {
  return (
    <div className="min-h-screen bg-[#090b0c] text-[#f1f3f2]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[236px] border-r border-white/[0.065] bg-[#0c0e0f]/95 px-4 py-5 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="flex h-12 items-center px-2">
          <img src="/assets/nexus-wordmark.png" alt="NEXUS" className="h-9 w-[132px] object-cover object-center mix-blend-screen" />
        </div>

        <p className="mb-3 mt-8 px-3 font-mono text-[9px] uppercase tracking-[0.22em] text-[#555c5f]">Core system</p>
        <nav className="space-y-1">
          {navigation.map((item) => <NavigationLink key={item.to} item={item} />)}
        </nav>

        <div className="mt-auto rounded-[1.3rem] border border-white/[0.07] bg-[#121516] p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#55c98b] shadow-[0_0_0_4px_rgba(85,201,139,0.08)]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#8a9193]">Local system</span>
          </div>
          <p className="text-xs leading-5 text-[#687073]">Your data stays on this device and remains available offline.</p>
        </div>
      </aside>

      <div className="lg:pl-[236px]">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-white/[0.055] bg-[#090b0c]/85 px-5 backdrop-blur-xl lg:px-8 xl:px-12">
          <img src="/assets/nexus-wordmark.png" alt="NEXUS" className="h-8 w-[112px] object-cover object-center mix-blend-screen lg:hidden" />
          <div className="hidden items-center gap-2 lg:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#55c98b]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6f7779]">System operational</span>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Search" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.025] text-[#808789] transition-colors hover:text-white">
              <Search className="h-4 w-4" />
            </button>
            <button aria-label="Quick add" className="flex h-9 items-center gap-2 rounded-full bg-[#e9eeeb] px-3.5 text-xs font-semibold text-[#111513] transition-colors hover:bg-white">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Quick add</span>
            </button>
          </div>
        </header>

        <main className="mx-auto min-h-[calc(100vh-68px)] max-w-[1260px] px-4 pb-28 pt-7 sm:px-6 lg:px-8 lg:pb-12 lg:pt-10 xl:px-12">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-50 flex items-center rounded-[1.5rem] border border-white/[0.09] bg-[#111415]/95 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-2xl lg:hidden">
        {navigation.map((item) => <NavigationLink key={item.to} item={item} mobile />)}
      </nav>
    </div>
  );
}
