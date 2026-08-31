import { Task, Habit, HabitLog, Note } from "@/lib/types";

export interface UserDataExport {
  version: string;
  exportedAt: string;
  tasks: Task[];
  habits: (Habit & { logs?: HabitLog[] })[];
  notes: Note[];
}

/**
 * Builds a JSON blob of all the user's data for download.
 */
export function buildExportBlob(data: UserDataExport): Blob {
  const json = JSON.stringify(data, null, 2);
  return new Blob([json], { type: "application/json" });
}

/**
 * Triggers a download of the user's data as a JSON file.
 */
export function downloadExport(data: UserDataExport) {
  const blob = buildExportBlob(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `z4-export-${formatExportName()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatExportName(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Validates a user-provided JSON file and returns the parsed data.
 */
export interface ImportResult {
  valid: boolean;
  data?: UserDataExport;
  error?: string;
}

export function validateImport(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.tasks || !parsed.habits || !parsed.notes) {
          resolve({ valid: false, error: "Missing required fields (tasks, habits, notes)" });
          return;
        }
        resolve({ valid: true, data: parsed as UserDataExport });
      } catch (err) {
        resolve({
          valid: false,
          error: `Invalid JSON: ${err instanceof Error ? err.message : "parse error"}`,
        });
      }
    };
    reader.onerror = () => {
      resolve({ valid: false, error: "Failed to read file" });
    };
    reader.readAsText(file);
  });
}