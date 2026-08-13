"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/adminAuth";
import { uploadReviewImage, deleteS3Object, keyFromS3Url } from "@/lib/s3";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
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

// Uploads the file from the "imageFile" field if one was chosen, falling
// back to the manually-typed "imageUrl" field otherwise.
async function resolveImageUrl(formData: FormData, slug: string) {
  const file = formData.get("imageFile");
  const manualUrl = String(formData.get("imageUrl") ?? "").trim() || null;

  if (!isUploadedFile(file) || file.size === 0) {
    return manualUrl;
  }

  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) {
    throw new Error("Image must be a JPEG, PNG, GIF, or WebP file.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 5MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `reviews/${slug}-${Date.now()}${ext}`;
  return uploadReviewImage({ buffer, key, contentType: file.type });
}

// Best-effort cleanup -- never blocks the review write on an S3 hiccup.
async function deleteOldImageIfOurs(oldImageUrl: string | null, newImageUrl: string | null) {
  if (!oldImageUrl || oldImageUrl === newImageUrl) return;
  const key = keyFromS3Url(oldImageUrl);
  if (!key) return;
  try {
    await deleteS3Object(key);
  } catch (err) {
    console.error("Failed to delete old review image from S3:", err);
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

  const imageUrl = await resolveImageUrl(formData, slug);

  return { title, slug, summary, body, rating, price, imageUrl, published };
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
  await deleteOldImageIfOurs(existing?.imageUrl ?? null, data.imageUrl);
  revalidateReviewPaths();
  redirect("/admin/reviews");
}

export async function deleteReview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing review id.");
  const existing = await prisma.review.findUnique({ where: { id } });
  await prisma.review.delete({ where: { id } });
  await deleteOldImageIfOurs(existing?.imageUrl ?? null, null);
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
