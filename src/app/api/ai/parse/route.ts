import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { command, context } = await request.json();

    if (!command || typeof command !== "string") {
      return NextResponse.json(
        { error: "Command is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const systemPrompt = `You are Z4 AI, an intelligent life management assistant. Parse the user's natural language command into structured JSON.

The user wants to create tasks, habits, or notes. Analyze their input and respond with ONE of:

1. If it's a single task: {"type": "task", "title": "...", "description": "...", "priority": "low|medium|high|urgent", "due_date": "YYYY-MM-DD"}
2. If it's a habit: {"type": "habit", "name": "...", "description": "...", "color": "#hexcolor"}
3. If it's a note: {"type": "note", "title": "...", "content": "..."}
4. If it's multiple items: {"type": "multi", "items": [...]}

Only respond with valid JSON. Do not include any other text.

Priority guidelines:
- "urgent", "asap", "today", "now" → high/urgent
- "low", "later", "eventually", "someday" → low
- Everything else → medium
- If a date/time is mentioned, include it as due_date in YYYY-MM-DD format.`;

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
            content: context
              ? `${context}\n\nUser command: ${command}`
              : command,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
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