type ReviewFormValues = {
  id?: string;
  title?: string;
  slug?: string;
  summary?: string;
  body?: string;
  rating?: number;
  price?: number | string;
  imageUrl?: string | null;
  published?: boolean;
};

const inputClass =
  "w-full rounded-lg border border-black/[.08] bg-white px-4 py-2.5 text-base text-black outline-none focus:border-black/30 dark:border-white/[.145] dark:bg-black dark:text-white dark:focus:border-white/40";

export function ReviewForm({
  review,
  action,
  submitLabel,
}: {
  review?: ReviewFormValues;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-5">
      {review?.id && <input type="hidden" name="id" defaultValue={review.id} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={review?.title}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="slug" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Slug (URL) — leave blank to generate from the title
        </label>
        <input id="slug" name="slug" defaultValue={review?.slug} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="summary" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Summary — shown in listings
        </label>
        <input
          id="summary"
          name="summary"
          required
          defaultValue={review?.summary}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="body" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Full review
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={8}
          defaultValue={review?.body}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="rating" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Rating (1-5)
          </label>
          <input
            id="rating"
            name="rating"
            type="number"
            min={1}
            max={5}
            required
            defaultValue={review?.rating ?? 5}
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
            defaultValue={review?.price?.toString()}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="imageFile" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Image
        </label>
        {review?.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.imageUrl}
            alt=""
            className="h-32 w-32 rounded-lg object-cover"
          />
        )}
        <input
          id="imageFile"
          name="imageFile"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className={`${inputClass} file:mr-4 file:rounded-full file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-medium dark:file:bg-zinc-800 dark:file:text-zinc-50`}
        />
        <label htmlFor="imageUrl" className="text-xs text-zinc-500 dark:text-zinc-400">
          Or paste an image URL instead — ignored if a file is uploaded above
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          defaultValue={review?.imageUrl ?? ""}
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          name="published"
          defaultChecked={review?.published ?? false}
          className="h-4 w-4"
        />
        Published (visible on the site)
      </label>

      <button
        type="submit"
        className="flex h-12 w-fit items-center justify-center rounded-full bg-foreground px-6 text-base font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        {submitLabel}
      </button>
    </form>
  );
}
