export interface BookingEmail {
  subject: string;
  replyTo?: string;
  fields: Record<string, string>;
}

export class DeliveryFailed extends Error {}

export async function sendBookingEmail(env: Env, email: BookingEmail): Promise<void> {
  if (env.RESEND_API_KEY) await sendWithResend(env, email);
  else await sendWithFormSubmit(env, email);
}

async function sendWithFormSubmit(env: Env, email: BookingEmail): Promise<void> {
  const response = await post(env.FORMSUBMIT_URL, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: env.SITE_ORIGIN,
      Referer: `${env.SITE_ORIGIN}/`,
    },
    body: JSON.stringify({
      _subject: email.subject,
      _template: "table",
      _captcha: "false",
      ...(email.replyTo ? { _replyto: email.replyTo } : {}),
      ...email.fields,
    }),
  });
  const result = await response.json<{ success?: unknown; message?: unknown }>().catch(() => null);
  if (!response.ok || !result || String(result.success) !== "true") {
    throw new DeliveryFailed(`FormSubmit refused the submission: ${response.status} ${JSON.stringify(result)}`);
  }
}

async function sendWithResend(env: Env, email: BookingEmail): Promise<void> {
  if (!env.RESEND_FROM || !env.RESEND_TO) throw new DeliveryFailed("RESEND_FROM and RESEND_TO must be set");
  const response = await post("https://api.resend.com/emails", {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.RESEND_API_KEY}` },
    body: JSON.stringify({
      from: env.RESEND_FROM,
      to: [env.RESEND_TO],
      subject: email.subject,
      ...(email.replyTo ? { reply_to: email.replyTo } : {}),
      text: Object.entries(email.fields)
        .map(([name, value]) => `${name}: ${value}`)
        .join("\n"),
    }),
  });
  if (!response.ok) throw new DeliveryFailed(`Resend refused the email: ${response.status} ${await response.text()}`);
}

async function post(url: string, init: { headers: Record<string, string>; body: string }): Promise<Response> {
  try {
    return await fetch(url, { method: "POST", ...init });
  } catch (cause) {
    throw new DeliveryFailed(`POST ${new URL(url).host} failed`, { cause });
  }
}
