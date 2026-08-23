"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Flame, Trash2, Pencil } from "lucide-react";
import { Header } from "@/components/header";
import { HabitHeatmap } from "@/components/habit-heatmap";
import { HabitForm } from "@/components/habit-form";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useHabits, useDeleteHabit } from "@/hooks/use-habits";
import { useCommandBar } from "@/components/command-bar-provider";
import { Habit } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function HabitsPage() {
  const { data: habits, isLoading, error } = useHabits();
  const deleteHabit = useDeleteHabit();
  const { openCommandBar } = useCommandBar();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  const handleDelete = (habit: Habit) => {
    if (confirm(`Delete habit "${habit.name}"?`)) {
      deleteHabit.mutate(habit.id, {
        onSuccess: () => toast.success("Habit deleted"),
      });
    }
  };

  return (
    <div>
      <Header
        title="Habits"
        subtitle="Build streaks and track your daily routines"
        rightContent={
          <div className="flex gap-2">
            <button
              onClick={openCommandBar}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-muted rounded-lg hover:bg-accent transition-colors"
            >
              <kbd className="px-1.5 py-0.5 bg-background rounded text-muted-foreground">
                Ctrl K
              </kbd>
              AI
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Habit
            </motion.button>
          </div>
        }
      />

      {/* Create Form Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <HabitForm habit={null} onClose={() => setShowCreateForm(false)} />
        )}
        {editingHabit && (
          <HabitForm habit={editingHabit} onClose={() => setEditingHabit(null)} />
        )}
      </AnimatePresence>

      {/* Habits Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={<Flame className="w-8 h-8" />}
          title="Error loading habits"
          description={(error as Error).message}
        />
      ) : !habits || habits.length === 0 ? (
        <EmptyState
          icon={<Flame className="w-8 h-8" />}
          title="No habits yet"
          description="Create your first habit to start building streaks!"
          action={
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Create Habit
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((habit, index) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${habit.color}20` }}
                  >
                    <Flame
                      className="w-5 h-5"
                      style={{ color: habit.color }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{habit.name}</h3>
                    {habit.description && (
                      <p className="text-xs text-muted-foreground">
                        {habit.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingHabit(habit)}
                    className="p-1.5 rounded hover:bg-accent transition-colors"
                    title="Edit habit"
                  >
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(habit)}
                    className="p-1.5 rounded hover:bg-accent hover:text-destructive transition-colors"
                    title="Delete habit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {userId && <HabitHeatmap habit={habit} userId={userId} />}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}