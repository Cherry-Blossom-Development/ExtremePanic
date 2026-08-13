type CandidateFormValues = {
  id?: string;
  name?: string;
  description?: string | null;
  purchaseUrl?: string;
  price?: number | string;
};

const inputClass =
  "w-full rounded-lg border border-black/[.08] bg-white px-4 py-2.5 text-base text-black outline-none focus:border-black/30 dark:border-white/[.145] dark:bg-black dark:text-white dark:focus:border-white/40";

export function CandidateForm({
  candidate,
  action,
  submitLabel,
}: {
  candidate?: CandidateFormValues;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-5">
      {candidate?.id && <input type="hidden" name="id" defaultValue={candidate.id} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Product name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={candidate?.name}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="description"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={candidate?.description ?? ""}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="purchaseUrl"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Where to buy it
        </label>
        <input
          id="purchaseUrl"
          name="purchaseUrl"
          type="url"
          required
          placeholder="https://..."
          defaultValue={candidate?.purchaseUrl}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="price" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Price (USD)
        </label>
        <input
          id="price"
          name="price"
          type="number"
          min={0}
          step="0.01"
          required
          defaultValue={candidate?.price?.toString()}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        className="flex h-12 w-fit items-center justify-center rounded-full bg-foreground px-6 text-base font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        {submitLabel}
      </button>
    </form>
  );
}
