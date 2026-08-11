import { SquareClient, SquareEnvironment } from "square";

const globalForSquare = globalThis as unknown as {
  square: SquareClient | undefined;
};

function client() {
  if (globalForSquare.square) return globalForSquare.square;

  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) throw new Error("SQUARE_ACCESS_TOKEN is not set.");

  const square = new SquareClient({
    token,
    environment:
      process.env.SQUARE_ENVIRONMENT === "production"
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
  });

  if (process.env.NODE_ENV !== "production") globalForSquare.square = square;
  return square;
}

export async function createPaymentLink({
  idempotencyKey,
  title,
  priceCents,
  redirectUrl,
}: {
  idempotencyKey: string;
  title: string;
  priceCents: number;
  redirectUrl: string;
}) {
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!locationId) throw new Error("SQUARE_LOCATION_ID is not set.");

  const { paymentLink } = await client().checkout.paymentLinks.create({
    idempotencyKey,
    quickPay: {
      name: title,
      priceMoney: { amount: BigInt(priceCents), currency: "USD" },
      locationId,
    },
    checkoutOptions: {
      redirectUrl,
      askForShippingAddress: true,
    },
  });

  if (!paymentLink?.url || !paymentLink.id || !paymentLink.orderId) {
    throw new Error("Square did not return a complete payment link.");
  }

  return {
    url: paymentLink.url,
    paymentLinkId: paymentLink.id,
    squareOrderId: paymentLink.orderId,
  };
}
