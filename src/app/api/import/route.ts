import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tasks = [], habits = [], notes = [] } = body;

    const counts: { tasks: number; habits: number; notes: number } = {
      tasks: 0,
      habits: 0,
      notes: 0,
    };

    // Import tasks
    for (const t of tasks) {
      const { error } = await supabase.from("tasks").insert({
        user_id: user.id,
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        due_date: t.due_date,
        position: t.position || 0,
      });
      if (!error) counts.tasks++;
    }

    // Import habits
    for (const h of habits) {
      const { error: habitError } = await supabase.from("habits").insert({
        user_id: user.id,
        name: h.name,
        description: h.description,
        color: h.color || "#6366f1",
        icon: h.icon,
      });
      if (!habitError) counts.habits++;
    }

    // Import notes
    for (const n of notes) {
      const { error } = await supabase.from("notes").insert({
        user_id: user.id,
        title: n.title,
        content: n.content,
        is_archived: n.is_archived || false,
      });
      if (!error) counts.notes++;
    }

    return NextResponse.json({ message: "Import complete", counts });
  } catch {
    return NextResponse.json(
      { error: "Failed to import data" },
      { status: 500 }
    );
  }
}