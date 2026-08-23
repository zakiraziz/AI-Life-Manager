"use client";

import { Header } from "@/components/header";
import { TaskList } from "@/components/task-list";
import { useCommandBar } from "@/components/command-bar-provider";

export default function TasksPage() {
  const { openCommandBar } = useCommandBar();

  return (
    <div>
      <Header
        title="Tasks"
        subtitle="Manage your to-dos with drag-and-drop reordering"
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
      <TaskList />
    </div>
  );
}