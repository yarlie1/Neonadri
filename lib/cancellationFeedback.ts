export const CANCELLATION_FEEDBACK_OPTIONS = [
  {
    value: "reasonable_notice",
    label: "Reasonable notice",
    description: "The host cancelled, but gave enough notice for it to feel fair.",
  },
  {
    value: "last_minute",
    label: "Last-minute cancellation",
    description: "The host cancelled too close to the meetup time.",
  },
  {
    value: "no_explanation",
    label: "No explanation",
    description: "The meetup was cancelled without a clear reason.",
  },
  {
    value: "unreliable",
    label: "Plans felt unreliable",
    description: "The cancellation made the meetup feel poorly coordinated or unreliable.",
  },
  {
    value: "safety_concern",
    label: "Safety concern",
    description: "The cancellation or surrounding behavior raised a safety concern.",
  },
  {
    value: "other",
    label: "Other",
    description: "Something else about the cancellation stood out.",
  },
] as const;

export type CancellationFeedbackType =
  (typeof CANCELLATION_FEEDBACK_OPTIONS)[number]["value"];

export const VALID_CANCELLATION_FEEDBACK_TYPES = new Set<string>(
  CANCELLATION_FEEDBACK_OPTIONS.map((option) => option.value)
);
