export type ActionType =
  | "boolean"
  | "quantity"
  | "duration"
  | "count"
  | "scale"
  | "avoidance"
  | "journal"
  | "event";

export type StatusTone = "positive" | "warning" | "negative" | "info" | "neutral";

export interface Category {
  id: string;
  name: string;
  icon: string;
  color?: string;
  archived: boolean;
}

export interface ActionDefinition {
  id: string;
  name: string;
  description?: string;
  type: ActionType;
  categoryId: string;
  schedule: string[];
  target?: number;
  unit?: string;
  reminder?: string;
  notes?: string;
  customFields: Record<string, string | number | boolean>;
  includeInAnalytics: boolean;
  includeInRecovery: boolean;
  classification: "positive" | "negative" | "neutral";
  color?: string;
  archived: boolean;
}

export interface ActionCompletion {
  id: string;
  actionId: string;
  date: string;
  value: boolean | number | string;
  completedAt?: string;
}

export interface DailyPriority {
  id: string;
  date: string;
  title: string;
  context: string;
  completed: boolean;
}

export interface ContextualFactors {
  sleepHours?: number;
  stress?: number;
  mood?: number;
  energy?: number;
  screenMinutes?: number;
  socialContext?: "alone" | "social" | "mixed";
  urges?: number;
  precedingEvent?: string;
  helpfulResponse?: string;
}

export interface RecoveryEntry {
  id: string;
  date: string;
  status: "steady" | "attention" | "difficult";
  score: number;
  factors: ContextualFactors;
  note?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title?: string;
  content: string;
  tags: string[];
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  status: "active" | "paused" | "completed";
}

export interface GoalProgress {
  id: string;
  goalId: string;
  date: string;
  value: number;
  note?: string;
}

export interface Metric {
  id: string;
  key: string;
  label: string;
  value: number;
  unit: string;
  date: string;
  tone: StatusTone;
  trend?: number;
}

export interface DashboardWidget {
  id: string;
  dashboardId: string;
  type: "recovery" | "trend" | "actions" | "sleep" | "screen" | "journal" | "goals" | "category" | "insight";
  title: string;
  size: "small" | "medium" | "large";
  order: number;
  config: Record<string, string | number | boolean>;
}

export interface UserPreferences {
  name: string;
  weekStartsOn: 0 | 1;
  reducedMotion: boolean;
  showDemoData: boolean;
  activeDashboardId: string;
}

export interface NexusState {
  schemaVersion: 1;
  categories: Category[];
  actions: ActionDefinition[];
  completions: ActionCompletion[];
  priorities: DailyPriority[];
  recoveryEntries: RecoveryEntry[];
  journalEntries: JournalEntry[];
  goals: Goal[];
  goalProgress: GoalProgress[];
  metrics: Metric[];
  dashboardWidgets: DashboardWidget[];
  preferences: UserPreferences;
}
