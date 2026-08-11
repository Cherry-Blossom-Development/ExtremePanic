import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { stars } from "@/lib/stars";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Reviews
      </h1>

      {reviews.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          Nothing published yet — check back soon.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-black/[.08] dark:divide-white/[.145]">
          {reviews.map((review) => (
            <li key={review.id} className="py-6">
              <Link href={`/reviews/${review.slug}`} className="flex gap-4">
                {review.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.imageUrl}
                    alt=""
                    className="h-20 w-20 flex-none rounded-lg object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="text-xl font-medium text-black dark:text-zinc-50">
                      {review.title}
                    </h2>
                    <span className="whitespace-nowrap text-base font-medium text-zinc-700 dark:text-zinc-300">
                      ${Number(review.price).toFixed(2)}
                    </span>
                  </div>
                  <span className="text-amber-500" aria-label={`${review.rating} out of 5 stars`}>
                    {stars(review.rating)}
                  </span>
                  <p className="text-zinc-600 dark:text-zinc-400">{review.summary}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
