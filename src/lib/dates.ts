// Hebrew weekday names, indexed to match JS Date.getDay() (0 = Sunday).
export const HEBREW_WEEKDAYS = [
  "ראשון", // 0
  "שני", // 1
  "שלישי", // 2
  "רביעי", // 3
  "חמישי", // 4
  "שישי", // 5
  "שבת", // 6
] as const;

export function hebrewWeekday(weekday: number): string {
  return HEBREW_WEEKDAYS[weekday] ?? "";
}

// Given a weekday (0-6), return the next date (>= today) that falls on it.
// If today already matches the weekday, today is returned.
export function nextDeliveryDate(weekday: number, from: Date = new Date()): Date {
  const result = new Date(from);
  result.setHours(0, 0, 0, 0);
  const diff = (weekday - result.getDay() + 7) % 7;
  result.setDate(result.getDate() + diff);
  return result;
}

// Format a date as DD/MM/YYYY (Israeli convention).
export function formatDateHe(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}
