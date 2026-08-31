"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { SHORTCUTS } from "@/lib/shortcuts";

interface ShortcutsGuideProps {
  open: boolean;
  onClose: () => void;
}

export function ShortcutsGuide({ open, onClose }: ShortcutsGuideProps) {
  if (!open) return null;

  const groups = Array.from(new Set(SHORTCUTS.map((s) => s.category)));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                {group}
              </h3>
              <div className="space-y-1.5">
                {SHORTCUTS.filter((s) => s.category === group).map((s) => (
                  <div
                    key={s.keys + s.label}
                    className="flex items-center justify-between gap-4 text-sm"
                  >
                    <div>
                      <span className="font-medium">{s.label}</span>
                    </div>
                    <kbd className="shrink-0 px-2 py-0.5 text-xs font-mono bg-muted rounded">{s.keys}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Tip: Press{" "}
          <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono">Ctrl K</kbd>{" "}
          anywhere to create with AI.
        </p>
      </motion.div>
    </motion.div>
  );
}