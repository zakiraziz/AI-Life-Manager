"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Habit, HabitLog } from "@/lib/types";
import toast from "react-hot-toast";
import { startOfDay, endOfDay, subDays } from "date-fns";

const supabase = createClient();

export function useHabits() {
  return useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Habit[];
    },
  });
}

export function useHabitLogs(habitIds: string[], days: number = 30) {
  return useQuery({
    queryKey: ["habit-logs", habitIds, days],
    queryFn: async () => {
      if (!habitIds.length) return [];
      const since = subDays(new Date(), days - 1);
      const { data, error } = await supabase
        .from("habit_logs")
        .select("*")
        .in("habit_id", habitIds)
        .gte("logged_date", startOfDay(since).toISOString())
        .lte("logged_date", endOfDay(new Date()).toISOString());
      if (error) throw error;
      return data as HabitLog[];
    },
    enabled: habitIds.length > 0,
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (habit: { name: string; description?: string; color?: string; icon?: string }) => {
      const { data, error } = await supabase
        .from("habits")
        .insert(habit)
        .select()
        .single();
      if (error) throw error;
      return data as Habit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Habit> & { id: string }) => {
      const { data, error } = await supabase
        .from("habits")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Habit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("habits").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["habit-logs"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useToggleHabitLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ habitId, userId, date }: { habitId: string; userId: string; date: Date }) => {
      const dateStr = date.toISOString().split("T")[0];
      // Check if log exists
      const { data: existing, error: fetchError } = await supabase
        .from("habit_logs")
        .select("id")
        .eq("habit_id", habitId)
        .eq("logged_date", dateStr)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (existing) {
        const { error: deleteError } = await supabase
          .from("habit_logs")
          .delete()
          .eq("id", existing.id);
        if (deleteError) throw deleteError;
        return { action: "deleted" };
      } else {
        const { error: insertError } = await supabase
          .from("habit_logs")
          .insert({ habit_id: habitId, user_id: userId, logged_date: dateStr });
        if (insertError) throw insertError;
        return { action: "created" };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-logs"] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
