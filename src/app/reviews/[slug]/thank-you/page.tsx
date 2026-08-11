import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Thanks for your order
      </h1>
      <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        We&apos;ve received your order and it&apos;s being processed. You&apos;ll get a
        confirmation from Square once payment settles.
      </p>
      <Link
        href="/reviews"
        className="text-base font-medium text-black underline underline-offset-4 dark:text-zinc-50"
      >
        Back to reviews
      </Link>
    </main>
  );
}
