function pad(value) {
  return String(value).padStart(2, "0");
}

function toUtcStamp(iso) {
  const date = new Date(iso);
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    "T",
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
    "Z",
  ].join("");
}

function escapeText(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function meetingToIcs(meeting) {
  const uid = `${meeting.id}@meetingai`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MeetingAI//Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toUtcStamp(new Date().toISOString())}`,
    `DTSTART:${toUtcStamp(meeting.scheduled_start_at)}`,
    `DTEND:${toUtcStamp(meeting.scheduled_end_at || meeting.scheduled_start_at)}`,
    `SUMMARY:${escapeText(meeting.title)}`,
    meeting.project?.name ? `LOCATION:${escapeText(meeting.project.name)}` : null,
    `DESCRIPTION:${escapeText(meeting.objective || meeting.description || "MeetingAI meeting")}`,
    meeting.google?.meet_url ? `URL:${meeting.google.meet_url}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.join("\r\n");
}

export function meetingsToIcs(meetings, name = "MeetingAI") {
  const events = meetings.flatMap((meeting) => {
    const ics = meetingToIcs(meeting);
    return ics.split("\r\n").filter((line) => !["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MeetingAI//Calendar//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "END:VCALENDAR"].includes(line));
  });
  return ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//MeetingAI//${name}//EN`, "CALSCALE:GREGORIAN", "METHOD:PUBLISH", ...events, "END:VCALENDAR"].join("\r\n");
}

export function downloadIcs(filename, content) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
