export function formatPersonGenderLabel(value: string | null | undefined) {
  switch ((value || "").trim()) {
    case "Male":
      return "Man";
    case "Female":
      return "Woman";
    case "Prefer not to say":
      return "Not specified";
    default:
      return (value || "").trim();
  }
}

export function formatAudienceGenderLabel(value: string | null | undefined) {
  switch ((value || "").trim()) {
    case "Male":
      return "For a man";
    case "Female":
      return "For a woman";
    case "Any":
      return "For anyone";
    case "Prefer not to say":
      return "Not specified";
    default:
      return (value || "").trim();
  }
}

export function formatPersonMeta(gender: string | null | undefined, ageGroup: string | null | undefined) {
  const genderLabel = formatPersonGenderLabel(gender);
  const ageLabel = (ageGroup || "").trim();

  return [genderLabel, ageLabel].filter(Boolean).join(" / ");
}

export function formatAudienceMeta(gender: string | null | undefined, ageGroup: string | null | undefined) {
  const genderLabel = formatAudienceGenderLabel(gender || "Any");
  const rawAgeLabel = (ageGroup || "Any age").trim();
  const ageLabel = rawAgeLabel === "Any" ? "Any age" : rawAgeLabel;

  return [genderLabel, ageLabel].filter(Boolean).join(" / ");
}

export function formatPersonMetaAgeFirst(gender: string | null | undefined, ageGroup: string | null | undefined) {
  const genderLabel = formatPersonGenderLabel(gender);
  const ageLabel = (ageGroup || "").trim();

  return [ageLabel, genderLabel].filter(Boolean).join(" / ");
}

export function formatAudienceMetaAgeFirst(gender: string | null | undefined, ageGroup: string | null | undefined) {
  const genderLabel = formatPersonGenderLabel(gender || "Any");
  const rawAgeLabel = (ageGroup || "Any age").trim();
  const ageLabel = rawAgeLabel === "Any" ? "Any age" : rawAgeLabel;

  return [ageLabel, genderLabel].filter(Boolean).join(" / ");
}

function formatCompactAge(value: string | null | undefined) {
  const normalized = (value || "").trim();
  if (!normalized || normalized === "Any" || normalized === "Any age") return "";
  return normalized.replace(/s\b/i, "");
}

function formatCompactGender(value: string | null | undefined, fallback = "A") {
  switch ((value || "").trim()) {
    case "Male":
      return "M";
    case "Female":
      return "F";
    case "Any":
      return "A";
    case "Other":
      return "O";
    case "Prefer not to say":
      return fallback;
    default:
      return fallback;
  }
}

export function formatCompactMeetupAudience({
  hostGender,
  hostAgeGroup,
  guestGender,
  guestAgeGroup,
}: {
  hostGender: string | null | undefined;
  hostAgeGroup: string | null | undefined;
  guestGender: string | null | undefined;
  guestAgeGroup: string | null | undefined;
}) {
  const hostAge = formatCompactAge(hostAgeGroup);
  const hostGenderLabel = formatCompactGender(hostGender, "");
  const guestAge = formatCompactAge(guestAgeGroup);
  const guestGenderLabel = formatCompactGender(guestGender || "Any", "A");

  const hostLabel = `${hostAge}${hostGenderLabel}` || "Host";
  const guestLabel = `${guestAge}${guestGenderLabel}` || "A";

  return `${hostLabel} for ${guestLabel}`;
}
