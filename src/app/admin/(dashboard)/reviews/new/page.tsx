import { ReviewForm } from "@/components/admin/ReviewForm";
import { prisma } from "@/lib/prisma";
import { createReview } from "../actions";

export default async function NewReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ candidateId?: string }>;
}) {
  const { candidateId } = await searchParams;
  const candidate = candidateId
    ? await prisma.productCandidate.findUnique({ where: { id: candidateId } })
    : null;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        New review
      </h1>
      <ReviewForm
        review={
          candidate
            ? {
                title: candidate.name,
                summary: candidate.description ?? "",
                body: candidate.description ?? "",
                price: candidate.price.toString(),
              }
            : undefined
        }
        candidateId={candidate?.id}
        action={createReview}
        submitLabel="Create review"
      />
    </main>
  );
}
