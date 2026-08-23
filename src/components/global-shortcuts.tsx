"use client";

import { useState } from "react";
import { AICommandBar } from "@/components/ai-command-bar";
import { CommandBarProvider } from "@/components/command-bar-provider";
import { useGlobalShortcuts } from "@/hooks/use-keyboard";

// Re-export so pages can use useCommandBar to open it
export { useCommandBar } from "@/components/command-bar-provider";

interface GlobalShortcutsProps {
  userId: string;
  context?: { tasks: any[]; habits: any[]; notes: any[] };
  children: React.ReactNode;
}

export function GlobalShortcutsProvider({ userId, context, children }: GlobalShortcutsProps) {
  const [open, setOpen] = useState(false);

  useGlobalShortcuts({
    onOpenAI: () => setOpen(true),
  });

  return (
    <CommandBarProvider userId={userId} context={context}>
      {children}
      <AICommandBar
        open={open}
        onClose={() => setOpen(false)}
        userId={userId}
        context={context}
      />
    </CommandBarProvider>
  );
}