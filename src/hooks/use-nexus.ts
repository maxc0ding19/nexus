import { useCallback, useEffect, useMemo, useState } from "react";
import { createDemoState } from "@/data/demo";
import { dateKey, isActionScheduled } from "@/lib/action-schedule";
import type { ActionCompletion, ActionDefinition, Category, NexusState, RecoveryContext, RecoveryEventType } from "@/types/nexus";

const STORAGE_KEY = "nexus-os-state-v1";

const normalizeAction = (action: ActionDefinition): ActionDefinition => ({
  ...action,
  icon: action.icon ?? "circle-check",
  scheduleConfig: action.scheduleConfig ?? (action.schedule?.includes("daily") ? { mode: "daily" } : { mode: "weekdays", weekdays: action.schedule?.map(Number).filter(Number.isInteger) }),
  priority: action.priority ?? "normal",
  customFields: action.customFields ?? {},
  customFieldDefinitions: action.customFieldDefinitions ?? [],
  active: action.active ?? true,
  createdAt: action.createdAt ?? new Date().toISOString(),
  updatedAt: action.updatedAt ?? new Date().toISOString(),
});

const loadState = (): NexusState => {
  const fallback = createDemoState();
  if (typeof window === "undefined") return fallback;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return { ...fallback, actions: fallback.actions.map(normalizeAction) };

  try {
    const parsed = JSON.parse(saved) as Partial<NexusState>;
    if (parsed.schemaVersion !== 1) return fallback;
    return {
      ...fallback,
      ...parsed,
      actions: (parsed.actions ?? fallback.actions).map(normalizeAction),
      categories: (parsed.categories ?? fallback.categories).map((category, index) => ({ ...category, order: category.order ?? index })),
      recoveryEvents: parsed.recoveryEvents ?? [],
      recoveryContexts: parsed.recoveryContexts ?? [],
      preferences: { ...fallback.preferences, ...parsed.preferences },
    };
  } catch {
    return fallback;
  }
};

export type ActionDraft = Omit<ActionDefinition, "id" | "archived" | "createdAt" | "updatedAt">;

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
  const today = dateKey();

  useEffect(() => { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);

  const completeAction = useCallback((actionId: string, value: boolean | number | string, customFieldValues: ActionCompletion["customFieldValues"] = {}) => {
    setState((current) => {
      const action = current.actions.find((item) => item.id === actionId);
      if (!action) return current;
      const completion: ActionCompletion = {
        id: `completion-${actionId}-${Date.now()}`,
        actionId,
        date: today,
        value,
        completedAt: new Date().toISOString(),
        customFieldValues,
        actionTypeSnapshot: action.type,
        targetSnapshot: action.target,
        unitSnapshot: action.unit,
      };
      const prior = action.type === "event" ? current.completions : current.completions.filter((item) => !(item.actionId === actionId && item.date === today));
      return { ...current, completions: [...prior, completion] };
    });
  }, [today]);

  const toggleAction = useCallback((actionId: string) => {
    setState((current) => {
      const action = current.actions.find((item) => item.id === actionId);
      if (!action) return current;
      const existing = current.completions.find((item) => item.actionId === actionId && item.date === today);
      if (existing) return { ...current, completions: current.completions.filter((item) => item.id !== existing.id) };
      const completion: ActionCompletion = {
        id: `completion-${actionId}-${Date.now()}`,
        actionId,
        date: today,
        value: true,
        completedAt: new Date().toISOString(),
        customFieldValues: {},
        actionTypeSnapshot: action.type,
        targetSnapshot: action.target,
        unitSnapshot: action.unit,
      };
      return { ...current, completions: [...current.completions, completion] };
    });
  }, [today]);

  const createAction = useCallback((draft: ActionDraft) => {
    const now = new Date().toISOString();
    const id = `action-${Date.now()}`;
    setState((current) => ({ ...current, actions: [...current.actions, { ...draft, id, archived: false, active: true, createdAt: now, updatedAt: now }] }));
    return id;
  }, []);

  const updateAction = useCallback((actionId: string, draft: ActionDraft) => {
    setState((current) => ({ ...current, actions: current.actions.map((action) => action.id === actionId ? { ...action, ...draft, id: action.id, createdAt: action.createdAt, updatedAt: new Date().toISOString() } : action) }));
  }, []);

  const archiveAction = useCallback((actionId: string, archived = true) => {
    setState((current) => ({ ...current, actions: current.actions.map((action) => action.id === actionId ? { ...action, archived, updatedAt: new Date().toISOString() } : action) }));
  }, []);

  const createCategory = useCallback((input: Pick<Category, "name" | "icon" | "color">) => {
    setState((current) => ({ ...current, categories: [...current.categories, { id: `category-${Date.now()}`, ...input, order: current.categories.length, archived: false }] }));
  }, []);

  const updateCategory = useCallback((categoryId: string, updates: Partial<Pick<Category, "name" | "icon" | "color" | "archived">>) => {
    setState((current) => ({ ...current, categories: current.categories.map((category) => category.id === categoryId ? { ...category, ...updates } : category) }));
  }, []);

  const reorderCategory = useCallback((categoryId: string, direction: -1 | 1) => {
    setState((current) => {
      const ordered = [...current.categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const index = ordered.findIndex((category) => category.id === categoryId);
      const destination = index + direction;
      if (index < 0 || destination < 0 || destination >= ordered.length) return current;
      [ordered[index], ordered[destination]] = [ordered[destination], ordered[index]];
      return { ...current, categories: ordered.map((category, order) => ({ ...category, order })) };
    });
  }, []);

  const togglePriority = useCallback((priorityId: string) => {
    setState((current) => ({ ...current, priorities: current.priorities.map((priority) => priority.id === priorityId ? { ...priority, completed: !priority.completed } : priority) }));
  }, []);

  const addRecoveryEvent = useCallback((input: RecoveryLogInput) => {
    const now = new Date();
    const eventId = `recovery-${now.getTime()}`;
    const hasContext = input.context && Object.values(input.context).some((value) => value !== undefined && value !== "");
    const contextId = hasContext ? `context-${now.getTime()}` : undefined;
    setState((current) => ({
      ...current,
      recoveryEvents: [{ id: eventId, type: input.type, occurredAt: now.toISOString(), contextId, customLabel: input.customLabel?.trim() || undefined }, ...current.recoveryEvents],
      recoveryContexts: contextId ? [{ id: contextId, eventId, ...input.context, timeOfDay: getTimeOfDay(now.getHours()), dayOfWeek: now.getDay(), customFactors: {} }, ...current.recoveryContexts] : current.recoveryContexts,
    }));
  }, []);

  const addRecoveryAction = useCallback((name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    const now = new Date().toISOString();
    setState((current) => ({
      ...current,
      actions: [...current.actions, { id: `action-${Date.now()}`, name: cleanName, description: "A self-defined action that supports recovery.", icon: "shield-check", type: "boolean", categoryId: "recovery", schedule: ["daily"], scheduleConfig: { mode: "daily" }, target: 1, unit: "completion", priority: "normal", customFields: {}, customFieldDefinitions: [], includeInAnalytics: true, includeInRecovery: true, classification: "positive", active: true, archived: false, createdAt: now, updatedAt: now }],
    }));
  }, []);

  const setRecoveryWidgetDetail = useCallback((recoveryWidgetDetail: NexusState["preferences"]["recoveryWidgetDetail"]) => {
    setState((current) => ({ ...current, preferences: { ...current.preferences, recoveryWidgetDetail } }));
  }, []);

  const actionsToday = useMemo(() => state.actions.filter((action) => isActionScheduled(action, new Date(), state.completions)), [state.actions, state.completions]);
  const recoveryActions = useMemo(() => state.actions.filter((action) => action.includeInRecovery && !action.archived && action.active !== false), [state.actions]);
  const completedActionIds = useMemo(() => new Set(state.completions.filter((item) => item.date === today).map((item) => item.actionId)), [state.completions, today]);
  const prioritiesToday = useMemo(() => state.priorities.filter((priority) => priority.date === today), [state.priorities, today]);

  return {
    state,
    actionsToday,
    recoveryActions,
    completedActionIds,
    prioritiesToday,
    toggleAction,
    completeAction,
    createAction,
    updateAction,
    archiveAction,
    createCategory,
    updateCategory,
    reorderCategory,
    togglePriority,
    addRecoveryEvent,
    addRecoveryAction,
    setRecoveryWidgetDetail,
  };
}
