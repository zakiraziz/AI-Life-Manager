// Central registry of keyboard shortcuts and command palette actions.
// Used by the shortcut guide modal, the global command palette, and the
// global keyboard handler.

export interface Shortcut {
  keys: string;
  label: string;
  description: string;
  category: string;
}

export const SHORTCUTS: Shortcut[] = [
  {
    keys: "Ctrl K",
    label: "Open AI Assistant",
    description: "Create tasks, habits, or notes with natural language",
    category: "AI",
  },
  {
    keys: "Ctrl+Shift+P",
    label: "Command Palette",
    description: "Search and jump to anything",
    category: "General",
  },
  {
    keys: "?",
    label: "Show shortcuts",
    description: "Open this help modal",
    category: "General",
  },
  {
    keys: "Ctrl+Enter",
    label: "Submit form",
    description: "Save the current form quickly",
    category: "Forms",
  },
  {
    keys: "N",
    label: "New task",
    description: "Quickly open the new-task button on the Tasks page",
    category: "Tasks",
  },
  {
    keys: "1 / 2 / 3",
    label: "Jump to page",
    description: "Tasks / Habits / Notes",
    category: "Navigation",
  },
];

// Command palette actions (navigate + quick actions)
export interface PalletActionLink {
  id: string;
  label: string;
  hint: string;
  href: string;
  keywords: string[];
}

export const NAV_COMMANDS: PalletActionLink[] = [
  { id: "today", label: "Go to Today", hint: "Overview", href: "/", keywords: ["today", "home", "dashboard", "overview"] },
  { id: "tasks", label: "Go to Tasks", hint: "Manage to-dos", href: "/tasks", keywords: ["task", "todo", "list"] },
  { id: "habits", label: "Go to Habits", hint: "Build streaks", href: "/habits", keywords: ["habit", "streak", "routine"] },
  { id: "notes", label: "Go to Notes", hint: "Write & organize", href: "/notes", keywords: ["note", "write", "editor"] },
  { id: "assistant", label: "Open AI Assistant", hint: "Natural language", href: "/assistant", keywords: ["ai", "assistant", "intelligent", "gpt"] },
  { id: "search", label: "Search everything", hint: "Tasks, notes, habits", href: "/search", keywords: ["search", "find", "filter"] },
];

export const QUICK_ACTIONS = [
  { id: "ai", label: "Create with AI (Ctrl K)", hint: "Parse natural language", keyword: "ai" },
];