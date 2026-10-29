"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";

export function AdminLoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "enroll" | "verify">(
    "credentials",
  );
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const supabase = createClient();
      const formData = new FormData(event.currentTarget);

      if (step === "credentials") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        });

        if (signInError) {
          setErrorMessage(signInError.message);
          return;
        }

      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        setErrorMessage(userError?.message ?? "Unable to fetch admin account.");
        return;
      }

      const { data: admin_accountsRow, error: admin_accountsError } = await supabase
        .from("admin_accounts")
        .select("user_id")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (admin_accountsError || !admin_accountsRow) {
        const { error: signOutError } = await supabase.auth.signOut();
        setErrorMessage(
          signOutError
            ? `This account is not authorized for admin access. ${signOutError.message}`
            : "This account is not authorized for admin access."
        );
        return;
      }



        const { data: assurance, error: assuranceError } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

        if (assuranceError) {
          setErrorMessage(assuranceError.message);
          return;
        }

        if (assurance.currentLevel === "aal2") {
          router.replace("/admin-dashboard");
          router.refresh();
          return;
        }

        const { data: factors, error: factorsError } =
          await supabase.auth.mfa.listFactors();

        if (factorsError) {
          setErrorMessage(factorsError.message);
          return;
        }

        const verifiedFactor = factors.totp.find(
          (factor) => factor.status === "verified",
        );

        if (verifiedFactor) {
          setFactorId(verifiedFactor.id);
          setStep("verify");
          return;
        }

        for (const factor of factors.all) {
          if (
            factor.factor_type === "totp" &&
            factor.status === "unverified"
          ) {
            const { error: unenrollError } =
              await supabase.auth.mfa.unenroll({ factorId: factor.id });

            if (unenrollError) {
              setErrorMessage(unenrollError.message);
              return;
            }
          }
        }

        const { data: enrollment, error: enrollmentError } =
          await supabase.auth.mfa.enroll({
            factorType: "totp",
            friendlyName: "Admin authenticator",
          });

        if (enrollmentError) {
          setErrorMessage(enrollmentError.message);
          return;
        }

        setFactorId(enrollment.id);
        setQrCode(enrollment.totp.qr_code);
        setSecret(enrollment.totp.secret);
        setStep("enroll");
        return;
      }

      const code = String(formData.get("code") ?? "").trim();
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });

      if (challengeError) {
        setErrorMessage(challengeError.message);
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });

      if (verifyError) {
        setErrorMessage(verifyError.message);
        return;
      }

      const { data: assurance, error: assuranceError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (assuranceError) {
        setErrorMessage(assuranceError.message);
        return;
      }

      if (assurance.currentLevel !== "aal2") {
        setErrorMessage(
          "MFA verification did not establish the required admin session. Try again.",
        );
        return;
      }

      router.replace("/admin-dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to sign in securely.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {step === "credentials" ? (
        <>
          <FormField
            label="Admin email"
            id="admin-email"
            name="email"
            type="email"
            placeholder="admin@example.com"
            autoComplete="username"
            required
          />
          <FormField
            label="Password"
            id="admin-password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </>
      ) : (
        <>
          {step === "enroll" ? (
            <div className="space-y-3 text-sm text-neutral-600">
              <p>
                Scan this QR code with an authenticator app, then enter its
                current six-digit code.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCode}
                alt="QR code for admin authenticator setup"
                className="mx-auto h-48 w-48"
              />
              <p className="break-all">
                Manual setup key: <strong>{secret}</strong>
              </p>
            </div>
          ) : (
            <p className="text-sm text-neutral-600">
              Enter the six-digit code from your authenticator app to continue.
            </p>
          )}
          <FormField
            label="Authenticator code"
            id="admin-mfa-code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="123456"
            required
          />
        </>
      )}

      {errorMessage ? (
        <p role="alert" className="text-sm text-red-600">
          {errorMessage}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <Spinner className="h-4 w-4" />
            {step === "credentials"
              ? "Signing in..."
              : step === "enroll"
                ? "Setting up MFA..."
                : "Verifying..."}
          </span>
        ) : step === "credentials" ? (
          "Sign In as Admin"
        ) : step === "enroll" ? (
          "Enable MFA and Sign In"
        ) : (
          "Verify and Sign In"
        )}
      </Button>
    </form>
  );
}
