import { z } from "zod";
import { infrai, type SendResult } from "./infrai.js";

export const orderSchema = z.object({
  orderId: z.string().min(1),
  buyerEmail: z.string().email(),
  buyerName: z.string().min(1),
  assetTitle: z.string().min(1),
  downloadUrl: z.string().url(),
  amountCents: z.number().int().nonnegative(),
  subscriberUpdate: z.string().min(1)
});
export type Order = z.infer<typeof orderSchema>;

export function buildReceipt(order: Order) {
  return {to: order.buyerEmail, subject: `Receipt for ${order.assetTitle}`, html:`<h1>Thanks, ${order.buyerName}</h1><p>Your digital asset <strong>${order.assetTitle}</strong> is ready.</p><p><a href="${order.downloadUrl}">Download your purchase</a></p><p>Total: $${(order.amountCents / 100).toFixed(2)}</p>`};
}

export async function processOrder(input: unknown): Promise<{messageId:string; subscriberNote:string}> {
  const order = orderSchema.parse(input);
  const sent: SendResult = await infrai.email.send(buildReceipt(order), `receipt-${order.orderId}`);
  return {messageId: sent.message_id, subscriberNote:`Subscriber update queued: ${order.subscriberUpdate}`};
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const to = process.env.DEMO_EMAIL_TO;
  if (!to) throw new Error("Set DEMO_EMAIL_TO to run the demo");
  const result = await processOrder({orderId:`demo-${Date.now()}`, buyerEmail:to, buyerName:"Creator customer", assetTitle:"Field Notes PDF", downloadUrl:"https://example.com/download/field-notes", amountCents:1900, subscriberUpdate:"Customer received the new release"});
  console.log(result);
}
