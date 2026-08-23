import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { GlobalShortcutsProvider } from "@/components/global-shortcuts";
import { Task, Habit, Note } from "@/lib/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch data for AI context
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user?.id || "");

  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user?.id || "");

  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", user?.id || "")
    .limit(10);

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="pl-16 lg:pl-64 min-h-screen">
        <div className="max-w-5xl mx-auto p-4 lg:p-8">
          <GlobalShortcutsProvider
            userId={user?.id || ""}
            context={{
              tasks: (tasks || []) as Task[],
              habits: (habits || []) as Habit[],
              notes: (notes || []) as Note[],
            }}
          >
            {children}
          </GlobalShortcutsProvider>
        </div>
      </main>
    </div>
  );
}