import { useCallback, useEffect, useMemo, useState } from "react";
import { createDemoState } from "@/data/demo";
import type { NexusState } from "@/types/nexus";

const STORAGE_KEY = "nexus-os-state-v1";

const loadState = (): NexusState => {
  if (typeof window === "undefined") return createDemoState();
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return createDemoState();

  try {
    const parsed = JSON.parse(saved) as NexusState;
    return parsed.schemaVersion === 1 ? parsed : createDemoState();
  } catch {
    return createDemoState();
  }
};

export function useNexus() {
  const [state, setState] = useState<NexusState>(loadState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const today = new Date().toISOString().slice(0, 10);

  const toggleAction = useCallback((actionId: string) => {
    setState((current) => {
      const existing = current.completions.find(
        (completion) => completion.actionId === actionId && completion.date === today,
      );

      return {
        ...current,
        completions: existing
          ? current.completions.filter((completion) => completion.id !== existing.id)
          : [
              ...current.completions,
              {
                id: `completion-${actionId}-${today}`,
                actionId,
                date: today,
                value: true,
                completedAt: new Date().toISOString(),
              },
            ],
      };
    });
  }, [today]);

  const togglePriority = useCallback((priorityId: string) => {
    setState((current) => ({
      ...current,
      priorities: current.priorities.map((priority) =>
        priority.id === priorityId ? { ...priority, completed: !priority.completed } : priority,
      ),
    }));
  }, []);

  const actionsToday = useMemo(
    () => state.actions.filter((action) => !action.archived),
    [state.actions],
  );

  const completedActionIds = useMemo(
    () => new Set(state.completions.filter((item) => item.date === today).map((item) => item.actionId)),
    [state.completions, today],
  );

  const prioritiesToday = useMemo(
    () => state.priorities.filter((priority) => priority.date === today),
    [state.priorities, today],
  );

  return { state, actionsToday, completedActionIds, prioritiesToday, toggleAction, togglePriority };
}
