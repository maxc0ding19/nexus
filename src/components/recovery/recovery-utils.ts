import type { RecoveryContext, RecoveryEvent, RecoveryEventType } from "@/types/nexus";

export const recoveryEventMeta: Record<RecoveryEventType, { label: string; description: string; tone: string }> = {
  urge: { label: "Urge", description: "An urge appeared", tone: "text-[#d7b36b] bg-[#d7b36b]/10 border-[#d7b36b]/20" },
  difficult: { label: "Difficult moment", description: "A period that required attention", tone: "text-[#ca9f67] bg-[#ca9f67]/10 border-[#ca9f67]/20" },
  redirect: { label: "Successful redirection", description: "You chose a helpful response", tone: "text-[#64ce94] bg-[#55c98b]/10 border-[#55c98b]/20" },
  setback: { label: "Setback", description: "A data point to understand", tone: "text-[#cf8580] bg-[#c86f69]/10 border-[#c86f69]/20" },
  custom: { label: "Custom event", description: "Record something relevant", tone: "text-[#8eb5d8] bg-[#78a8d6]/10 border-[#78a8d6]/20" },
};

export const formatEventTime = (value: string) => {
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return `${sameDay ? "Today" : new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date)} · ${new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(date)}`;
};

export function getRecoveryStats(events: RecoveryEvent[]) {
  const now = Date.now();
  const within = (days: number) => events.filter((event) => now - new Date(event.occurredAt).getTime() <= days * 86400000);
  const recent = within(7);
  const setbacks = events.filter((event) => event.type === "setback");
  const redirects = events.filter((event) => event.type === "redirect");
  const lastSetback = setbacks[0];
  const daysSinceSetback = lastSetback ? Math.floor((now - new Date(lastSetback.occurredAt).getTime()) / 86400000) : null;
  return { recent, redirects, setbacks, daysSinceSetback };
}

export function deriveInsight(events: RecoveryEvent[], contexts: RecoveryContext[]) {
  if (events.length < 3) {
    return {
      enough: false,
      title: "Continue logging to identify meaningful patterns.",
      observation: "A few more entries are needed before NEXUS can compare context reliably.",
      action: "Log urges, redirects, and difficult moments when they occur—brief entries are useful.",
      confidence: "Insufficient",
    };
  }

  const counts = contexts.reduce<Record<string, number>>((acc, context) => {
    acc[context.timeOfDay] = (acc[context.timeOfDay] ?? 0) + 1;
    return acc;
  }, {});
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const enoughForTimePattern = dominant && dominant[1] >= 2;

  if (enoughForTimePattern) {
    return {
      enough: true,
      title: `Logged events are appearing more often in the ${dominant[0]}.`,
      observation: `This is an observation across ${contexts.length} context ${contexts.length === 1 ? "record" : "records"}, not evidence that time of day caused the events.`,
      action: `Choose one low-friction protective action for the ${dominant[0]} and keep logging for another week.`,
      confidence: contexts.length >= 7 ? "Moderate" : "Early",
    };
  }

  return {
    enough: false,
    title: "No stable pattern detected yet.",
    observation: "The current entries vary in context, which is useful information but not yet a repeatable signal.",
    action: "Continue logging optional context when it is easy to do so.",
    confidence: "Insufficient",
  };
}
