function slugPart(value: string | number | null | undefined) {
  return String(value || "")
    .trim()
    .normalize("NFC")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractPostIdParam(value: string | number | null | undefined) {
  const match = String(value || "").match(/^\d+/);
  return match ? match[0] : "";
}

export function buildPostPath(
  id: string | number | null | undefined,
  purpose?: string | null,
  place?: string | null
) {
  const postId = extractPostIdParam(id);
  if (!postId) return "/posts";

  const purposeSlug = slugPart(purpose);
  const placeSlug = slugPart(place);
  const suffix = [purposeSlug, placeSlug].filter(Boolean).join("_");

  return suffix ? `/posts/${postId}_${suffix}` : `/posts/${postId}`;
}
