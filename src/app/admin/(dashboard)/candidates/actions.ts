"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/adminAuth";

async function requireAdmin() {
  if (!(await isAdminAuthed())) {
    throw new Error("Not authorized");
  }
}

function readCandidateFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const purchaseUrl = String(formData.get("purchaseUrl") ?? "").trim();
  const price = Number(formData.get("price"));

  if (!name || !purchaseUrl) {
    throw new Error("Product name and purchase link are required.");
  }
  if (!(price >= 0)) {
    throw new Error("Price must be zero or greater.");
  }

  return { name, description, purchaseUrl, price };
}

function revalidateCandidatePaths() {
  revalidatePath("/admin/candidates");
}

export async function createCandidate(formData: FormData) {
  await requireAdmin();
  const data = readCandidateFields(formData);
  await prisma.productCandidate.create({ data });
  revalidateCandidatePaths();
  redirect("/admin/candidates");
}

export async function updateCandidate(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing candidate id.");
  const data = readCandidateFields(formData);
  await prisma.productCandidate.update({ where: { id }, data });
  revalidateCandidatePaths();
  redirect("/admin/candidates");
}

export async function deleteCandidate(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing candidate id.");
  await prisma.productCandidate.delete({ where: { id } });
  revalidateCandidatePaths();
  redirect("/admin/candidates");
}
