export const USER_TIME_ZONE_COOKIE = "neonadri_tz";
export const FALLBACK_TIME_ZONE = "America/Los_Angeles";

export function normalizeUserTimeZone(value?: string | null) {
  if (!value) return FALLBACK_TIME_ZONE;

  try {
    const normalized = value.trim();
    Intl.DateTimeFormat(undefined, { timeZone: normalized });
    return normalized;
  } catch {
    return FALLBACK_TIME_ZONE;
  }
}
