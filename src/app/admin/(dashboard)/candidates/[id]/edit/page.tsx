import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CandidateForm } from "@/components/admin/CandidateForm";
import { updateCandidate } from "../../actions";

export default async function EditCandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = await prisma.productCandidate.findUnique({ where: { id } });

  if (!candidate) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Edit candidate
      </h1>
      <CandidateForm
        candidate={{ ...candidate, price: candidate.price.toString() }}
        action={updateCandidate}
        submitLabel="Save changes"
      />
    </main>
  );
}
