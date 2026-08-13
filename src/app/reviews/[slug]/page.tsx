import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stars } from "@/lib/stars";
import { checkout } from "./actions";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const review = await prisma.review.findUnique({ where: { slug } });

  if (!review || !review.published) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      {review.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={review.imageUrl}
          alt={review.title}
          className="w-full rounded-xl object-cover"
        />
      )}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          {review.title}
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-amber-500" aria-label={`${review.rating} out of 5 stars`}>
            {stars(review.rating)}
          </span>
          <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
            ${Number(review.price).toFixed(2)}
          </span>
        </div>
      </div>
      <form action={checkout}>
        <input type="hidden" name="reviewId" defaultValue={review.id} />
        <button
          type="submit"
          className="flex h-12 w-fit items-center justify-center rounded-full bg-foreground px-6 text-base font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Buy — ${Number(review.price).toFixed(2)}
        </button>
      </form>
      <div className="flex flex-col gap-4">
        {review.body
          .split(/\n\s*\n/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean)
          .map((paragraph, index) => (
            <p key={index} className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              {paragraph}
            </p>
          ))}
      </div>
    </main>
  );
}
