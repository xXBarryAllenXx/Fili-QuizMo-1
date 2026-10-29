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
    table: "admin" | "teacher";
    column: "user_id" | "teacher_id";
    userId: string;
  }): Promise<{ exists: boolean; error: AuthError | null }>;
};

async function readMembership(
  client: SearchAuthClient,
  table: "admin" | "teacher",
  column: "user_id" | "teacher_id",
  userId: string,
): Promise<{ exists: boolean; error: AuthError | null }> {
  try {
    return await client.hasMembership({ table, column, userId });
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

    const admin = await readMembership(
      client,
      "admin",
      "user_id",
      user.id,
    );

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
    const teacher = await readMembership(
      client,
      "teacher",
      "teacher_id",
      user.id,
    );

    if (!teacher.exists) {
      throw new SearchError(
        403,
        "FORBIDDEN_ROLE",
        "This account is not authorized for teacher search.",
      );
    }

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

  // Older accounts may not have trusted app_metadata.role yet. Fall back to
  // the role tables, preferring admin only when AAL2 has already been proven.
  if (currentLevel === "aal2") {
    const admin = await readMembership(
      client,
      "admin",
      "user_id",
      user.id,
    );

    if (admin.exists) {
      return createSearchScope({
        role: "admin",
        userId: user.id,
        displayName,
      });
    }
  }

  const teacher = await readMembership(
    client,
    "teacher",
    "teacher_id",
    user.id,
  );

  if (teacher.exists) {
    return createSearchScope({
      role: "teacher",
      userId: user.id,
      displayName,
    });
  }

  throw new SearchError(
    403,
    "FORBIDDEN_ROLE",
    "This account is not authorized to search records.",
  );
}
