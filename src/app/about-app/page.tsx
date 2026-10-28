import { ButtonLink } from "@/components/ui/button-link";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function AboutApp() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <section className="bg-primary text-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                About the App
              </h1>
              <p className="mt-6 text-lg text-white/80">
                Fili-QuizMo is an interactive quiz platform that turns learning
                into a quiz-like experience.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold">What It Does</h2>
            <p className="mt-4 max-w-3xl text-lg text-neutral-600">
              It provides quizzes, progress tracking, and teacher
              management tools designed to make practice more effective.
            </p>

            <div className="mt-10">
              <ButtonLink
                href="/assets/Fili-QuizMo-1.0.0.apk"
                download
              >
                Download APK
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
