import Link from "next/link";
import { SubscribeForm } from "@/components/SubscribeForm";
import { prisma } from "@/lib/prisma";
import { stars } from "@/lib/stars";

export const dynamic = "force-dynamic";

export default async function Home() {
  const latestReviews = await prisma.review.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center gap-16 px-6 py-24">
        <div className="flex flex-col items-center gap-6 pt-8 text-center">
          <span className="text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Coming soon
          </span>
          <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-black sm:text-5xl dark:text-zinc-50">
            Extreme Panic
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Honest, hands-on reviews of the low-effort products everyone&apos;s
            buying — one unit purchased, photographed, and reviewed at a time.
          </p>
          <SubscribeForm />
        </div>

        {latestReviews.length > 0 && (
          <div className="flex w-full max-w-xl flex-col gap-4">
            <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Latest reviews
            </h2>
            <ul className="flex flex-col divide-y divide-black/[.08] dark:divide-white/[.145]">
              {latestReviews.map((review) => (
                <li key={review.id} className="py-4">
                  <Link href={`/reviews/${review.slug}`} className="flex flex-col gap-1">
                    <span className="text-base font-medium text-black dark:text-zinc-50">
                      {review.title}
                    </span>
                    <span className="text-amber-500 text-sm" aria-label={`${review.rating} out of 5 stars`}>
                      {stars(review.rating)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/reviews"
              className="text-sm font-medium text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              See all reviews →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
