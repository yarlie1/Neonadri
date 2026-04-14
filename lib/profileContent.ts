const ABOUT_ME_BLOCKLIST = [
  /\uc131\ub9e4\ub9e4/,
  /\uc870\uac74\ub9cc\ub0a8/,
  /\uc6d0\ub098\uc787/,
  /\uc2a4\ud3f0/,
  /\uc5c5\uc18c/,
  /\bescort\b/i,
  /\bprostitut(?:e|ion)\b/i,
  /\bsugar\s?(?:baby|daddy)\b/i,
  /\bpay\s?for\s?sex\b/i,
  /\bsex\s?work\b/i,
];

export const ABOUT_ME_RESTRICTION_MESSAGE =
  "About Me can't include prostitution, explicit solicitation, or other unsafe sexual content.";

export function validateAboutMeContent(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return { ok: true as const };
  }

  const squashed = normalized.replace(/\s+/g, "");
  const blocked = ABOUT_ME_BLOCKLIST.some(
    (pattern) => pattern.test(normalized) || pattern.test(squashed)
  );

  if (blocked) {
    return {
      ok: false as const,
      message: ABOUT_ME_RESTRICTION_MESSAGE,
    };
  }

  return { ok: true as const };
}
