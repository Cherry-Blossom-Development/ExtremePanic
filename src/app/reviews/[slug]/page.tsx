import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stars } from "@/lib/stars";

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
      <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">{review.body}</p>
    </main>
  );
}
