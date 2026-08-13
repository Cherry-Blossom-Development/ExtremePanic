import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "../actions";

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex w-full items-center justify-between border-b border-black/[.08] bg-zinc-50 px-6 py-3 dark:border-white/[.145] dark:bg-zinc-950">
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/admin/reviews" className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50">
            Reviews
          </Link>
          <Link
            href="/admin/reviews/new"
            className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            New review
          </Link>
          <Link href="/admin/candidates" className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50">
            Candidates
          </Link>
          <Link
            href="/admin/candidates/new"
            className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            New candidate
          </Link>
        </nav>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Log out
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}
