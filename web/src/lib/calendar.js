export function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function addMonths(date, amount) {
  const next = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  return next;
}

export function startOfWeek(date) {
  const next = startOfDay(date);
  const day = next.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return addDays(next, mondayOffset);
}

export function isoDate(date) {
  const local = new Date(date);
  return `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, "0")}-${String(local.getDate()).padStart(2, "0")}`;
}

export function sameDay(a, b) {
  return isoDate(a) === isoDate(b);
}

export function monthGrid(anchor) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

export function weekDays(anchor) {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function meetingsOnDay(meetings, date) {
  const key = isoDate(date);
  return meetings.filter((meeting) => meeting.scheduled_start_at && isoDate(meeting.scheduled_start_at) === key);
}

export function rangeParams(days) {
  const from = startOfDay(days[0]);
  const to = addDays(startOfDay(days[days.length - 1]), 1);
  return { from: from.toISOString(), to: to.toISOString(), per_page: 100 };
}

export function toLocalInput(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
