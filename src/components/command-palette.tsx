"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, CornerDownLeft } from "lucide-react";
import { NAV_COMMANDS, QUICK_ACTIONS } from "@/lib/shortcuts";
import { useCommandBar } from "@/components/command-bar-provider";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { openCommandBar } = useCommandBar();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [
        ...NAV_COMMANDS.map((c) => ({ ...c, kind: "nav" as const })),
        ...QUICK_ACTIONS.map((c) => ({ ...c, kind: "action" as const, href: undefined })),
      ];
    }
    return [
      ...NAV_COMMANDS.filter((c) =>
        [c.label, c.hint, ...c.keywords].some((k) => k.toLowerCase().includes(q))
      ).map((c) => ({ ...c, kind: "nav" as const })),
      ...QUICK_ACTIONS.filter((c) =>
        [c.label, c.hint, c.keyword].some((k) => k.toLowerCase().includes(q))
      ).map((c) => ({ ...c, kind: "action" as const, href: undefined })),
    ];
  }, [query]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    setQuery("");
    setActiveIdx(0);
  }, [open]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  if (!open) return null;

  const run = (item: (typeof results)[0]) => {
    onClose();
    if (item.kind === "nav") {
      router.push(item.href);
    } else if (item.id === "ai") {
      openCommandBar();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[activeIdx];
      if (item) run(item);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-[12vh]"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -10 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a command or search…"
            className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </p>
          ) : (
            results.map((item, i) => (
              <button
                key={item.id + item.label}
                onClick={() => run(item)}
                onMouseEnter={() => setActiveIdx(i)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  i === activeIdx ? "bg-accent" : "hover:bg-accent/60"
                }`}
              >
                <span className="flex-1">
                  <span className="block font-medium">{item.label}</span>
                  <span className="block text-xs text-muted-foreground">{item.hint}</span>
                </span>
                {i === activeIdx && item.kind === "nav" && (
                  <CornerDownLeft className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            ))
          )}
        </div>

        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          <kbd className="px-1 py-0.5 font-mono bg-muted rounded">↑↓</kbd> navigate ·{" "}
          <kbd className="px-1 py-0.5 font-mono bg-muted rounded">Enter</kbd> select ·{" "}
          <kbd className="px-1 py-0.5 font-mono bg-muted rounded">Esc</kbd> close
        </div>
      </motion.div>
    </motion.div>
  );
}