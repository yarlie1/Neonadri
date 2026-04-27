type RpcCapableClient = {
  rpc: (
    fn: string,
    args: Record<string, unknown>
  ) => PromiseLike<{ data: unknown; error: any }>;
};

export const POSTING_ACCESS_ERROR_MESSAGE =
  "Posting during beta requires beta tester approval. Apply for posting access first.";

export async function isPostingBetaRequired(supabase: RpcCapableClient) {
  const { data, error } = await supabase.rpc("is_posting_beta_required", {});

  if (error) {
    throw error;
  }

  return data !== false;
}

export async function getPostingAccessStateForEmail(
  supabase: RpcCapableClient,
  email: string | null | undefined
) {
  const postingBetaRequired = await isPostingBetaRequired(supabase);
  const normalizedEmail = email?.trim().toLowerCase() || "";

  if (!postingBetaRequired) {
    return {
      postingBetaRequired,
      postingAccessAllowed: true,
    };
  }

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return {
      postingBetaRequired,
      postingAccessAllowed: false,
    };
  }

  const { data, error } = await supabase.rpc("is_beta_email_allowed", {
    check_email: normalizedEmail,
  });

  if (error) {
    throw error;
  }

  return {
    postingBetaRequired,
    postingAccessAllowed: !!data,
  };
}

export async function isPostingAccessAllowedForEmail(
  supabase: RpcCapableClient,
  email: string | null | undefined
) {
  const accessState = await getPostingAccessStateForEmail(supabase, email);
  return accessState.postingAccessAllowed;
}
