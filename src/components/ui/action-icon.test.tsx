import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ActionIcon, navigationIcon, type ActionIconName } from "./action-icon";
import { PixelButton, Trash2 } from "./pixel-primitives";
import { Button } from "./button";
import { ButtonLink } from "./button-link";

vi.mock("@/components/pixel", () => ({
  NavLink: ({ children, ...props }: React.ComponentProps<"a">) => createElement("a", props, children),
}));

const icons: ActionIconName[] = [
  "LayoutDashboard", "UsersRound", "GraduationCap", "BookOpen", "ChartColumn", "Settings",
  "ArrowLeft", "ArrowRight", "House", "CirclePlus", "Eye", "EyeOff", "Pencil", "Trash2",
  "Send", "ClipboardCheck", "ClipboardList", "RefreshCw", "UserPlus", "Users", "UserMinus",
  "Save", "Check", "X", "Search", "ListFilter", "RotateCcw", "CheckCircle", "Download",
  "Upload", "Copy", "UserRound", "KeyRound", "LogOut", "LogIn", "ShieldCheck", "MessageSquare", "Trophy", "Ban",
];

describe("shared action icons", () => {
  it.each(icons)("renders %s as a decorative icon inheriting the text color", (name) => {
    const markup = renderToStaticMarkup(createElement(ActionIcon, { name, size: 14 }));
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain('focusable="false"');
    expect(markup).toContain('stroke="currentColor"');
    expect(markup).toContain('width="14" height="14"');
    expect(markup).not.toContain('d="undefined"');
  });

  it("places one compact icon before the unchanged button label without leaking icon props", () => {
    const markup = renderToStaticMarkup(createElement(PixelButton, { icon: "Save", size: "sm", type: "submit", disabled: true }, "Save"));
    expect(markup.match(/<svg/g)).toHaveLength(1);
    expect(markup.indexOf("<svg")).toBeLessThan(markup.indexOf(">Save<"));
    expect(markup).toContain('width="14"');
    expect(markup).toContain('type="submit"');
    expect(markup).toContain('disabled=""');
    expect(markup).not.toContain('icon="Save"');
  });

  it("preserves accessible icon-only buttons and never injects a second icon", () => {
    const markup = renderToStaticMarkup(createElement(PixelButton, { "aria-label": "Delete Account", variant: "danger" }, createElement(Trash2)));
    expect(markup.match(/<svg/g)).toHaveLength(1);
    expect(markup).toContain('aria-label="Delete Account"');
    expect(markup).toContain('width="16"');
  });

  it("forwards action icons through the regular button and link wrappers", () => {
    const button = renderToStaticMarkup(<Button icon="Check">Confirm</Button>);
    const link = renderToStaticMarkup(<ButtonLink icon="Download" href="/app.apk" download>Download APK</ButtonLink>);
    expect(button.match(/<svg/g)).toHaveLength(1);
    expect(link.match(/<svg/g)).toHaveLength(1);
    expect(link).toContain('href="/app.apk"');
    expect(link).toContain('download=""');
  });

  it("uses the requested navigation actions without changing labels or routes", () => {
    expect(navigationIcon("overview")).toBe("LayoutDashboard");
    expect(navigationIcon("classes")).toBe("UsersRound");
    expect(navigationIcon("students")).toBe("GraduationCap");
    expect(navigationIcon("quizzes")).toBe("BookOpen");
    expect(navigationIcon("profile")).toBe("UserRound");
    expect(navigationIcon("settings")).toBe("Settings");
  });
});
