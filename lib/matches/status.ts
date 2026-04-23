export const MATCH_STATUS_ACTIVE = "active";
export const MATCH_STATUS_LEGACY_MATCHED = "matched";

export function normalizeMatchStatus(status: string | null | undefined) {
  const normalized = String(status || "").trim().toLowerCase();

  if (!normalized) return "";
  if (normalized === MATCH_STATUS_LEGACY_MATCHED) return MATCH_STATUS_ACTIVE;

  return normalized;
}

export function isConfirmedMatchStatus(status: string | null | undefined) {
  return normalizeMatchStatus(status) === MATCH_STATUS_ACTIVE;
}
