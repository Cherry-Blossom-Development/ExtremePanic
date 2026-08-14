"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/adminAuth";
import { uploadReviewMedia, deleteS3Object, keyFromS3Url } from "@/lib/s3";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB
const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function requireAdmin() {
  if (!(await isAdminAuthed())) {
    throw new Error("Not authorized");
  }
}

// A Blob/File coming out of a Server Action's FormData -- checked by shape
// rather than `instanceof File`, which can fail across the module/realm
// boundaries a bundled Node server introduces.
function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    typeof (value as { arrayBuffer?: unknown }).arrayBuffer === "function" &&
    "size" in value
  );
}

// Uploads the file from `fileField` if one was chosen, falling back to the
// manually-typed `urlField` otherwise. Shared by the image and video inputs.
async function resolveMediaUrl(
  formData: FormData,
  slug: string,
  {
    fileField,
    urlField,
    allowedTypes,
    maxBytes,
    label,
  }: {
    fileField: string;
    urlField: string;
    allowedTypes: Record<string, string>;
    maxBytes: number;
    label: string;
  },
) {
  const file = formData.get(fileField);
  const manualUrl = String(formData.get(urlField) ?? "").trim() || null;

  if (!isUploadedFile(file) || file.size === 0) {
    return manualUrl;
  }

  const ext = allowedTypes[file.type];
  if (!ext) {
    throw new Error(`${label} type is not supported.`);
  }
  if (file.size > maxBytes) {
    throw new Error(`${label} must be ${Math.floor(maxBytes / (1024 * 1024))}MB or smaller.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `reviews/${slug}-${Date.now()}${ext}`;
  return uploadReviewMedia({ buffer, key, contentType: file.type });
}

// Best-effort cleanup -- never blocks the review write on an S3 hiccup.
async function deleteOldMediaIfOurs(oldUrl: string | null, newUrl: string | null) {
  if (!oldUrl || oldUrl === newUrl) return;
  const key = keyFromS3Url(oldUrl);
  if (!key) return;
  try {
    await deleteS3Object(key);
  } catch (err) {
    console.error("Failed to delete old review media from S3:", err);
  }
}

async function readReviewFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugify(rawSlug || title);
  const summary = String(formData.get("summary") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const rating = Number(formData.get("rating"));
  const price = Number(formData.get("price"));
  const published = formData.get("published") === "on";

  if (!title || !slug || !summary || !body) {
    throw new Error("Title, slug, summary, and body are required.");
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be a whole number from 1 to 5.");
  }
  if (!(price >= 0)) {
    throw new Error("Price must be zero or greater.");
  }

  const imageUrl = await resolveMediaUrl(formData, slug, {
    fileField: "imageFile",
    urlField: "imageUrl",
    allowedTypes: ALLOWED_IMAGE_TYPES,
    maxBytes: MAX_IMAGE_BYTES,
    label: "Image",
  });
  const videoUrl = await resolveMediaUrl(formData, slug, {
    fileField: "videoFile",
    urlField: "videoUrl",
    allowedTypes: ALLOWED_VIDEO_TYPES,
    maxBytes: MAX_VIDEO_BYTES,
    label: "Video",
  });

  return { title, slug, summary, body, rating, price, imageUrl, videoUrl, published };
}

function revalidateReviewPaths() {
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  revalidatePath("/");
}

export async function createReview(formData: FormData) {
  await requireAdmin();
  const data = await readReviewFields(formData);
  await prisma.review.create({ data });

  // If this review was created via "Promote to review" from a candidate,
  // that candidate has graduated -- it's no longer just under consideration.
  const candidateId = String(formData.get("candidateId") ?? "");
  if (candidateId) {
    try {
      await prisma.productCandidate.delete({ where: { id: candidateId } });
      revalidatePath("/admin/candidates");
    } catch (err) {
      console.error("Failed to delete promoted candidate:", err);
    }
  }

  revalidateReviewPaths();
  redirect("/admin/reviews");
}

export async function updateReview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing review id.");
  const existing = await prisma.review.findUnique({ where: { id } });
  const data = await readReviewFields(formData);
  await prisma.review.update({ where: { id }, data });
  await deleteOldMediaIfOurs(existing?.imageUrl ?? null, data.imageUrl);
  await deleteOldMediaIfOurs(existing?.videoUrl ?? null, data.videoUrl);
  revalidateReviewPaths();
  redirect("/admin/reviews");
}

export async function deleteReview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing review id.");
  const existing = await prisma.review.findUnique({ where: { id } });
  await prisma.review.delete({ where: { id } });
  await deleteOldMediaIfOurs(existing?.imageUrl ?? null, null);
  await deleteOldMediaIfOurs(existing?.videoUrl ?? null, null);
  revalidateReviewPaths();
  redirect("/admin/reviews");
}

export async function togglePublished(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const published = formData.get("published") === "true";
  if (!id) throw new Error("Missing review id.");
  await prisma.review.update({ where: { id }, data: { published: !published } });
  revalidateReviewPaths();
}
