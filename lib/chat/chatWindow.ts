import { parseMeetingTime } from "../meetingTime";

const CHAT_CLOSE_DELAY_MS = 72 * 60 * 60 * 1000;

export function getChatWindowState(
  meetingTime: string | null,
  timeZone: string,
  now = Date.now()
) {
  const parsed = parseMeetingTime(meetingTime, timeZone);

  if (!parsed) {
    return {
      meetingStarted: false,
      chatClosed: false,
      closesAt: null as Date | null,
    };
  }

  const meetingStarted = now >= parsed.getTime();
  const closesAt = new Date(parsed.getTime() + CHAT_CLOSE_DELAY_MS);
  const chatClosed = now > closesAt.getTime();

  return {
    meetingStarted,
    chatClosed,
    closesAt,
  };
}

export const MATCH_CHAT_CLOSED_MESSAGE =
  "This chat closed 72 hours after the meetup.";
