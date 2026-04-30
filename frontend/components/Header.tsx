import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--line)] bg-[color:var(--paper)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/mentor-logo.svg"
            alt="MENTORstudio"
            width={48}
            height={48}
            priority
          />
          <span className="block text-lg font-semibold leading-none">MENTORstudio</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
          <Link href="/login" className="rounded-full px-4 py-2 transition hover:bg-[color:var(--paper)] hover:text-[color:var(--ink)]">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
