function normalizeAddress(value: string | null | undefined) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function stripPreciseAddressSegment(segment: string) {
  let cleaned = segment.trim();

  cleaned = cleaned.replace(
    /\s+(apt|apartment|suite|ste|unit|floor|fl|room|rm)\s+[A-Za-z0-9-]+$/i,
    ""
  );
  cleaned = cleaned.replace(/\s+\d+(?:-\d+)?$/, "");
  cleaned = cleaned.replace(/[\s,]*#\d+[A-Za-z0-9-]*$/i, "");
  cleaned = cleaned.replace(/^\d+[A-Za-z0-9-]*\s+/, "");
  cleaned = cleaned.replace(/\s+(#\s*)?[A-Za-z0-9-]+$/i, (match) =>
    /\d/.test(match) ? "" : match
  );

  return cleaned.trim();
}

export function isAddressLikeValue(value: string | null | undefined) {
  const normalized = normalizeAddress(value);
  if (!normalized) return false;

  return (
    normalized.includes(",") ||
    /\d/.test(normalized) ||
    /\b(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|way|lane|ln|ct|court|pl|place)\b/i.test(
      normalized
    )
  );
}

export function maskPreciseAddress(address: string | null | undefined) {
  const normalized = normalizeAddress(address);
  if (!normalized) return "";

  const parts = normalized
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length > 1) {
    const [first, ...rest] = parts;
    const strippedFirst = stripPreciseAddressSegment(first);

    if (/\d/.test(first) || !strippedFirst) {
      return rest.join(", ") || normalized;
    }

    if (strippedFirst !== first) {
      return [strippedFirst, ...rest].join(", ");
    }

    return normalized;
  }

  const stripped = stripPreciseAddressSegment(normalized);
  return stripped || normalized;
}

export function getPublicLocationLabel(
  placeName: string | null | undefined,
  location: string | null | undefined
) {
  const normalizedPlaceName = normalizeAddress(placeName);
  const normalizedLocation = normalizeAddress(location);

  if (
    normalizedPlaceName &&
    (!normalizedLocation ||
      normalizedPlaceName.toLowerCase() !== normalizedLocation.toLowerCase()) &&
    !isAddressLikeValue(normalizedPlaceName)
  ) {
    return normalizedPlaceName;
  }

  if (normalizedLocation) {
    return maskPreciseAddress(normalizedLocation);
  }

  if (normalizedPlaceName) {
    return isAddressLikeValue(normalizedPlaceName)
      ? maskPreciseAddress(normalizedPlaceName)
      : normalizedPlaceName;
  }

  return "";
}

export function getVisibleLocationLabel({
  placeName,
  location,
  revealExact = false,
}: {
  placeName: string | null | undefined;
  location: string | null | undefined;
  revealExact?: boolean;
}) {
  if (revealExact) {
    return normalizeAddress(location) || normalizeAddress(placeName) || "";
  }

  return getPublicLocationLabel(placeName, location);
}
