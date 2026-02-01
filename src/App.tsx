import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RoomSetup from "./pages/RoomSetup";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import MonthlySummary from "./pages/MonthlySummary";
import Settlement from "./pages/Settlement";
import RoomSettings from "./pages/RoomSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/room-setup" element={<RoomSetup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/monthly-summary" element={<MonthlySummary />} />
          <Route path="/settlement" element={<Settlement />} />
          <Route path="/room-settings" element={<RoomSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
