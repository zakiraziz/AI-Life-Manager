"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search as SearchIcon,
  CheckSquare,
  Flame,
  StickyNote,
  Clock,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import { Header } from "@/components/header";
import { useCommandBar } from "@/components/command-bar-provider";
import { useTasks } from "@/hooks/use-tasks";
import { useHabits } from "@/hooks/use-habits";
import { useNotes } from "@/hooks/use-notes";
import { Task, Habit, Note } from "@/lib/types";
import { isPastDue, isToday, cn } from "@/lib/utils";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { format } from "date-fns";

export default function SearchPage() {
  const { openCommandBar } = useCommandBar();
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: notes, isLoading: notesLoading } = useNotes();

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const isLoading = tasksLoading || habitsLoading || notesLoading;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const matchedTasks: Task[] =
      tasks?.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description?.toLowerCase().includes(q) ?? false)
      ) ?? [];

    const matchedHabits: Habit[] =
      habits?.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          (h.description?.toLowerCase().includes(q) ?? false)
      ) ?? [];

    const matchedNotes: Note[] =
      notes?.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content?.toLowerCase().includes(q)
      ) ?? [];

    return { tasks: matchedTasks, habits: matchedHabits, notes: matchedNotes };
  }, [query, tasks, habits, notes]);

  const totalResults = results
    ? results.tasks.length + results.habits.length + results.notes.length
    : 0;

  const recentItems = useMemo(() => {
    if (query.trim()) return null;

    const recentTasks =
      tasks
        ?.filter((t) => isToday(t.due_date) || (t.status !== "done" && isPastDue(t.due_date)))
        .slice(0, 3) ?? [];

    const recentHabits = habits?.slice(0, 3) ?? [];
    const recentNotes = notes?.slice(0, 5) ?? [];

    return { tasks: recentTasks, habits: recentHabits, notes: recentNotes };
  }, [query, tasks, habits, notes]);

  const displayData = results ?? recentItems;

  return (
    <div>
      <Header
        title="Search"
        subtitle="Search across tasks, habits, and notes"
        showSearch
        onSearch={setQuery}
        searchPlaceholder="Search everything..."
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
          </div>
        }
      />

      {!displayData && isLoading ? (
        <div className="space-y-4">
          <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      ) : !displayData || totalResults === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <SearchIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {query.trim() ? "No results found" : "Start typing to search..."}
          </h3>
          <p className="text-sm text-muted-foreground">
            {query.trim()
              ? `No items match "${query}". Try searching for tasks, habits, or notes.`
              : "Search for tasks, habits, and notes by name or content. Press Ctrl+K to create with AI."}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {query.trim() && (
            <p className="text-sm text-muted-foreground">
              Found <strong>{totalResults}</strong> {totalResults === 1 ? "item" : "items"}
            </p>
          )}
          {displayData.tasks.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Tasks ({displayData.tasks.length})
              </h3>
              <div className="space-y-1.5">
                {displayData.tasks.map((task) => (
                  <Link key={task.id} href="/tasks">
                    <motion.a
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="block p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 ml-2">
                          <PriorityBadge priority={task.priority} showDot />
                          <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:translate-x-0.5 group-hover:translate-y-[-1px] transition-transform" />
                        </div>
                      </div>
                      {task.due_date && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span
                            className={cn(
                              task.status !== "done" &&
                                isPastDue(task.due_date) &&
                                "text-destructive font-medium"
                            )}
                          >
                            {format(new Date(task.due_date), "MMM d")}
                          </span>
                        </div>
                      )}
                    </motion.a>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {displayData.habits.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Habits ({displayData.habits.length})
              </h3>
              <div className="space-y-1.5">
                {displayData.habits.map((habit) => (
                  <Link key={habit.id} href="/habits">
                    <motion.a
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="block p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center"
                            style={{ backgroundColor: `${habit.color}20` }}
                          >
                            <Flame
                              className="w-3.5 h-3.5"
                              style={{ color: habit.color }}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{habit.name}</p>
                            {habit.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {habit.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:translate-x-0.5 group-hover:translate-y-[-1px] transition-transform" />
                      </div>
                    </motion.a>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {displayData.notes.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-2">
                <StickyNote className="w-4 h-4" />
                Notes ({displayData.notes.length})
              </h3>
              <div className="space-y-1.5">
                {displayData.notes.map((note) => (
                  <Link key={note.id} href="/notes">
                    <motion.a
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="block p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {note.title || "Untitled"}
                          </p>
                          {note.content && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {note.content.replace(/<[^>]*>/g, "").slice(0, 80)}
                              {note.content.replace(/<[^>]*>/g, "").length > 80 && "…"}
                            </p>
                          )}
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:translate-x-0.5 group-hover:translate-y-[-1px] transition-transform" />
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          {format(new Date(note.updated_at), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </motion.a>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}