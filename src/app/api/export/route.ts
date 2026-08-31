import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [tasksRes, habitsRes, logsRes, notesRes] = await Promise.all([
      supabase.from("tasks").select("*").eq("user_id", user.id),
      supabase.from("habits").select("*").eq("user_id", user.id),
      supabase.from("habit_logs").select("*").eq("user_id", user.id),
      supabase.from("notes").select("*").eq("user_id", user.id),
    ]);

    // Group logs by habit
    const logs = logsRes.data || [];
    const habits = (habitsRes.data || []).map((h) => ({
      ...h,
      logs: logs.filter((l) => l.habit_id === h.id),
    }));

    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      tasks: tasksRes.data || [],
      habits,
      notes: notesRes.data || [],
    };

    const json = JSON.stringify(exportData, null, 2);

    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="z4-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}