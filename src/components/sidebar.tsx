"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sun,
  CheckSquare,
  Flame,
  StickyNote,
  Sparkles,
  LogOut,
  Moon,
  Search,
  Settings,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const navItems = [
  { href: "/", label: "Today", icon: Sun },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/habits", label: "Habits", icon: Flame },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/assistant", label: "AI Assistant", icon: Sparkles },
  { href: "/search", label: "Search", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 lg:w-64 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col z-40">
      {/* Logo */}
      <div className="p-4 flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="hidden lg:block">
          <h1 className="text-lg font-bold leading-tight">Z4</h1>
          <p className="text-xs text-muted-foreground">AI Life Manager</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 lg:px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary/10 rounded-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10" />
              <span className="hidden lg:block relative z-10">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-2 lg:p-3 space-y-1 border-t border-border">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            <span className="hidden lg:block">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </button>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden lg:block">Sign out</span>
        </button>
      </div>
    </aside>
  );
}