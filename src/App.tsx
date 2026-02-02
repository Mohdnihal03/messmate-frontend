import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
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
import Help from "./pages/Help"; // Added Help import
import ProtectedRoute from "./components/ProtectedRoute"; // Assuming ProtectedRoute is a new component

const queryClient = new QueryClient();

function App() { // Changed to function declaration
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="messmate-theme"> {/* Changed ThemeProvider props */}
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route
                path="/room-setup"
                element={
                  <ProtectedRoute>
                    <RoomSetup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-expense"
                element={
                  <ProtectedRoute>
                    <AddExpense />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/monthly-summary"
                element={
                  <ProtectedRoute>
                    <MonthlySummary />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settlement"
                element={
                  <ProtectedRoute>
                    <Settlement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/room-settings"
                element={
                  <ProtectedRoute>
                    <RoomSettings />
                  </ProtectedRoute>
                }
              />
              <Route // Added Help route
                path="/help"
                element={
                  <ProtectedRoute>
                    <Help />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster /> {/* Moved Toaster */}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
