import { ReviewForm } from "@/components/admin/ReviewForm";
import { createReview } from "../actions";

export default function NewReviewPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        New review
      </h1>
      <ReviewForm action={createReview} submitLabel="Create review" />
    </main>
  );
}
