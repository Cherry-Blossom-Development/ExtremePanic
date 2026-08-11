import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { stars } from "@/lib/stars";
import { togglePublished, deleteReview } from "./actions";
import { DeleteReviewButton } from "@/components/admin/DeleteReviewButton";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Reviews
      </h1>

      {reviews.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          No reviews yet.{" "}
          <Link href="/admin/reviews/new" className="underline">
            Create the first one
          </Link>
          .
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-black/[.08] dark:divide-white/[.145]">
          {reviews.map((review) => (
            <li key={review.id} className="flex items-center justify-between gap-4 py-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-medium text-black dark:text-zinc-50">
                    {review.title}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      review.published
                        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {review.published ? "Published" : "Draft"}
                  </span>
                </div>
                <span className="text-amber-500 text-sm">{stars(review.rating)}</span>
              </div>
              <div className="flex items-center gap-4">
                <form action={togglePublished}>
                  <input type="hidden" name="id" defaultValue={review.id} />
                  <input
                    type="hidden"
                    name="published"
                    defaultValue={review.published ? "true" : "false"}
                  />
                  <button
                    type="submit"
                    className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    {review.published ? "Unpublish" : "Publish"}
                  </button>
                </form>
                <Link
                  href={`/admin/reviews/${review.id}/edit`}
                  className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Edit
                </Link>
                <DeleteReviewButton id={review.id} title={review.title} action={deleteReview} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
