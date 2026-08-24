export const DISPLAY_NAME_MAX_LENGTH = 24;

export function normalizeDisplayName(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ");
}

export function getUserMetadataDisplayName(
  userMetadata: Record<string, unknown> | null | undefined
) {
  const candidates = [
    userMetadata?.display_name,
    userMetadata?.full_name,
    userMetadata?.name,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeDisplayName(candidate);
    if (normalized) {
      return normalized.slice(0, DISPLAY_NAME_MAX_LENGTH).trim();
    }
  }

  return "";
}
