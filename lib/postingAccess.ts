type RpcCapableClient = {
  rpc: (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: unknown; error: any }>;
};

export const POSTING_ACCESS_ERROR_MESSAGE =
  "Posting during beta requires beta tester approval. Apply for posting access first.";

export async function isPostingAccessAllowedForEmail(
  supabase: RpcCapableClient,
  email: string | null | undefined
) {
  const normalizedEmail = email?.trim().toLowerCase() || "";

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return false;
  }

  const { data, error } = await supabase.rpc("is_beta_email_allowed", {
    check_email: normalizedEmail,
  });

  if (error) {
    throw error;
  }

  return !!data;
}
