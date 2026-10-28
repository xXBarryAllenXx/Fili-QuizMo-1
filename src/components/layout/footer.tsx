import Link from "next/link";

export function Footer() {
  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/about-app", label: "About the App" },
    { href: "/signup", label: "Sign Up" },
  ];

  const accountLinks = [
    { href: "/teacher-login", label: "Teacher Login" },
    { href: "/admin-login", label: "Admin Login" },
  ];

  return (
    <footer className="w-full bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h2 className="text-2xl font-bold">Fili-QuizMo</h2>
            <p className="mt-4 text-sm text-primary-foreground/80">
              An interactive quiz platform built for learners, teachers, and
              admins.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
              Accounts
            </h3>
            <ul className="mt-4 space-y-2">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-primary-foreground/70">
          © 2026 Fili-QuizMo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
