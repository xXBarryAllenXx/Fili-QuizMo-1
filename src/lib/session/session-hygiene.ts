export const SESSION_EXPIRED_EVENT = "fili-quizmo:session-expired";
export const TRANSIENT_INPUTS_RESET_EVENT = "fili-quizmo:reset-transient-inputs";
export { getDashboardResetUrl } from "./dashboard-url";

type Router = {
  replace: (href: string) => void;
  refresh: () => void;
};

export function dispatchSessionExpired(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
}

export function clearPageInputs(): void {
  if (typeof document === "undefined") {
    return;
  }

  for (const form of Array.from(document.forms)) {
    form.reset();
  }

  for (const input of Array.from(document.querySelectorAll("input"))) {
    if (["button", "image", "reset", "submit"].includes(input.type)) {
      continue;
    }

    if (input.type === "checkbox" || input.type === "radio") {
      input.checked = false;
    } else {
      input.value = "";
    }
  }

  for (const textarea of Array.from(document.querySelectorAll("textarea"))) {
    textarea.value = "";
  }

  for (const select of Array.from(document.querySelectorAll("select"))) {
    select.selectedIndex = -1;
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(TRANSIENT_INPUTS_RESET_EVENT));
  }
}

export async function logoutAndRedirect(
  router: Router,
  loginRoute: string,
): Promise<void> {
  const { createClient } = await import("@/lib/supabase/client");
  const { error } = await createClient().auth.signOut();

  if (error) {
    throw error;
  }

  clearPageInputs();
  router.replace(loginRoute);
  router.refresh();
}
