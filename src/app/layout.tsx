import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const pressStart = localFont({
  src: "../../public/assets/PressStart2P.ttf",
  variable: "--font-press-start",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

export const metadata: Metadata = {
  title: "Fili-QuizMo",
  description: "Fili-QuizMo is an interactive quiz platform for learners and educators.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${pressStart.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <svg aria-hidden="true" className="pointer-events-none absolute h-0 w-0">
          <filter
            id="remove-logo-background"
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      -0.85 -2.86 -0.29 0 3.4"
            />
          </filter>
        </svg>
        {children}
      </body>
    </html>
  );
}
