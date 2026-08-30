import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AppShell } from "@/components/nexus/AppShell";
import { ModulePage } from "@/components/nexus/ModulePage";
import Index from "@/pages/Index";
import More from "@/pages/More";
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
            <Route path="/recovery" element={<ModulePage label="Recovery system" title="Recovery" description="A supportive view of your current signal, context, and the patterns that may help you move forward." />} />
            <Route path="/analytics" element={<ModulePage label="Analysis layer" title="Analytics" description="Purposeful trends and comparisons designed to answer clear questions about your behavior." />} />
            <Route path="/actions" element={<ModulePage label="Action system" title="Actions" description="The extensible library for daily actions, boundaries, check-ins, quantities, and custom events." />} />
            <Route path="/more" element={<More />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
