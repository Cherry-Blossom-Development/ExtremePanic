"use server";

import { redirect } from "next/navigation";
import { clearAdminSession } from "@/lib/adminAuth";

export async function logout() {
  await clearAdminSession();
  redirect("/admin/login");
}
