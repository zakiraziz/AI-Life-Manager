"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Task } from "@/lib/types";
import { isPastDue } from "@/lib/utils";
import { format } from "date-fns";
import toast from "react-hot-toast";

export type NotificationPermissionStatus =
  | "default"
  | "granted"
  | "denied"
  | "unsupported";

export interface NotificationSettings {
  enabled: boolean;
  overdueTasks: boolean;
  habitReminders: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  overdueTasks: true,
  habitReminders: true,
};

const STORAGE_KEY = "z4-notification-settings";

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermissionStatus>(
    "default"
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as any);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      toast.error("Notifications are not supported in this browser");
      return "unsupported" as NotificationPermissionStatus;
    }
    const result = await Notification.requestPermission();
    setPermission(result as any);
    if (result === "granted") {
      toast.success("Notifications enabled! 🔔", { duration: 2000 });
    } else if (result === "denied") {
      toast.error(
        "Notifications blocked. You can enable them in your browser settings."
      );
    }
    return result as NotificationPermissionStatus;
  }, []);

  return { permission, requestPermission, isSupported: permission !== "unsupported" };
}

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(
    DEFAULT_SETTINGS
  );

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (patch: Partial<NotificationSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  return { settings, updateSettings };
}

/**
 * Checks for overdue tasks and fires browser notifications.
 * Should be called on app load (client-side only).
 */
export function useOverdueNotifications(userId: string) {
  const [permission, requestPermission] = useNotificationPermission();
  const { settings } = useNotificationSettings();
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId || !settings.enabled || !settings.overdueTasks) return;
    if (permission !== "granted") return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    let cancelled = false;
    const supabase = createClient();

    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "todo")
      .not("due_date", "is", null)
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;

        const overdue = data.filter((t) => isPastDue(t.due_date!));
        for (const task of overdue) {
          if (notifiedIds.has(task.id)) continue;
          setNotifiedIds((prev) => new Set(prev).add(task.id));

          // eslint-disable-next-line no-new
          new Notification("Z4 — Overdue task", {
            body: `"${task.title}" was due ${format(
              new Date(task.due_date!),
              "MMM d"
            )}`,
            tag: `task-${task.id}`,
            icon: "/favicon.ico",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId, permission, settings, notifiedIds, requestPermission]);

  return { permission, requestPermission, settings };
}