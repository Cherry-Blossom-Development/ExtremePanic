"use server";

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createPaymentLink } from "@/lib/square";

export async function checkout(formData: FormData) {
  const reviewId = String(formData.get("reviewId") ?? "");
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review || !review.published) {
    notFound();
  }

  const order = await prisma.order.create({
    data: { reviewId: review.id, amount: review.price },
  });

  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

  let link;
  try {
    link = await createPaymentLink({
      idempotencyKey: order.id,
      title: review.title,
      priceCents: Math.round(Number(review.price) * 100),
      redirectUrl: `${siteUrl}/reviews/${review.slug}/thank-you`,
    });
  } catch (err) {
    await prisma.order.delete({ where: { id: order.id } });
    throw err;
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      squareOrderId: link.squareOrderId,
      squarePaymentLinkId: link.paymentLinkId,
    },
  });

  redirect(link.url);
}
