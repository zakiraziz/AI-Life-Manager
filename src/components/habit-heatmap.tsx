"use client";

import { useState } from "react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { motion } from "framer-motion";
import { Flame, CheckCircle2 } from "lucide-react";
import { Habit } from "@/lib/types";
import { useHabitLogs, useToggleHabitLog } from "@/hooks/use-habits";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";

interface HabitHeatmapProps {
  habit: Habit;
  userId: string;
}

const today = new Date();
const startDate = subDays(today, 6); // Last 7 days
const days = eachDayOfInterval({ start: startDate, end: today });

export function HabitHeatmap({ habit, userId }: HabitHeatmapProps) {
  const { data: logs, isLoading } = useHabitLogs([habit.id], 7);
  const toggleLog = useToggleHabitLog();
  const queryClient = useQueryClient();

  const loggedDates = new Set(logs?.map((l) => l.logged_date) ?? []);

  const handleToggle = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const isLogged = loggedDates.has(dateStr);
    const currentLogs = logs || [];

    // Optimistic update
    if (isLogged) {
      queryClient.setQueryData(
        ["habit-logs", [habit.id], 7],
        currentLogs.filter((l) => l.logged_date !== dateStr)
      );
    } else {
      queryClient.setQueryData(["habit-logs", [habit.id], 7], [
        ...currentLogs,
        {
          id: `temp-${dateStr}`,
          habit_id: habit.id,
          user_id: userId,
          logged_date: dateStr,
          created_at: new Date().toISOString(),
        } as any,
      ]);
    }

    toggleLog.mutate({ habitId: habit.id, userId, date });
  };

  const calculateStreak = (): number => {
    if (!logs || logs.length === 0) return 0;

    let streak = 0;
    const todayStr = today.toISOString().split("T")[0];
    const hasToday = loggedDates.has(todayStr);

    // Count consecutive days backwards from today
    for (let i = 0; i < 7; i++) {
      const day = subDays(today, i);
      const dayStr = day.toISOString().split("T")[0];
      if (loggedDates.has(dayStr)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const streak = calculateStreak();
  const todayStr = today.toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      {/* Streak + Flame */}
      <div className="flex items-center gap-4 mb-4">
        <motion.div
          className="flex items-center gap-2 text-2xl font-bold text-orange-500"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Flame className="w-7 h-7 fill-orange-500/20" />
          <span>{streak} day streak</span>
        </motion.div>
      </div>

      {/* Heatmap */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">Last 7 days</h4>
          <p className="text-xs text-muted-foreground">
            {format(startDate, "MMM d")} - {format(today, "MMM d")}
          </p>
        </div>

        {isLoading ? (
          <div className="flex gap-1">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="w-10 h-10 rounded" />
            ))}
          </div>
        ) : (
          <div className="flex gap-1.5">
            {days.map((day) => {
              const dayStr = day.toISOString().split("T")[0];
              const isLogged = loggedDates.has(dayStr);
              const isToday = dayStr === todayStr;

              return (
                <motion.button
                  key={dayStr}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleToggle(day)}
                  className={cn(
                    "flex flex-col items-center justify-center w-10 h-12 rounded-lg border transition-all",
                    isLogged
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-accent",
                    isToday && "ring-2 ring-primary"
                  )}
                >
                  <span className="text-xs font-medium">
                    {format(day, "EEE")[0]}
                  </span>
                  <span className="text-xs">{format(day, "d")}</span>
                  {isLogged && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick toggle for today */}
      <div className="mt-4 pt-3 border-t border-border">
        <button
          onClick={() => handleToggle(today)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
            loggedDates.has(todayStr)
              ? "bg-muted text-muted-foreground"
              : "bg-primary/10 text-primary hover:bg-primary/20"
          )}
        >
          <CheckCircle2 className="w-4 h-4" />
          {loggedDates.has(todayStr) ? "Mark as not done today" : "Mark as done today"}
        </button>
      </div>
    </div>
  );
}

export default HabitHeatmap;
