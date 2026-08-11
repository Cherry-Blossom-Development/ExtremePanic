import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="flex w-full items-center justify-between border-b border-black/[.08] px-6 py-4 dark:border-white/[.145]">
      <Link href="/" className="text-lg font-semibold tracking-tight text-black dark:text-zinc-50">
        Extreme Panic
      </Link>
      <nav>
        <Link
          href="/reviews"
          className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Reviews
        </Link>
      </nav>
    </header>
  );
}
