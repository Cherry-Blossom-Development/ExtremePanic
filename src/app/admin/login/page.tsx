import { login } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-24">
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Admin login
      </h1>
      <form action={login} className="flex flex-col gap-3">
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="h-12 rounded-full border border-black/[.08] bg-white px-5 text-base text-black outline-none focus:border-black/30 dark:border-white/[.145] dark:bg-black dark:text-white dark:focus:border-white/40"
        />
        <button
          type="submit"
          className="flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-base font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Log in
        </button>
        {error && <p className="text-sm text-red-600 dark:text-red-400">Wrong password.</p>}
      </form>
    </main>
  );
}
