import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import DataUnderstanding from "./pages/DataUnderstanding";
import Trends from "./pages/Trends";
import Predictions from "./pages/Predictions";
import Policies from "./pages/Policies";
import Summary from "./pages/Summary";
import Architecture from "./pages/Architecture";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/data-understanding" element={<DataUnderstanding />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
