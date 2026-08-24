import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { GlobalShortcutsProvider } from "@/components/global-shortcuts";
import { Task, Habit, Note } from "@/lib/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userId = "";
  let tasks: Task[] = [];
  let habits: Habit[] = [];
  let notes: Note[] = [];

  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    userId = user?.id || "";

    const { data: tasksData } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId);

    const { data: habitsData } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId);

    const { data: notesData } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .limit(10);

    tasks = (tasksData || []) as Task[];
    habits = (habitsData || []) as Habit[];
    notes = (notesData || []) as Note[];
  } catch {
    // Supabase unavailable (e.g. during static export without credentials).
    // Render the shell with empty context so the build and app don't crash.
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="pl-16 lg:pl-64 min-h-screen">
        <div className="max-w-5xl mx-auto p-4 lg:p-8">
          <GlobalShortcutsProvider
            userId={userId}
            context={{ tasks, habits, notes }}
          >
            {children}
          </GlobalShortcutsProvider>
        </div>
      </main>
    </div>
  );
}