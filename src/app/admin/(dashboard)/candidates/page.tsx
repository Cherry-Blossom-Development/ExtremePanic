import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteCandidate } from "./actions";
import { DeleteCandidateButton } from "@/components/admin/DeleteCandidateButton";

export const dynamic = "force-dynamic";

export default async function AdminCandidatesPage() {
  const candidates = await prisma.productCandidate.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Candidates
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Products worth considering, not yet purchased or reviewed. Internal only — nothing
        here is visible on the public site.
      </p>

      {candidates.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          No candidates yet.{" "}
          <Link href="/admin/candidates/new" className="underline">
            Add the first one
          </Link>
          .
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-black/[.08] dark:divide-white/[.145]">
          {candidates.map((candidate) => (
            <li key={candidate.id} className="flex items-center justify-between gap-4 py-4">
              <div className="flex flex-col gap-1">
                <span className="text-base font-medium text-black dark:text-zinc-50">
                  {candidate.name}
                </span>
                <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <span>${Number(candidate.price).toFixed(2)}</span>
                  <a href={candidate.purchaseUrl} target="_blank" rel="noopener noreferrer" className="underline">
                    Buy link
                  </a>
                  <span>
                    Added{" "}
                    {candidate.createdAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={`/admin/reviews/new?candidateId=${candidate.id}`}
                  className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Promote to review
                </Link>
                <Link
                  href={`/admin/candidates/${candidate.id}/edit`}
                  className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Edit
                </Link>
                <DeleteCandidateButton
                  id={candidate.id}
                  name={candidate.name}
                  action={deleteCandidate}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
