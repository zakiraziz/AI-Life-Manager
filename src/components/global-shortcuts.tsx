"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AICommandBar } from "@/components/ai-command-bar";
import { CommandBarProvider } from "@/components/command-bar-provider";
import { CommandPalette } from "@/components/command-palette";
import { ShortcutsGuide } from "@/components/shortcuts-guide";
import { useGlobalShortcuts } from "@/hooks/use-keyboard";
import { useOverdueNotifications } from "@/hooks/use-notifications";
import { AICommandContext } from "@/lib/types";

// Re-export so pages can use useCommandBar to open it
export { useCommandBar } from "@/components/command-bar-provider";

interface GlobalShortcutsProps {
  userId: string;
  context?: AICommandContext;
  children: React.ReactNode;
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  const tag = el?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || !!el?.isContentEditable;
}

export function GlobalShortcutsProvider({ userId, context, children }: GlobalShortcutsProps) {
  const router = useRouter();
  const [aiOpen, setAiOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  // Browser notifications for overdue tasks — fires automatically on mount
  useOverdueNotifications(userId);

  // Ctrl+K opens the AI command bar
  useGlobalShortcuts({
    onOpenAI: () => setAiOpen(true),
    onOpenSearch: () => router.push("/search"),
  });

  // Extended shortcuts: Ctrl+Shift+P (palette), '?' (guide), 1/2/3 (jump)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      if (e.key === "?" && !isTypingTarget(e.target)) {
        e.preventDefault();
        setGuideOpen((v) => !v);
        return;
      }
      if (!isTypingTarget(e.target)) {
        if (e.key === "1") router.push("/tasks");
        else if (e.key === "2") router.push("/habits");
        else if (e.key === "3") router.push("/notes");
        else if (e.key === "4") router.push("/settings");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  return (
    <CommandBarProvider userId={userId} context={context}>
      {children}
      <AICommandBar
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        userId={userId}
        context={context}
      />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ShortcutsGuide open={guideOpen} onClose={() => setGuideOpen(false)} />
    </CommandBarProvider>
  );
}