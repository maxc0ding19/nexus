import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AppShell } from "@/components/nexus/AppShell";
import { ModulePage } from "@/components/nexus/ModulePage";
import ActionDetail from "@/pages/ActionDetail";
import Actions from "@/pages/Actions";
import Index from "@/pages/Index";
import More from "@/pages/More";
import Recovery from "@/pages/Recovery";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Index />} />
            <Route path="/recovery" element={<Recovery />} />
            <Route path="/analytics" element={<ModulePage label="Analysis layer" title="Analytics" description="Purposeful trends and comparisons designed to answer clear questions about your behavior." />} />
            <Route path="/actions" element={<Actions />} />
            <Route path="/actions/:actionId" element={<ActionDetail />} />
            <Route path="/more" element={<More />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
