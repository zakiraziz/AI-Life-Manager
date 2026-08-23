"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Send,
  Loader2,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Heart,
} from "lucide-react";
import { Header } from "@/components/header";
import { useCommandBar } from "@/components/command-bar-provider";
import { useParseAICommand, useWeeklyReflection } from "@/hooks/use-ai";
import { useCreateTask } from "@/hooks/use-tasks";
import { useCreateHabit } from "@/hooks/use-habits";
import { useCreateNote } from "@/hooks/use-notes";
import { AICommandResult, WeeklyReflection } from "@/lib/types";
import toast from "react-hot-toast";

export default function AssistantPage() {
  const { openCommandBar } = useCommandBar();
  const [command, setCommand] = useState("");
  const [result, setResult] = useState<AICommandResult | null>(null);
  const [showReflection, setShowReflection] = useState(false);

  const parseCommand = useParseAICommand();
  const createTask = useCreateTask();
  const createHabit = useCreateHabit();
  const createNote = useCreateNote();

  const {
    data: reflection,
    isLoading: reflectionLoading,
    error: reflectionError,
    refetch: refetchReflection,
  } = useWeeklyReflection();

  const handleParse = async () => {
    if (!command.trim()) return;
    try {
      const parsed = await parseCommand.mutateAsync({ command });
      setResult(parsed as AICommandResult);
    } catch (error: any) {
      toast.error(error.message || "Failed to parse command");
    }
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      if (result.type === "task") {
        await createTask.mutateAsync({
          title: result.title,
          description: result.description,
          priority: result.priority || "medium",
          due_date: result.due_date || null,
          status: "todo",
        });
      } else if (result.type === "habit") {
        await createHabit.mutateAsync({
          name: result.title,
          description: result.description,
          color: result.color || "#6366f1",
        });
      } else if (result.type === "note") {
        await createNote.mutateAsync({
          title: result.title,
          content: result.content || "",
        });
      }
      toast.success(`${result.type} created!`, { icon: "✨" });
      setResult(null);
      setCommand("");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleWeeklyReflection = () => {
    setShowReflection(true);
    refetchReflection();
  };

  return (
    <div>
      <Header
        title="AI Assistant"
        subtitle="Your intelligent life manager — powered by Groq's Llama 3"
        rightContent={
          <button
            onClick={openCommandBar}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-muted rounded-lg hover:bg-accent transition-colors"
          >
            <kbd className="px-1.5 py-0.5 bg-background rounded text-muted-foreground">
              Ctrl K
            </kbd>
            Quick Command
          </button>
        }
      />

      {/* Command Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Create with AI</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Describe what you want to create in natural language. I'll parse it
          into a task, habit, or note.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && command.trim()) {
                e.preventDefault();
                handleParse();
              }
            }}
            placeholder="e.g., 'Remind me to call mom tomorrow at 5pm' or 'Create a habit to drink water daily'"
            className="input-base flex-1"
          />
          <button
            onClick={handleParse}
            disabled={!command.trim() || parseCommand.isPending}
            className="btn-primary"
          >
            {parseCommand.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Parse
              </>
            )}
          </button>
        </div>

        {/* Result Preview */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-lg bg-muted/30 border border-border"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl" role="img">
                {result.type === "task" ? "✅" : result.type === "habit" ? "🔥" : "📝"}
              </span>
              <div className="flex-1">
                <p className="font-medium text-sm capitalize">{result.type}</p>
                <p className="text-sm mt-1">{result.title}</p>
                {result.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.description}
                  </p>
                )}
                {result.priority && (
                  <span className="inline-block text-xs px-2 py-0.5 bg-priority-low rounded-full mt-1">
                    Priority: {result.priority}
                  </span>
                )}
                {result.due_date && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Due: {result.due_date}
                  </p>
                )}
              </div>
              <button onClick={handleSave} className="btn-primary">
                Save
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Weekly Reflection */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Weekly Reflection</h2>
          </div>
          <button
            onClick={handleWeeklyReflection}
            disabled={reflectionLoading}
            className="btn-secondary"
          >
            {reflectionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {showReflection ? "Refresh" : "Generate"}
          </button>
        </div>

        {!showReflection ? (
          <p className="text-sm text-muted-foreground">
            Generate an AI-powered summary of your last 7 days — your wins,
            challenges, and what to focus on next.
          </p>
        ) : reflectionLoading ? (
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-full" />
            <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
          </div>
        ) : reflectionError ? (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">
              {(reflectionError as Error).message || "Failed to generate reflection"}
            </p>
          </div>
        ) : reflection ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed">{reflection.summary}</p>

            {reflection.highlights?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Highlights
                </h3>
                <ul className="space-y-1">
                  {reflection.highlights.map((h, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-green-500">•</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {reflection.challenges?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Challenges
                </h3>
                <ul className="space-y-1">
                  {reflection.challenges.map((c, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-amber-500">•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {reflection.suggestions?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  Suggestions
                </h3>
                <ul className="space-y-1">
                  {reflection.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {reflection.motivation && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm italic flex gap-2">
                  <Heart className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  {reflection.motivation}
                </p>
              </div>
            )}
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}