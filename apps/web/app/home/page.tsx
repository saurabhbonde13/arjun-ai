import AnimatedBackground from "../components/AnimatedBackground";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />

      <section className="section min-h-[85vh] flex flex-col justify-center items-center text-center relative z-10">
        <div className="container">
          <h1 className="h1 max-w-4xl mx-auto text-white">
            Build production-ready apps from a single prompt
          </h1>

          <p className="lead mt-6 max-w-2xl mx-auto text-zinc-400">
            Describe your idea. ArjunAI assembles frontend, backend, and deployment — in minutes.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <a
              href="/"
              className="inline-flex items-center rounded-full bg-brand px-8 py-3 font-semibold text-zinc-900 hover:opacity-90 transition"
            >
              Start Building
            </a>
            <a
              href="/demo"
              className="inline-flex items-center rounded-full px-8 py-3 ring-1 ring-white/20 hover:bg-white/5 transition"
            >
              Watch Demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
