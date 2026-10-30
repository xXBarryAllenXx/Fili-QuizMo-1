import { SearchError } from "./errors";
import { createSearchScope } from "./scope";
import type { SearchScope } from "./types";

type AuthError = {
  code?: string;
  message: string;
};

type AuthUser = {
  id: string;
  email?: string | null;
  app_metadata?: Record<string, unknown>;
};

export type SearchAuthClient = {
  auth: {
    getUser(): Promise<{
      data: { user: AuthUser | null };
      error: AuthError | null;
    }>;
    mfa: {
      getAuthenticatorAssuranceLevel(): Promise<{
        data: { currentLevel: string | null } | null;
        error: AuthError | null;
      }>;
    };
  };
  hasMembership(input: {
    table: "admin_accounts";
    column: "user_id";
    userId: string;
  }): Promise<{ exists: boolean; error: AuthError | null }>;
};

async function readMembership(
  client: SearchAuthClient,
  userId: string,
): Promise<{ exists: boolean; error: AuthError | null }> {
  try {
    return await client.hasMembership({
      table: "admin_accounts",
      column: "user_id",
      userId,
    });
  } catch (error) {
    return {
      exists: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : "Unable to verify account access.",
      },
    };
  }
}

function getMetadataRole(
  user: AuthUser,
): "admin" | "teacher" | "other" | null {
  const role = user.app_metadata?.role;

  if (typeof role !== "string") {
    return null;
  }

  const normalized = role.trim().toLowerCase();

  if (normalized === "admin" || normalized === "teacher") {
    return normalized;
  }

  return "other";
}

function displayNameFor(user: AuthUser): string | null {
  const email = user.email?.trim();

  if (!email) {
    return null;
  }

  return email.split("@")[0] || null;
}

export async function resolveSearchContext(
  client: SearchAuthClient,
): Promise<SearchScope> {
  const { data: userData, error: userError } =
    await client.auth.getUser();

  if (userError || !userData.user) {
    throw new SearchError(
      401,
      "UNAUTHENTICATED",
      "Sign in to search records.",
    );
  }

  const user = userData.user;
  const metadataRole = getMetadataRole(user);
  const { data: assurance, error: assuranceError } =
    await client.auth.mfa.getAuthenticatorAssuranceLevel();

  if (assuranceError) {
    throw new SearchError(
      403,
      "SECURITY_LEVEL_UNAVAILABLE",
      "Your session security level could not be verified.",
    );
  }

  const currentLevel = assurance?.currentLevel ?? null;
  const displayName = displayNameFor(user);

  if (metadataRole === "admin") {
    if (currentLevel !== "aal2") {
      throw new SearchError(
        403,
        "MFA_REQUIRED",
        "Admin search requires a verified multi-factor session.",
      );
    }

    const admin = await readMembership(client, user.id);

    if (!admin.exists) {
      throw new SearchError(
        403,
        "FORBIDDEN_ROLE",
        "This account is not authorized for admin search.",
      );
    }

    return createSearchScope({
      role: "admin",
      userId: user.id,
      displayName,
    });
  }

  if (metadataRole === "teacher") {
    // app_metadata is trusted (only the service role can write it) and
    // teacher_accounts has no user_id column to check. Teacher rows are
    // scoped to this auth user id by teacher_id on quiz_sessions and
    // quiz_results, so no membership lookup is possible or necessary here.
    return createSearchScope({
      role: "teacher",
      userId: user.id,
      displayName,
    });
  }

  if (metadataRole === "other") {
    throw new SearchError(
      403,
      "FORBIDDEN_ROLE",
      "This account does not have a supported search role.",
    );
  }

  // Older accounts may not have trusted app_metadata.role yet. Only admins
  // can be verified through RLS, and only after AAL2 has already been proven.
  if (currentLevel === "aal2") {
    const admin = await readMembership(client, user.id);

    if (admin.exists) {
      return createSearchScope({
        role: "admin",
        userId: user.id,
        displayName,
      });
    }
  }

  throw new SearchError(
    403,
    "FORBIDDEN_ROLE",
    "This account is not authorized to search records.",
  );
}
