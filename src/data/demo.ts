import type { NexusState } from "@/types/nexus";

const isoDate = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

export const createDemoState = (): NexusState => ({
  schemaVersion: 1,
  categories: [
    { id: "recovery", name: "Recovery", icon: "shield", archived: false },
    { id: "mind", name: "Mind", icon: "focus", archived: false },
    { id: "body", name: "Body", icon: "activity", archived: false },
  ],
  actions: [
    { id: "check-in", name: "Recovery check-in", description: "Name what is present without judgment.", type: "scale", categoryId: "recovery", schedule: ["daily"], target: 1, unit: "check-in", reminder: "08:30", customFields: {}, includeInAnalytics: true, includeInRecovery: true, classification: "positive", archived: false },
    { id: "walk", name: "Outdoor walk", description: "Twenty quiet minutes without your phone.", type: "duration", categoryId: "body", schedule: ["daily"], target: 20, unit: "min", reminder: "12:30", customFields: {}, includeInAnalytics: true, includeInRecovery: true, classification: "positive", archived: false },
    { id: "journal", name: "Evening journal", description: "Record the day while the signal is fresh.", type: "journal", categoryId: "mind", schedule: ["daily"], target: 1, unit: "entry", reminder: "21:00", customFields: {}, includeInAnalytics: true, includeInRecovery: true, classification: "positive", archived: false },
    { id: "cutoff", name: "Phone boundary", description: "Keep the final hour of the day screen-free.", type: "avoidance", categoryId: "recovery", schedule: ["daily"], target: 1, unit: "boundary", reminder: "22:00", customFields: {}, includeInAnalytics: true, includeInRecovery: true, classification: "positive", archived: false },
  ],
  completions: [
    { id: "completion-checkin", actionId: "check-in", date: isoDate(), value: true, completedAt: new Date().toISOString() },
  ],
  priorities: [
    { id: "priority-1", date: isoDate(), title: "Protect the evening boundary", context: "Keep the final hour quiet and offline.", completed: false },
    { id: "priority-2", date: isoDate(), title: "Finish the project review", context: "Define the decision, not every detail.", completed: false },
    { id: "priority-3", date: isoDate(), title: "Create space to recover", context: "Take the walk before the afternoon compresses.", completed: false },
  ],
  recoveryEntries: [
    { id: "r-6", date: isoDate(-6), status: "attention", score: 58, factors: { sleepHours: 5.8, stress: 7, energy: 4, screenMinutes: 282 } },
    { id: "r-5", date: isoDate(-5), status: "attention", score: 62, factors: { sleepHours: 6.2, stress: 6, energy: 5, screenMinutes: 246 } },
    { id: "r-4", date: isoDate(-4), status: "steady", score: 68, factors: { sleepHours: 7.1, stress: 5, energy: 6, screenMinutes: 210 } },
    { id: "r-3", date: isoDate(-3), status: "steady", score: 72, factors: { sleepHours: 7.4, stress: 4, energy: 7, screenMinutes: 198 } },
    { id: "r-2", date: isoDate(-2), status: "steady", score: 70, factors: { sleepHours: 6.9, stress: 5, energy: 6, screenMinutes: 205 } },
    { id: "r-1", date: isoDate(-1), status: "steady", score: 76, factors: { sleepHours: 7.6, stress: 4, energy: 7, screenMinutes: 184 } },
    { id: "r-0", date: isoDate(), status: "steady", score: 78, factors: { sleepHours: 7.4, stress: 4, mood: 7, energy: 7, screenMinutes: 172 } },
  ],
  journalEntries: [],
  goals: [],
  goalProgress: [],
  metrics: [
    { id: "sleep", key: "sleep", label: "Sleep", value: 7.4, unit: "hr", date: isoDate(), tone: "positive", trend: 0.5 },
    { id: "screen", key: "screen", label: "Screen", value: 2.9, unit: "hr", date: isoDate(), tone: "positive", trend: -0.4 },
    { id: "energy", key: "energy", label: "Energy", value: 7, unit: "/10", date: isoDate(), tone: "neutral", trend: 1 },
    { id: "stress", key: "stress", label: "Stress", value: 4, unit: "/10", date: isoDate(), tone: "neutral", trend: -1 },
  ],
  dashboardWidgets: [
    { id: "widget-recovery", dashboardId: "default", type: "recovery", title: "Recovery", size: "large", order: 0, config: {} },
    { id: "widget-actions", dashboardId: "default", type: "actions", title: "Actions", size: "medium", order: 1, config: {} },
    { id: "widget-insight", dashboardId: "default", type: "insight", title: "System insight", size: "medium", order: 2, config: {} },
  ],
  preferences: { name: "Alex", weekStartsOn: 1, reducedMotion: true, showDemoData: true, activeDashboardId: "default" },
});
