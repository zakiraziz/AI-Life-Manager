import { createClient } from "@/lib/supabase/server";
import { TaskList } from "@/components/task-list";
import { Task, Habit, Note } from "@/lib/types";
import { User } from "@supabase/supabase-js";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  CheckSquare,
  Flame,
  StickyNote,
  Plus,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";

export default async function TodayPage() {
  let tasks: Task[] = [];
  let habits: Habit[] = [];
  let notes: Note[] = [];
  let user: User | null = null;

  try {
    const supabase = createClient();

    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    user = u;

    if (user) {
      // Fetch today's tasks, all habits, recent notes
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("position", { ascending: true });

      const { data: habitsData } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const { data: notesData } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(3);

      tasks = (tasksData || []) as Task[];
      habits = (habitsData || []) as Habit[];
      notes = (notesData || []) as Note[];
    }
  } catch {
    // Supabase unavailable (e.g. during static export without credentials).
  }

  if (!user) {
    return null;
  }

  const todayTasks = tasks.filter(
    (t) =>
      t.due_date &&
      new Date(t.due_date).toDateString() === new Date().toDateString()
  );

  const completedToday = tasks.filter(
    (t) =>
      t.status === "done" &&
      t.completed_at &&
      new Date(t.completed_at).toDateString() === new Date().toDateString()
  ).length;

  const totalTasks = tasks.length;

  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Good morning"
      : today.getHours() < 18
      ? "Good afternoon"
      : "Good evening";

  const completionRate =
    totalTasks > 0 ? Math.round((completedToday / totalTasks) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold">
          {greeting},{" "}
          {user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "friend"}
          !
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {format(today, "EEEE, MMMM d, yyyy")}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {completedToday}/{todayTasks.length || totalTasks}
              </p>
              <p className="text-xs text-muted-foreground">Tasks today</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{habits.length}</p>
              <p className="text-xs text-muted-foreground">Active habits</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <StickyNote className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{notes.length}</p>
              <p className="text-xs text-muted-foreground">Recent notes</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Completion Rate */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Daily Progress</span>
          <span className="text-sm text-muted-foreground">
            {completionRate}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="h-full bg-primary rounded-full"
          />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-3 mb-8"
      >
        <Link href="/tasks">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </motion.button>
        </Link>
        <Link href="/habits">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground"
          >
            <Flame className="w-4 h-4" />
            Log Habit
          </motion.button>
        </Link>
        <Link href="/notes">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground"
          >
            <StickyNote className="w-4 h-4" />
            New Note
          </motion.button>
        </Link>
      </motion.div>

      {/* Today's Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          Today&apos;s Tasks
        </h2>
        <TaskList />
      </motion.div>
    </div>
  );
}