export type ReviewTrustRow = {
  showed_up: boolean | null;
  host_paid_benefit: boolean | null;
  reviewee_is_host: boolean | null;
};

export type ReviewTrustMetrics = {
  attendanceRate: number | null;
  attendanceCount: number;
  hostReliabilityRate: number | null;
  hostReliabilityCount: number;
};

export function computeReviewTrustMetrics(
  rows: ReviewTrustRow[]
): ReviewTrustMetrics {
  const attendanceRows = rows.filter((row) => row.showed_up !== null);
  const attendancePositive = attendanceRows.filter((row) => row.showed_up).length;

  const hostReliabilityRows = rows.filter(
    (row) => row.reviewee_is_host === true && row.host_paid_benefit !== null
  );
  const hostReliabilityPositive = hostReliabilityRows.filter(
    (row) => row.host_paid_benefit
  ).length;

  return {
    attendanceRate:
      attendanceRows.length > 0 ? attendancePositive / attendanceRows.length : null,
    attendanceCount: attendanceRows.length,
    hostReliabilityRate:
      hostReliabilityRows.length > 0
        ? hostReliabilityPositive / hostReliabilityRows.length
        : null,
    hostReliabilityCount: hostReliabilityRows.length,
  };
}

export function formatTrustRate(rate: number | null) {
  if (rate === null) return "—";
  return `${Math.round(rate * 100)}%`;
}
