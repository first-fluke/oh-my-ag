import { BookOpen, Github } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-15rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[#B23A34]/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-6rem] h-72 w-72 rounded-full bg-[#7f2824]/20 blur-3xl" />
      </div>

      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-4 py-12 text-center">
        <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-[#B23A34] text-zinc-50 shadow-[0_0_34px_rgba(178,58,52,0.5)]">
          <BookOpen className="size-8" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-zinc-50 sm:text-5xl">
          oh-my-ag (Oh My Antigravity)
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-base text-zinc-300 sm:text-lg">
          Multi-agent orchestration for Antigravity with skill routing, parallel
          execution, and Serena memory-driven coordination.
        </p>

        <div className="mt-8 w-full overflow-hidden rounded-2xl border border-white/15 bg-black/35 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          <video
            className="h-auto w-full"
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
          >
            <source src="oh-my-ag.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-[#B23A34] text-zinc-50 hover:bg-[#9f342e]"
          >
            <a
              href="https://github.com/first-fluke/oh-my-ag"
              target="_blank"
              rel="noreferrer"
            >
              <Github className="size-4" />
              GitHub
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/20 bg-zinc-900/70 text-zinc-100 hover:bg-zinc-800"
          >
            <Link href="/en/getting-started/introduction">Documentation</Link>
          </Button>
        </div>

        <p className="mt-6 text-xs tracking-[0.3em] text-zinc-500">
          MAKE ENGINEER GREAT AGAIN
        </p>
      </section>
    </main>
  );
}
