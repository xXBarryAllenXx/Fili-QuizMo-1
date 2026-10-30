import Link from "next/link";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/#about-app", label: "About the App" },
  { href: "/#about", label: "About Us" },
  { href: "/#developers", label: "Developers" },
];

const accountLinks = [
  { href: "/signup", label: "Create Account" },
  { href: "/teacher-login", label: "Login" },
];

export function Footer() {
  return (
    <footer className="relative w-full bg-primary text-primary-foreground">
      <div
        aria-hidden="true"
        className="h-px w-full bg-gradient-to-r from-sky-400/60 via-emerald-400/50 to-amber-300/60"
      />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="max-w-sm">
            <div className="inline-flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/Fili-QuizMo Logo.png"
                alt=""
                className="h-9 w-9 rounded-lg object-cover ring-1 ring-white/20"
              />
              <span className="text-xl font-bold tracking-tight">
                Fili-QuizMo
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-primary-foreground/75">
              An interactive quiz platform built for learners, and teachers.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/75 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
              Account
            </h3>
            <ul className="mt-4 space-y-2.5">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/75 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-primary-foreground/60 sm:flex-row">
          <p>© 2026 Fili-QuizMo. All rights reserved.</p>
          <p>Built for learners and educators.</p>
        </div>
      </div>
    </footer>
  );
}
