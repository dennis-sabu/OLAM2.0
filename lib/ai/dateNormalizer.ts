/**
 * Normalizes relative human temporal expressions (e.g. "Friday", "tomorrow", "next Monday")
 * into normalized calendar dates or standard FlowState deadline labels based on a reference date.
 */

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function normalizeDeadline(
  phrase: string | null | undefined,
  refDate: Date = new Date()
): string | null {
  if (!phrase) return null;
  const raw = phrase.trim().toLowerCase();

  // If already an ISO YYYY-MM-DD string
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  // Common direct terms
  if (raw === "today" || raw === "tonight") {
    return "Today";
  }
  if (raw === "tomorrow") {
    const tomorrow = new Date(refDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }
  if (raw === "day after tomorrow") {
    const d = new Date(refDate);
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  }

  // "in X days"
  const inDaysMatch = raw.match(/in\s+(\d+)\s+days?/);
  if (inDaysMatch) {
    const count = parseInt(inDaysMatch[1], 10);
    const target = new Date(refDate);
    target.setDate(target.getDate() + count);
    return target.toISOString().split("T")[0];
  }

  // Day of week matching (e.g. "friday", "this friday", "by friday", "next monday")
  for (let i = 0; i < DAYS.length; i++) {
    const dayName = DAYS[i];
    if (raw.includes(dayName)) {
      const isNextWeek = raw.includes("next");
      const currentDay = refDate.getDay();
      let diff = i - currentDay;
      if (diff <= 0) {
        diff += 7;
      }
      if (isNextWeek && diff < 7) {
        diff += 7;
      }
      const target = new Date(refDate);
      target.setDate(target.getDate() + diff);
      return target.toISOString().split("T")[0];
    }
  }

  // Vague terms should not invent a date
  if (raw.includes("soon") || raw.includes("later") || raw.includes("sometime") || raw.includes("eventually")) {
    return null;
  }

  // If unrecognized, preserve capitalized original phrase or return null if it's too ambiguous
  return phrase.trim();
}
