import type { ActionCompletion, ActionDefinition, Category, NexusState, RecoveryContext, RecoveryEvent } from "@/types/nexus";

export type AnalyticsRange = "7d" | "30d" | "90d" | "1y" | "all";
export type DataQuality = "Insufficient" | "Early" | "Moderate" | "High";

export interface DatedValue {
  date: string;
  value: number;
}

export interface AnalyticsInsight {
  id: string;
  title: string;
  observation: string;
  relevantData: string;
  confidence: DataQuality;
  interpretation: string;
  suggestedAction: string;
  tone: "positive" | "neutral" | "attention";
}

export interface CorrelationResult {
  key: keyof Pick<RecoveryContext, "sleepQuality" | "sleepHours" | "stress" | "mood" | "energy" | "screenMinutes" | "exerciseMinutes">;
  label: string;
  coefficient: number;
  observations: number;
  quality: DataQuality;
  direction: "higher" | "lower" | "none";
}

export const rangeOptions: { value: AnalyticsRange; label: string; days: number | null }[] = [
  { value: "7d", label: "7D", days: 7 },
  { value: "30d", label: "30D", days: 30 },
  { value: "90d", label: "90D", days: 90 },
  { value: "1y", label: "1Y", days: 365 },
  { value: "all", label: "ALL", days: null },
];

export const localDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const dateFromKey = (key: string) => new Date(`${key}T12:00:00`);
const rangeDays = (range: AnalyticsRange) => rangeOptions.find((item) => item.value === range)?.days ?? null;

export function isDateInRange(value: string, range: AnalyticsRange, now = new Date()) {
  const days = rangeDays(range);
  if (days === null) return true;
  const valueTime = value.includes("T") ? new Date(value).getTime() : dateFromKey(value).getTime();
  const threshold = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days + 1).getTime();
  return valueTime >= threshold && valueTime <= now.getTime() + 86400000;
}

export function filterAnalyticsState(state: NexusState, range: AnalyticsRange) {
  return {
    completions: state.completions.filter((item) => isDateInRange(item.date, range)),
    recoveryEvents: state.recoveryEvents.filter((item) => isDateInRange(item.occurredAt, range)),
    recoveryContexts: state.recoveryContexts.filter((context) => {
      const event = state.recoveryEvents.find((item) => item.id === context.eventId);
      return event ? isDateInRange(event.occurredAt, range) : false;
    }),
    journalEntries: state.journalEntries.filter((item) => isDateInRange(item.date, range)),
    goalProgress: state.goalProgress.filter((item) => isDateInRange(item.date, range)),
    metrics: state.metrics.filter((item) => isDateInRange(item.date, range)),
  };
}

function earliestDate(state: NexusState) {
  const dates = [
    ...state.completions.map((item) => item.date),
    ...state.recoveryEvents.map((item) => item.occurredAt.slice(0, 10)),
    ...state.journalEntries.map((item) => item.date),
    ...state.goalProgress.map((item) => item.date),
  ].sort();
  return dates[0];
}

export function buildDailyActivity(state: NexusState, range: AnalyticsRange) {
  const configuredDays = rangeDays(range);
  const earliest = earliestDate(state);
  const days = configuredDays ?? (earliest ? Math.max(1, Math.ceil((Date.now() - dateFromKey(earliest).getTime()) / 86400000) + 1) : 1);
  const limitedDays = Math.min(days, 730);
  return Array.from({ length: limitedDays }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (limitedDays - index - 1));
    const key = localDateKey(date);
    const completions = state.completions.filter((item) => item.date === key);
    const recoveryEvents = state.recoveryEvents.filter((item) => item.occurredAt.slice(0, 10) === key);
    const journals = state.journalEntries.filter((item) => item.date === key);
    return {
      date: key,
      label: new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date),
      actions: completions.length,
      recovery: recoveryEvents.length,
      redirects: recoveryEvents.filter((item) => item.type === "redirect").length,
      activity: completions.length + recoveryEvents.length + journals.length,
    };
  });
}

export function buildCategoryTotals(completions: ActionCompletion[], actions: ActionDefinition[], categories: Category[]) {
  return categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      value: completions.filter((completion) => actions.find((action) => action.id === completion.actionId)?.categoryId === category.id).length,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function buildActionSeries(action: ActionDefinition, completions: ActionCompletion[], range: AnalyticsRange) {
  return completions
    .filter((item) => item.actionId === action.id && isDateInRange(item.date, range))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => ({
      date: item.date,
      label: new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(dateFromKey(item.date)),
      value: typeof item.value === "number" ? item.value : item.value === true ? 1 : 1,
      rawValue: item.value,
    }));
}

export function getDataQuality(count: number): DataQuality {
  if (count < 5) return "Insufficient";
  if (count < 10) return "Early";
  if (count < 30) return "Moderate";
  return "High";
}

function pearson(pairs: [number, number][]) {
  if (pairs.length < 2) return 0;
  const meanX = pairs.reduce((sum, [x]) => sum + x, 0) / pairs.length;
  const meanY = pairs.reduce((sum, [, y]) => sum + y, 0) / pairs.length;
  const numerator = pairs.reduce((sum, [x, y]) => sum + (x - meanX) * (y - meanY), 0);
  const denominatorX = Math.sqrt(pairs.reduce((sum, [x]) => sum + (x - meanX) ** 2, 0));
  const denominatorY = Math.sqrt(pairs.reduce((sum, [, y]) => sum + (y - meanY) ** 2, 0));
  return denominatorX && denominatorY ? numerator / (denominatorX * denominatorY) : 0;
}

const severity: Record<RecoveryEvent["type"], number> = { redirect: 0, custom: 1, urge: 1, difficult: 2, setback: 3 };
const correlationFields: { key: CorrelationResult["key"]; label: string }[] = [
  { key: "sleepQuality", label: "Sleep quality" },
  { key: "sleepHours", label: "Sleep duration" },
  { key: "screenMinutes", label: "Screen usage" },
  { key: "stress", label: "Stress" },
  { key: "mood", label: "Mood" },
  { key: "energy", label: "Energy" },
  { key: "exerciseMinutes", label: "Exercise" },
];

export function buildRecoveryCorrelations(events: RecoveryEvent[], contexts: RecoveryContext[]): CorrelationResult[] {
  return correlationFields.map(({ key, label }) => {
    const pairs = contexts.flatMap((context): [number, number][] => {
      const event = events.find((item) => item.id === context.eventId);
      const value = context[key];
      return event && typeof value === "number" ? [[value, severity[event.type]]] : [];
    });
    const coefficient = pearson(pairs);
    return { key, label, coefficient, observations: pairs.length, quality: getDataQuality(pairs.length), direction: Math.abs(coefficient) < 0.2 ? "none" : coefficient > 0 ? "higher" : "lower" };
  });
}

export function buildDistributions(events: RecoveryEvent[], contexts: RecoveryContext[]) {
  const timeOrder: RecoveryContext["timeOfDay"][] = ["morning", "afternoon", "evening", "night"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return {
    timeOfDay: timeOrder.map((label) => ({ label, value: contexts.filter((item) => item.timeOfDay === label).length })),
    dayOfWeek: dayNames.map((label, day) => ({ label, value: contexts.filter((item) => item.dayOfWeek === day).length })),
    eventTypes: (["urge", "difficult", "redirect", "setback", "custom"] as RecoveryEvent["type"][]).map((type) => ({ label: type, value: events.filter((item) => item.type === type).length })),
    responses: Object.entries(contexts.reduce<Record<string, number>>((acc, context) => {
      if (context.helpfulResponse) acc[context.helpfulResponse] = (acc[context.helpfulResponse] ?? 0) + 1;
      return acc;
    }, {})).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value),
  };
}

function completionTrend(series: ReturnType<typeof buildDailyActivity>) {
  if (series.length < 6 || series.reduce((sum, item) => sum + item.actions, 0) < 3) return null;
  const midpoint = Math.floor(series.length / 2);
  const before = series.slice(0, midpoint).reduce((sum, item) => sum + item.actions, 0) / midpoint;
  const afterSlice = series.slice(midpoint);
  const after = afterSlice.reduce((sum, item) => sum + item.actions, 0) / afterSlice.length;
  if (before === 0) return after > 0 ? 100 : 0;
  return Math.round(((after - before) / before) * 100);
}

export function detectInsights(state: NexusState, range: AnalyticsRange): AnalyticsInsight[] {
  const filtered = filterAnalyticsState(state, range);
  const series = buildDailyActivity(state, range);
  const insights: AnalyticsInsight[] = [];
  const trend = completionTrend(series);

  if (trend !== null) {
    insights.push({
      id: "action-trend",
      title: `Action completion is ${trend >= 0 ? "up" : "down"} ${Math.abs(trend)}% across this range.`,
      observation: "The later half of the selected period was compared with the earlier half.",
      relevantData: `${filtered.completions.length} completion records`,
      confidence: getDataQuality(filtered.completions.length),
      interpretation: trend >= 0 ? "Your recent execution rate appears stronger." : "Your recent execution rhythm appears lighter.",
      suggestedAction: trend >= 0 ? "Keep the current schedule stable before making it more demanding." : "Review whether the current schedule still fits your available capacity.",
      tone: trend >= 0 ? "positive" : "attention",
    });
  }

  if (filtered.recoveryContexts.length >= 5) {
    const distribution = buildDistributions(filtered.recoveryEvents, filtered.recoveryContexts).timeOfDay;
    const dominant = [...distribution].sort((a, b) => b.value - a.value)[0];
    if (dominant.value / filtered.recoveryContexts.length >= 0.4) insights.push({
      id: "recovery-time",
      title: `Recovery events appear more often in the ${dominant.label}.`,
      observation: `${dominant.value} of ${filtered.recoveryContexts.length} context-rich events were logged in this period.`,
      relevantData: `${filtered.recoveryContexts.length} overlapping observations`,
      confidence: getDataQuality(filtered.recoveryContexts.length),
      interpretation: "Time of day may be a useful context to investigate; it does not establish a cause.",
      suggestedAction: `Consider one low-friction protective action for the ${dominant.label} and continue observing.`,
      tone: "neutral",
    });
  }

  const strongest = buildRecoveryCorrelations(filtered.recoveryEvents, filtered.recoveryContexts)
    .filter((item) => item.quality !== "Insufficient" && Math.abs(item.coefficient) >= 0.3)
    .sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient))[0];
  if (strongest) insights.push({
    id: `correlation-${strongest.key}`,
    title: `${strongest.label} has a possible relationship with recovery difficulty.`,
    observation: `The measured association is ${Math.abs(strongest.coefficient).toFixed(2)} across ${strongest.observations} overlapping records.`,
    relevantData: `${strongest.observations} paired observations`,
    confidence: strongest.quality,
    interpretation: `Recovery difficulty appears ${strongest.direction} as ${strongest.label.toLowerCase()} increases in the logged data. This is not proof of causation.`,
    suggestedAction: "Keep tracking both variables before changing your system around this observation.",
    tone: "neutral",
  });

  return insights;
}

export function createAnalyticsSnapshot(state: NexusState, range: AnalyticsRange) {
  const filtered = filterAnalyticsState(state, range);
  return {
    exportedAt: new Date().toISOString(),
    range,
    actions: state.actions.filter((item) => item.includeInAnalytics),
    completions: filtered.completions,
    recoveryEvents: filtered.recoveryEvents,
    recoveryContexts: filtered.recoveryContexts,
    journals: filtered.journalEntries,
    goals: state.goals,
    goalProgress: filtered.goalProgress,
    metrics: filtered.metrics,
  };
}
