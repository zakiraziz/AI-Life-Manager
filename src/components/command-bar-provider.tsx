"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { AICommandBar } from "@/components/ai-command-bar";
import { AICommandContext } from "@/lib/types";

interface CommandBarContextType {
  open: boolean;
  openCommandBar: () => void;
  closeCommandBar: () => void;
}

const CommandBarContext = createContext<CommandBarContextType | undefined>(undefined);

export function CommandBarProvider({
  children,
  userId,
  context,
}: {
  children: ReactNode;
  userId: string;
  context?: AICommandContext;
}) {
  const [open, setOpen] = useState(false);

  const openCommandBar = () => setOpen(true);
  const closeCommandBar = () => setOpen(false);

  return (
    <CommandBarContext.Provider value={{ open, openCommandBar, closeCommandBar }}>
      {children}
      <AICommandBar
        open={open}
        onClose={closeCommandBar}
        userId={userId}
        context={context}
      />
    </CommandBarContext.Provider>
  );
}

export function useCommandBar() {
  const ctx = useContext(CommandBarContext);
  if (!ctx) {
    throw new Error("useCommandBar must be used within CommandBarProvider");
  }
  return ctx;
}