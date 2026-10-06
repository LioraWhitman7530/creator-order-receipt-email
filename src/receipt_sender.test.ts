import assert from "node:assert/strict";
import { buildReceipt, orderSchema } from "./receipt_sender.js";
const order = orderSchema.parse({orderId:"ord-7", buyerEmail:"reader@example.com", buyerName:"Reader", assetTitle:"RAG Patterns", downloadUrl:"https://example.com/rag", amountCents:2500, subscriberUpdate:"Sent release note"});
const receipt = buildReceipt(order);
assert.equal(receipt.to, "reader@example.com");
assert.match(receipt.html, /\$25\.00/);
assert.match(receipt.html, /Download your purchase/);
console.log("receipt decision test passed");
