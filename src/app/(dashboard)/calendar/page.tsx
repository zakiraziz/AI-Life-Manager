"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/header";
import { useCommandBar } from "@/components/command-bar-provider";
import { useTasks } from "@/hooks/use-tasks";
import { useHabits } from "@/hooks/use-habits";
import { cn } from "@/lib/utils";
import { format, startOfMonth, startOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday } from "date-fns";

export default function CalendarPage() {
  const { openCommandBar } = useCommandBar();
  const { data: tasks = [] } = useTasks();
  const { data: habits = [] } = useHabits();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Build the calendar grid
  const cells = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart);
    const totalDays = 42; // 6 weeks
    return Array.from({ length: totalDays }, (_, i) => addDays(gridStart, i));
  }, [currentMonth]);

  // Group tasks by due date
  const tasksByDate = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    for (const t of tasks) {
      if (!t.due_date) continue;
      const key = new Date(t.due_date).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [tasks]);

  // Get tasks due on selected date
  const selectedTasks = selectedDate
    ? tasksByDate.get(selectedDate.toDateString()) || []
    : [];
  const doneSelected = selectedTasks.filter((t) => t.status === "done").length;

  // Gregorian weekday headers
  const weekdayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigate = (dir: 1 | -1) =>
    setCurrentMonth((m) => (dir === 1 ? addMonths(m, 1) : subMonths(m, 1)));
return (
    <div>
      <Header
        title="Calendar"
        subtitle="See your tasks and habits at a glance"
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

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold capitalize">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={() => navigate(1)}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar grid */}
        <div className="flex-1 rounded-2xl border border-border overflow-hidden">
          <div className="grid grid-cols-7 bg-muted/50 border-b border-border">
            {weekdayHeaders.map((day) => (
              <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((date, i) => {
              const dateKey = date.toDateString();
              const dayTasks = tasksByDate.get(dateKey) || [];
              const isCurMonth = isSameMonth(date, currentMonth);
              const isSel = selectedDate && isSameDay(date, selectedDate);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "min-h-[70px] p-1.5 border-b border-r border-border text-left transition-colors hover:bg-accent/40",
                    !isCurMonth && "bg-muted/30 text-muted-foreground/50",
                    isToday(date) && "bg-primary/5",
                    isSel && "ring-2 ring-primary ring-inset"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex w-6 h-6 items-center justify-center rounded-full text-xs",
                      isToday(date) && "bg-primary text-primary-foreground font-semibold"
                    )}
                  >
                    {format(date, "d")}
                  </span>
                  {dayTasks.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {dayTasks.slice(0, 3).map((t) => (
                        <span
                          key={t.id}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            t.status === "done"
                              ? "bg-green-500"
                              : t.priority === "urgent"
                              ? "bg-purple-500"
                              : t.priority === "high"
                              ? "bg-red-500"
                              : t.priority === "medium"
                              ? "bg-amber-500"
                              : "bg-green-400"
                          )}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{dayTasks.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
{/* Selected day details */}
        <div className="lg:w-72 space-y-4">
          <div className="rounded-2xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">
                {selectedDate
                  ? format(selectedDate, "EEEE, MMM d")
                  : "Select a day"}
              </h3>
            </div>

            {!selectedDate ? (
              <p className="text-sm text-muted-foreground">
                Click any day to see tasks scheduled for that date.
              </p>
            ) : selectedTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tasks scheduled for this day. 🎉
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {doneSelected} of {selectedTasks.length} completed
                </p>
                {selectedTasks.map((t) => (
                  <div
                    key={t.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border text-sm",
                      t.status === "done" ? "border-green-500/30" : "border-border"
                    )}
                  >
                    <CheckCircle2
                      className={cn(
                        "w-4 h-4 shrink-0",
                        t.status === "done" ? "text-green-500" : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "truncate",
                        t.status === "done" && "line-through text-muted-foreground"
                      )}
                    >
                      {t.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border p-4">
            <h4 className="font-semibold mb-2">Habits this month</h4>
            <p className="text-sm text-muted-foreground">
              You&apos;re tracking <span className="text-foreground font-medium">{habits.length}</span>{" "}
              {habits.length === 1 ? "habit" : "habits"}. Check the{" "}
              <a href="/habits" className="text-primary hover:underline">
                Habits
              </a>{" "}
              page to log them and keep your streaks alive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}