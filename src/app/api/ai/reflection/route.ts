import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { tasks = [], habits = [], notes = [] } = await request.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Enrich with real data from the database if the client didn't pass it.
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let dbTasks: typeof tasks = tasks;
    let dbHabits: typeof habits = habits;
    let dbNotes: typeof notes = notes;
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    if (user?.id) {
      if (!dbTasks.length) {
        const { data: t } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .gte("created_at", sevenDaysAgo)
          .order("created_at", { ascending: false });
        dbTasks = t || [];
      }
      if (!dbHabits.length) {
        const { data: h } = await supabase
          .from("habits")
          .select("*")
          .eq("user_id", user.id);
        dbHabits = h || [];
      }
      if (!dbNotes.length) {
        const { data: n } = await supabase
          .from("notes")
          .select("*")
          .eq("user_id", user.id)
          .gte("created_at", sevenDaysAgo);
        dbNotes = n || [];
      }
    }

    const systemPrompt = `You are Z4 AI, an empathetic life coach. Generate a weekly reflection summary based on the user's data. Format your response as valid JSON with these fields: summary, highlights (array), challenges (array), suggestions (array), motivation (string). Keep it warm, encouraging, and actionable.`;

    const userData = `
Tasks (last 7 days): ${JSON.stringify(dbTasks)}
Habits: ${JSON.stringify(dbHabits)}
Notes: ${JSON.stringify(dbNotes)}
`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Please generate a weekly reflection based on my productivity data for the past 7 days.\n\n${userData}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        { error: errorData?.error?.message || `API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "{}";

    try {
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response as JSON" },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}