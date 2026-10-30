import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionLifecycle } from "@/components/session/session-lifecycle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fili-QuizMo",
  description: "Fili-QuizMo is an interactive quiz platform for learners and educators.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionLifecycle />
        {children}
      </body>
    </html>
  );
}
