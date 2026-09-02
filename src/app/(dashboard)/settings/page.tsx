"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  Download,
  Upload,
  User,
  LogOut,
  Shield,
  Database,
  ExternalLink,
} from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { useCommandBar } from "@/components/command-bar-provider";
import { createClient } from "@/lib/supabase/client";
import {
  useNotificationPermission,
  useNotificationSettings,
} from "@/hooks/use-notifications";
import { validateImport } from "@/lib/export-import";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { User as SupabaseUser } from "@supabase/supabase-js";

export default function SettingsPage() {
  const { openCommandBar } = useCommandBar();
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [importing, setImporting] = useState(false);

  const { permission, requestPermission, isSupported } =
    useNotificationPermission();
  const { settings: notifSettings, updateSettings } = useNotificationSettings();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user);
    });
  }, []);

  const handleExport = async () => {
    try {
      const response = await fetch("/api/export");
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const filename = `z4-export-${new Date().toISOString().split("T")[0]}.json`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully!", { duration: 3000 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await validateImport(file);
    if (!result.valid || !result.data) {
      toast.error(result.error || "Invalid import file");
      return;
    }
    setImporting(true);
    try {
      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Import failed");
      toast.success(
        `Imported ${data.counts.tasks} tasks, ${data.counts.habits} habits, ${data.counts.notes} notes!`,
        { duration: 4000 }
      );
      e.target.value = "";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  };

  const toggleNotification = (key: "overdueTasks" | "habitReminders") => {
    updateSettings({ [key]: !notifSettings[key] });
  };

  const notificationToggles = [
    { key: "overdueTasks" as const, label: "Overdue task reminders", desc: "Get notified when tasks become overdue" },
    { key: "habitReminders" as const, label: "Habit streak reminders", desc: "Don't break your streak" },
  ];

  return (
    <div>
      <Header
        title="Settings"
        subtitle="Manage your preferences and data"
        rightContent={
          <button
            onClick={openCommandBar}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-muted rounded-lg hover:bg-accent transition-colors"
          >
            <kbd className="px-1.5 py-0.5 bg-background rounded text-muted-foreground">
              Ctrl K
            </kbd>
            AI
          </button>
        }
      />

      <div className="space-y-8">{/* Notifications */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          <div className="space-y-3">
            {!isSupported ? (
              <p className="text-sm text-muted-foreground">
                Browser notifications are not supported in your browser.
              </p>
            ) : (
              <>
                {permission === "default" && (
                  <Button onClick={requestPermission} className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Enable Browser Notifications
                  </Button>
                )}
                {permission === "granted" && (
                  <div className="flex items-center gap-2 text-sm text-green-500">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Notifications are enabled
                  </div>
                )}
                {permission === "denied" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>Notifications are blocked. Check your browser settings to re-enable.</span>
                    <a
                      href="https://support.google.com/chrome/answer/9488248"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      How to fix <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {notificationToggles.map((opt) => (
                  <div key={opt.key} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="font-medium text-sm">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                    <button
                      onClick={() => toggleNotification(opt.key)}
                      disabled={permission !== "granted"}
                      className={cn(
                        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                        notifSettings[opt.key] ? "bg-primary" : "bg-muted",
                        permission !== "granted" && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          notifSettings[opt.key] ? "translate-x-5" : "translate-x-0.5"
                        )}
                      />
                    </button>
                  </div>
                ))}
              </>)}
          </div>
        </motion.section>

        {/* Data Management */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Data Management</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium">Export Your Data</p>
                <p className="text-sm text-muted-foreground">
                  Download all your tasks, habits, and notes as JSON
                </p>
              </div>
              <Button onClick={handleExport} variant="secondary" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium">Import Data</p>
                <p className="text-sm text-muted-foreground">
                  Restore from a previously exported Z4 backup file
                </p>
              </div>
              <label className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={importing}
                  className="sr-only"
                />
                <Button variant="secondary" disabled={importing} className="flex items-center gap-2">
                  {importing ? "Importing…" : (<><Upload className="w-4 h-4" /> Import</>)}
                </Button>
              </label>
            </div>
          </div>
        </motion.section>

        {/* Account */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Account</h2>
          </div>
          <div className="space-y-4">
            {user && (
              <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Account ID: {user.id.slice(0, 8)}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}