const MEETING_TIME_ZONE = "America/Los_Angeles";

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  }).formatToParts(date);

  const offsetLabel =
    parts.find((part) => part.type === "timeZoneName")?.value || "GMT+0";
  const match = offsetLabel.match(/(?:GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?/i);

  if (!match) return 0;

  const [, sign, hourText, minuteText] = match;
  const hours = Number(hourText || "0");
  const minutes = Number(minuteText || "0");
  const direction = sign === "-" ? -1 : 1;

  return direction * (hours * 60 + minutes) * 60 * 1000;
}

export function parseMeetingTime(
  meetingTime: string | null,
  timeZone = MEETING_TIME_ZONE
) {
  if (!meetingTime) return null;

  const trimmed = meetingTime.trim();
  const hasExplicitZone = /[zZ]$|[+-]\d{2}:\d{2}$/.test(trimmed);

  if (hasExplicitZone) {
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/
  );

  if (!match) {
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const [, yearText, monthText, dayText, hourText, minuteText, secondText] =
    match;

  const baseUtcMs = Date.UTC(
    Number(yearText),
    Number(monthText) - 1,
    Number(dayText),
    Number(hourText),
    Number(minuteText),
    Number(secondText || "0")
  );

  let candidate = new Date(baseUtcMs);

  for (let i = 0; i < 2; i += 1) {
    const offsetMs = getTimeZoneOffsetMs(candidate, timeZone);
    candidate = new Date(baseUtcMs - offsetMs);
  }

  return Number.isNaN(candidate.getTime()) ? null : candidate;
}

export function isMeetingFinished(
  meetingTime: string | null,
  timeZone = MEETING_TIME_ZONE
) {
  const date = parseMeetingTime(meetingTime, timeZone);
  if (!date) return false;
  return date.getTime() < Date.now();
}

export function formatMeetingTime(
  meetingTime: string | null,
  timeZone = MEETING_TIME_ZONE
) {
  const date = parseMeetingTime(meetingTime, timeZone);
  if (!date) return null;

  return `${date.toLocaleDateString(undefined, {
    timeZone,
  })} ${date.toLocaleTimeString([], {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function formatMeetingCountdown(
  meetingTime: string | null,
  timeZone = MEETING_TIME_ZONE
) {
  const target = parseMeetingTime(meetingTime, timeZone);
  if (!target) return null;

  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return null;

  if (diffMs < 1000 * 60 * 60 * 24) return "D-0";

  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) return `H-${diffHours}`;

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return `D-${diffDays}`;
}
