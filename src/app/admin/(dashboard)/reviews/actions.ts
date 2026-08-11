"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/adminAuth";

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

function readReviewFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const slug = slugify(rawSlug || title);
  const summary = String(formData.get("summary") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const rating = Number(formData.get("rating"));
  const price = Number(formData.get("price"));
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
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

  return { title, slug, summary, body, rating, price, imageUrl, published };
}

function revalidateReviewPaths() {
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  revalidatePath("/");
}

export async function createReview(formData: FormData) {
  await requireAdmin();
  const data = readReviewFields(formData);
  await prisma.review.create({ data });
  revalidateReviewPaths();
  redirect("/admin/reviews");
}

export async function updateReview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing review id.");
  const data = readReviewFields(formData);
  await prisma.review.update({ where: { id }, data });
  revalidateReviewPaths();
  redirect("/admin/reviews");
}

export async function deleteReview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing review id.");
  await prisma.review.delete({ where: { id } });
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
