import Link from "next/link";
import { Header } from "@/components/Header";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <section className="mx-auto flex max-w-6xl items-center justify-center px-6 py-24">
        <div className="w-full max-w-xl rounded-3xl border border-[color:var(--line)] bg-[color:var(--paper)] p-10 text-center shadow-[var(--shadow)]">
          <h1 className="text-3xl font-semibold">MENTORstudio</h1>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/login"
              className="rounded-full border border-black bg-black px-6 py-3 text-sm font-semibold text-white"
            >
              Login
            </Link>
            <Link
              href="/session/demo-room"
              className="rounded-full border border-[color:var(--line)] px-6 py-3 text-sm font-semibold"
            >
              Open Session
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
