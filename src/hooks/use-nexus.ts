import { useCallback, useEffect, useMemo, useState } from "react";
import { createDemoState } from "@/data/demo";
import type { NexusState, RecoveryContext, RecoveryEventType } from "@/types/nexus";

const STORAGE_KEY = "nexus-os-state-v1";

const loadState = (): NexusState => {
  const fallback = createDemoState();
  if (typeof window === "undefined") return fallback;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return fallback;

  try {
    const parsed = JSON.parse(saved) as Partial<NexusState>;
    if (parsed.schemaVersion !== 1) return fallback;
    return {
      ...fallback,
      ...parsed,
      recoveryEvents: parsed.recoveryEvents ?? [],
      recoveryContexts: parsed.recoveryContexts ?? [],
      preferences: { ...fallback.preferences, ...parsed.preferences },
    };
  } catch {
    return fallback;
  }
};

export interface RecoveryLogInput {
  type: RecoveryEventType;
  customLabel?: string;
  context?: Omit<RecoveryContext, "id" | "eventId" | "timeOfDay" | "dayOfWeek" | "customFactors">;
}

const getTimeOfDay = (hour: number): RecoveryContext["timeOfDay"] => {
  if (hour < 6) return "night";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  if (hour < 22) return "evening";
  return "night";
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
          : [...current.completions, { id: `completion-${actionId}-${today}`, actionId, date: today, value: true, completedAt: new Date().toISOString() }],
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

  const addRecoveryEvent = useCallback((input: RecoveryLogInput) => {
    const now = new Date();
    const eventId = `recovery-${now.getTime()}`;
    const hasContext = input.context && Object.values(input.context).some((value) => value !== undefined && value !== "");
    const contextId = hasContext ? `context-${now.getTime()}` : undefined;

    setState((current) => ({
      ...current,
      recoveryEvents: [
        { id: eventId, type: input.type, occurredAt: now.toISOString(), contextId, customLabel: input.customLabel?.trim() || undefined },
        ...current.recoveryEvents,
      ],
      recoveryContexts: contextId
        ? [
            {
              id: contextId,
              eventId,
              ...input.context,
              timeOfDay: getTimeOfDay(now.getHours()),
              dayOfWeek: now.getDay(),
              customFactors: {},
            },
            ...current.recoveryContexts,
          ]
        : current.recoveryContexts,
    }));
  }, []);

  const addRecoveryAction = useCallback((name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    setState((current) => ({
      ...current,
      actions: [
        ...current.actions,
        {
          id: `action-${Date.now()}`,
          name: cleanName,
          description: "A self-defined action that supports recovery.",
          type: "boolean",
          categoryId: "recovery",
          schedule: ["daily"],
          target: 1,
          unit: "completion",
          customFields: {},
          includeInAnalytics: true,
          includeInRecovery: true,
          classification: "positive",
          archived: false,
        },
      ],
    }));
  }, []);

  const setRecoveryWidgetDetail = useCallback((recoveryWidgetDetail: NexusState["preferences"]["recoveryWidgetDetail"]) => {
    setState((current) => ({ ...current, preferences: { ...current.preferences, recoveryWidgetDetail } }));
  }, []);

  const actionsToday = useMemo(() => state.actions.filter((action) => !action.archived), [state.actions]);
  const recoveryActions = useMemo(() => state.actions.filter((action) => action.includeInRecovery && !action.archived), [state.actions]);
  const completedActionIds = useMemo(() => new Set(state.completions.filter((item) => item.date === today).map((item) => item.actionId)), [state.completions, today]);
  const prioritiesToday = useMemo(() => state.priorities.filter((priority) => priority.date === today), [state.priorities, today]);

  return {
    state,
    actionsToday,
    recoveryActions,
    completedActionIds,
    prioritiesToday,
    toggleAction,
    togglePriority,
    addRecoveryEvent,
    addRecoveryAction,
    setRecoveryWidgetDetail,
  };
}
