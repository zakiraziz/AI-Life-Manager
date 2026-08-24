export type Priority = "low" | "medium" | "high" | "urgent";

export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  priority: Priority;
  status: TaskStatus;
  due_date?: string | null;
  completed_at?: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  color: string;
  icon?: string | null;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  logged_date: string;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  created_at: string;
}

export interface AICommandContext {
  tasks: Task[];
  habits: Habit[];
  notes: Note[];
}

export interface AICommandResult {
  type: "task" | "habit" | "note";
  title: string;
  description?: string;
  priority?: Priority;
  due_date?: string;
  content?: string;
  color?: string;
}

export interface WeeklyReflection {
  summary: string;
  highlights: string[];
  challenges: string[];
  suggestions: string[];
  motivation: string;
}