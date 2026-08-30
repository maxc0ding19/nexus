import type { ActionCompletion, ActionDefinition, ActionSchedule } from "@/types/nexus";

export const defaultSchedule: ActionSchedule = { mode: "daily" };

const localDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const dateKey = (date = new Date()) => localDateKey(date);

const startOfWeek = (date: Date) => {
  const copy = new Date(date);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - ((day + 6) % 7));
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export function getActionSchedule(action: ActionDefinition): ActionSchedule {
  if (action.scheduleConfig) return action.scheduleConfig;
  if (action.schedule.includes("daily")) return defaultSchedule;
  const weekdays = action.schedule.map(Number).filter((day) => Number.isInteger(day) && day >= 0 && day <= 6);
  return weekdays.length ? { mode: "weekdays", weekdays } : defaultSchedule;
}

export function isActionScheduled(action: ActionDefinition, date: Date, completions: ActionCompletion[]) {
  if (action.archived || action.active === false) return false;
  const schedule = getActionSchedule(action);
  if (schedule.mode === "daily") return true;
  if (schedule.mode === "weekdays") return schedule.weekdays?.includes(date.getDay()) ?? false;
  if (schedule.mode === "weekly_target") {
    const key = dateKey(date);
    if (completions.some((item) => item.actionId === action.id && item.date === key)) return true;
    const weekStart = startOfWeek(date).getTime();
    const dayStart = new Date(`${key}T00:00:00`).getTime();
    const completedBeforeDay = completions.filter((item) => item.actionId === action.id && new Date(`${item.date}T12:00:00`).getTime() >= weekStart && new Date(`${item.date}T12:00:00`).getTime() < dayStart).length;
    return completedBeforeDay < (schedule.weeklyTarget ?? 1);
  }
  const start = new Date(`${schedule.startDate ?? dateKey(date)}T12:00:00`);
  const current = new Date(`${dateKey(date)}T12:00:00`);
  const elapsedDays = Math.floor((current.getTime() - start.getTime()) / 86400000);
  return elapsedDays >= 0 && elapsedDays % Math.max(1, schedule.intervalDays ?? 1) === 0;
}

export function scheduleLabel(action: ActionDefinition) {
  const schedule = getActionSchedule(action);
  if (schedule.mode === "daily") return "Every day";
  if (schedule.mode === "weekly_target") return `${schedule.weeklyTarget ?? 1}× per week`;
  if (schedule.mode === "custom") return `Every ${schedule.intervalDays ?? 1} days`;
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (schedule.weekdays ?? []).map((day) => names[day]).join(", ") || "No days selected";
}
