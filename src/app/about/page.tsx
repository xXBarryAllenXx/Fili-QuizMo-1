import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function About() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <section className="bg-primary text-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                About Us
              </h1>
              <p className="mt-6 text-lg text-white/80">
                Fili-QuizMo was created by a small team of developers who wanted
                to make learning more interactive, accessible, and fun.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold">Our Story</h2>
            <p className="mt-4 max-w-3xl text-lg text-neutral-600">
              What began as a simple quiz concept grew into Fili-QuizMo, a
              platform designed to help learners practice through interactive
              quizzes while giving educators tools to manage content and track
              progress.
            </p>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="mt-4 max-w-3xl text-lg text-neutral-600">
              To make learning engaging, measurable, and accessible through
              interactive quizzes that adapt to the needs of students and
              teachers.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
