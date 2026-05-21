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
  const ageLabel = (ageGroup || "Any age").trim();

  return [genderLabel, ageLabel].filter(Boolean).join(" / ");
}
