"use client";

import toast, { type Toast } from "react-hot-toast";
import { motion } from "framer-motion";

interface UndoPayload {
  message: string;
  onUndo: () => void;
}

/**
 * Shows a toast with an "Undo" button. The toast closes (or hides the button)
 * once undoing is no longer possible, mirroring the behaviour of real
 * productivity apps.
 */
export function notifyUndo({ message, onUndo }: UndoPayload) {
  const toastId = `undo-${Date.now()}`;

  toast.custom(
    (t: Toast) => (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg"
      >
        <span className="text-sm text-foreground flex-1">{message}</span>
        <button
          onClick={() => {
            onUndo();
            toast.dismiss(t.id);
          }}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Undo
        </button>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <span className="text-sm">✕</span>
        </button>
      </motion.div>
    ),
    { id: toastId, duration: 6000 }
  );
}