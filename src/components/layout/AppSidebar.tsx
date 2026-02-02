import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  CalendarDays,
  ArrowLeftRight,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getRoomsByUser } from "@/services/api";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Add Expense", url: "/add-expense", icon: PlusCircle },
  { title: "Monthly Summary", url: "/monthly-summary", icon: CalendarDays },
  { title: "Settlement", url: "/settlement", icon: ArrowLeftRight },
  { title: "Room Settings", url: "/room-settings", icon: Settings },
  { title: "Help & Guide", url: "/help", icon: HelpCircle },
];

export function AppSidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const { user } = useAuth();

  // Fetch Room Info
  const { data: roomsData } = useQuery({
    queryKey: ['rooms', user?.id],
    queryFn: () => getRoomsByUser(user!.id),
    enabled: !!user?.id,
  });
  const activeRoom = roomsData?.docs?.[0];

  const isActive = (path: string) => location.pathname === path;
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b flex items-center justify-between px-4 shadow-card">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">MessBro</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/20 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r shadow-card transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center gap-3 px-6 border-b">
            <div className="w-9 h-9 gradient-primary rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-lg text-foreground">MessBro</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.title}>
                  <Link
                    to={item.url}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive(item.url)
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Room Info */}
          <div className="p-4 border-t">
            <div className="bg-accent/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Current Room</p>
              <p className="font-medium text-sm text-foreground truncate">
                {activeRoom?.name || "No Room Selected"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {activeRoom?.members?.length || 0} members
              </p>
            </div>
          </div>

          {/* Theme Toggle & Logout */}
          <div className="p-3 border-t space-y-1">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
            <Link
              to="/login"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
