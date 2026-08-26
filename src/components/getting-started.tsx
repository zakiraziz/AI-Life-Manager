"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";

interface GettingStartedProps {
  taskCount: number;
  habitCount: number;
  noteCount: number;
}

export function GettingStarted({ taskCount, habitCount, noteCount }: GettingStartedProps) {
  const steps = [
    {
      key: "task",
      label: "Create your first task",
      href: "/tasks",
      done: taskCount > 0,
      hint: "Add something you want to get done",
    },
    {
      key: "habit",
      label: "Start a habit",
      href: "/habits",
      done: habitCount > 0,
      hint: "Log a daily routine to build a streak",
    },
    {
      key: "note",
      label: "Write a note",
      href: "/notes",
      done: noteCount > 0,
      hint: "Capture an idea or journal entry",
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;

  // Hide once everything is complete
  if (doneCount === steps.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 mb-8 border border-primary/20"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Rocket className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold">Get started with Z4</h2>
          <p className="text-sm text-muted-foreground">
            {doneCount} of {steps.length} done — you're on your way!
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary">
            {Math.round((doneCount / steps.length) * 100)}%
          </span>
          <div className="w-24 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(doneCount / steps.length) * 100}%` }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((step) => (
          <Link key={step.key} href={step.href} className="block">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                step.done
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-border hover:bg-accent/50"
              }`}
            >
              {step.done ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    step.done ? "text-green-700 dark:text-green-400 line-through" : ""
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.hint}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}