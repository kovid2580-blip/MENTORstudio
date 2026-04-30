import { Header } from "@/components/Header";
import { SessionWorkspace } from "@/components/SessionWorkspace";

type SessionPageProps = {
  params: {
    sessionId: string;
  };
};

export default function SessionPage({ params }: SessionPageProps) {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--accent-deep)]">
            Session room
          </p>
          <h1 className="mt-3 text-4xl font-semibold">{params.sessionId}</h1>
        </div>

        <SessionWorkspace sessionId={params.sessionId} />
      </div>
    </main>
  );
}
