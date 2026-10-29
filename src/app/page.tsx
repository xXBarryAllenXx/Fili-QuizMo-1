import { ButtonLink } from "@/components/ui/button-link";
import { Carousel } from "@/components/ui/carousel";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

const carouselItems = [
  {
    src: "/assets/home_screen.jpg",
    alt: "Fili-QuizMo home screen",
    caption: "Create or join quizzes with generated code",
  },
  {
    src: "/assets/fill_in_the_blanks.jpg",
    alt: "Fili-QuizMo fill in the blanks quiz",
    caption: "Fill in the blanks with your filipino knowledge",
  },
  {
    src: "/assets/true_false_quiz.jpg",
    alt: "Fili-QuizMo true or false quiz",
    caption: "Test your knowledge with true or false questions",
  },
  {
    src: "/assets/role_select.jpg",
    alt: "Fili-QuizMo role selection",
    caption: "Students can join quizzes while teachers can create and join quizzes",
  },
];

const developers = [
  {
    src: "/assets/docu.jpg",
    name: "Edrian Sarte",
    role: "Documentation",
  },
  {
    src: "/assets/leader.jpg",
    name: "Allen Joseph Cabatingan",
    role: "Leader",
  },
  {
    src: "/assets/web-dev.jpg",
    name: "John Carl Rubio",
    role: "Web Developer",
  },
  {
    src: "/assets/Default_pfp.jpg",
    name: "Sheen Agustin",
    role: "Mobile App Developer",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <section className="bg-primary text-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Learn. Quiz. Master.
              </h1>
              <p className="mt-6 text-lg text-white/80">
                Fili-QuizMo turns learning into an interactive quiz experience.
                Built for students who want a fun and engaging way to answer quizzes.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <ButtonLink
                  href="/signup"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Get Started
                </ButtonLink>
                <ButtonLink
                  href="/assets/Fili-QuizMo-1.0.0.apk"
                  download
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Download APK
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold">About the App</h2>
            <p className="mt-4 max-w-3xl text-lg text-neutral-600">
              Fili-QuizMo is a quiz-based learning platform that helps users
              practice with interactive quizzes, track performance, and prepare
              effectively. It is designed for learners who want immediate feedback
              and for teachers who need tools to manage quizzes and student
              progress.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <h2 className="text-3xl font-bold">See the App in Action</h2>
              <p className="mt-3 text-neutral-600">
                Take a quick tour through the quiz experience, from choosing a
                mode to answering your first question.
              </p>
            </div>
            <Carousel items={carouselItems} />
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold">About the Developers</h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {developers.map((developer) => (
                <div
                  key={developer.name}
                  className="text-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={developer.src}
                    alt={developer.name}
                    className="mx-auto h-32 w-32 rounded-full object-cover"
                  />
                  <h3 className="mt-4 text-lg font-semibold">
                    {developer.name}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {developer.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
