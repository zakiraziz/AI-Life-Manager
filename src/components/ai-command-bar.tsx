"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, X, AlertCircle } from "lucide-react";
import { useParseAICommand } from "@/hooks/use-ai";
import { useCreateTask } from "@/hooks/use-tasks";
import { useCreateHabit } from "@/hooks/use-habits";
import { useCreateNote } from "@/hooks/use-notes";
import { AICommandResult } from "@/lib/types";
import toast from "react-hot-toast";

interface AICommandBarProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  context?: { tasks: any[]; habits: any[]; notes: any[] };
}

type ParsedResult = AICommandResult | { type: "multi"; items: AICommandResult[] };

export function AICommandBar({ open, onClose, userId, context }: AICommandBarProps) {
  const [command, setCommand] = useState("");
  const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseCommand = useParseAICommand();
  const createTask = useCreateTask();
  const createHabit = useCreateHabit();
  const createNote = useCreateNote();

  // Build context string from user data
  const contextStr = context
    ? `Current tasks: ${context.tasks.map((t) => t.title).join(", ")}. Current habits: ${context.habits.map((h) => h.name).join(", ")}. Current notes: ${context.notes.map((n) => n.title).join(", ")}.`
    : "";

  const handleParse = async () => {
    if (!command.trim()) return;
    try {
      const result = await parseCommand.mutateAsync({
        command,
        context: contextStr,
      });
      setParsedResult(result);
      setShowPreview(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to parse command");
    }
  };

  const handleSave = async () => {
    if (!parsedResult) return;

    const items =
      parsedResult.type === "multi"
        ? parsedResult.items
        : [parsedResult as AICommandResult];

    let saved = 0;
    for (const item of items) {
      try {
        if (item.type === "task") {
          await createTask.mutateAsync({
            title: item.title,
            description: item.description,
            priority: item.priority || "medium",
            due_date: item.due_date || null,
            status: "todo",
          });
        } else if (item.type === "habit") {
          await createHabit.mutateAsync({
            name: item.title,
            description: item.description,
            color: item.color || "#6366f1",
          });
        } else if (item.type === "note") {
          await createNote.mutateAsync({
            title: item.title,
            content: item.content || "",
          });
        }
        saved++;
      } catch (error: any) {
        toast.error(`Failed to save ${item.type}: ${error.message}`);
      }
    }

    toast.success(`${saved} item(s) created!`, { icon: "✨" });
    handleClose();
  };

  const handleClose = () => {
    setCommand("");
    setParsedResult(null);
    setShowPreview(false);
    onClose();
  };

  // Reset state when closed
  useEffect(() => {
    if (!open) {
      setCommand("");
      setParsedResult(null);
      setShowPreview(false);
    }
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const getItemIcon = (type: string) => {
    switch (type) {
      case "task": return "✅";
      case "habit": return "🔥";
      case "note": return "📝";
      default: return "•";
    }
  };

  const getItems = (): AICommandResult[] => {
    if (!parsedResult) return [];
    return parsedResult.type === "multi"
      ? parsedResult.items
      : [parsedResult as AICommandResult];
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Command Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Input Section */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">AI Assistant</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {command.length}/500 characters
                  </span>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value.slice(0, 500))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && command.trim()) {
                      e.preventDefault();
                      handleParse();
                    }
                  }}
                  placeholder="What would you like to create? e.g., 'Remind me to call mom tomorrow'"
                  className="input-base text-base"
                  maxLength={500}
                />
              </div>

              {/* Preview Section */}
              {showPreview && (
                <div className="p-4 max-h-80 overflow-y-auto">
                  {parsedResult ? (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium mb-2">
                        Preview — {getItems().length} item(s) will be created
                      </h3>
                      {getItems().map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-muted/30 border border-border"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl" role="img">
                              {getItemIcon(item.type)}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium text-sm capitalize">
                                {item.type}
                              </p>
                              <p className="text-sm mt-1">{item.title}</p>
                              {item.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {item.description}
                                </p>
                              )}
                              {item.priority && (
                                <span className="inline-block text-xs px-2 py-0.5 bg-priority-low rounded-full mt-1">
                                  Priority: {item.priority}
                                </span>
                              )}
                              {item.due_date && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Due: {item.due_date}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm">Could not parse the command.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Bar */}
              <div className="p-3 border-t border-border flex items-center justify-between">
                <button
                  onClick={handleClose}
                  className="btn-ghost"
                >
                  <X className="w-4 h-4" />
                  Close
                </button>

                <div className="flex gap-2">
                  {!showPreview ? (
                    <button
                      onClick={handleParse}
                      disabled={!command.trim() || parseCommand.isPending}
                      className="btn-primary"
                    >
                      {parseCommand.isPending ? (
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Parse with AI
                        </>
                      )}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowPreview(false)}
                        className="btn-secondary"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={createTask.isPending || createHabit.isPending || createNote.isPending}
                        className="btn-primary"
                      >
                        {createTask.isPending || createHabit.isPending || createNote.isPending
                          ? "Saving..."
                          : "Save All"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}