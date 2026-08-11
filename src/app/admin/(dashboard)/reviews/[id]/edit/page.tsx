import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReviewForm } from "@/components/admin/ReviewForm";
import { updateReview } from "../../actions";

export default async function EditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const review = await prisma.review.findUnique({ where: { id } });

  if (!review) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Edit review
      </h1>
      <ReviewForm
        review={{ ...review, price: review.price.toString() }}
        action={updateReview}
        submitLabel="Save changes"
      />
    </main>
  );
}
