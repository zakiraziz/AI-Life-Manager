"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { AICommandResult, WeeklyReflection } from "@/lib/types";
import toast from "react-hot-toast";

export function useParseAICommand() {
  return useMutation({
    mutationFn: async ({ command, context }: { command: string; context?: string }) => {
      const response = await fetch("/api/ai/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command, context }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `API error: ${response.statusText}`
        );
      }

      return (await response.json()) as
        | AICommandResult
        | { type: "multi"; items: AICommandResult[] };
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useWeeklyReflection() {
  return useQuery({
    queryKey: ["weekly-reflection"],
        queryFn: async () => {
      const response = await fetch("/api/ai/reflection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tasks: [],
          habits: [],
          notes: [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `API error: ${response.statusText}`
        );
      }

      return (await response.json()) as WeeklyReflection;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
}