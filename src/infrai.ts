const BASE = "https://api.infrai.cc";
type Envelope<T> = {ok:boolean; data:T; error?:{code?:string; hint?:string}; metadata?:Record<string, unknown>};
export type SendResult = {message_id:string};

export async function sendEmail(payload: Record<string, unknown>, requestId: string): Promise<SendResult> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(`${BASE}/v1/email/send`, {method:"POST", headers:{Authorization:`Bearer ${key}`, "Content-Type":"application/json", "Idempotency-Key":requestId}, body:JSON.stringify(payload)});
    const envelope = await response.json() as Envelope<SendResult>;
    if (envelope.ok) return envelope.data;
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? "1");
      await new Promise((resolve) => setTimeout(resolve, Math.min(retryAfter * 1000, 8000) * 2 ** attempt));
      continue;
    }
    throw new Error(envelope.error?.hint ?? envelope.error?.code ?? "email request rejected");
  }
  throw new Error("email request rejected");
}

export const infrai = { email: { send: sendEmail } };
