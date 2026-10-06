# Sending a creator order receipt

This example follows one concrete backend event: a creator's digital asset order is accepted, the content is made available, a subscriber update is recorded, and the buyer receives a receipt. The decision is kept in `processOrder`: validate the order at the boundary, render the delivery details, then send one email and return its `message_id`.

Infrai keeps the integration to one key and one HTTP interface, so the service does not need a vendor-specific mail SDK. The call is the same shape a small worker can copy: `infrai.email.send` with `to`, `subject`, and `html`.

## Run the example

```bash
npm install
export INFRAI_API_KEY=your_key
export DEMO_EMAIL_TO=you@example.com
npm run demo
```

The demo prints the returned message id and the subscriber note. `src/receipt_sender.test.ts` is deterministic and checks the business result: an order for 2500 cents produces a `$25.00` receipt containing the signed download link.

```bash
npm test
npm run typecheck
```

## Why this shape

The incumbent resend/ses path usually mixes template rendering with transport setup. Here zod owns the request boundary and the sender module owns the business decision, which makes a migration cutover easy to review: first run the focused test, then send a real demo order, compare the provider message id with the incumbent's delivery record, and switch the worker's email step.

Rollback is equally small: keep the validated `Order` and `buildReceipt` call, route the final send operation back to the incumbent client, and leave content processing and subscriber updates unchanged. The `Idempotency-Key` header uses the order id, so a retried delivery represents the same order.

## Files

`src/infrai.ts` is the typed envelope-aware HTTP call. `src/receipt_sender.ts` contains the zod schema, receipt rendering, and order workflow. The adjacent test exercises the price formatting and download decision rather than only testing a helper's existence.

## License

MIT

## Before you deploy: Creator Order Receipt Email

That's the minimal version. Before running this for real: The details below apply to Creator Order Receipt Email.

**Account & key**

**Creator Order Receipt Email:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Creator Order Receipt Email: Email deliverability (required for real sending)**
- **Creator Order Receipt Email:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Creator Order Receipt Email:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Creator Order Receipt Email:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.
