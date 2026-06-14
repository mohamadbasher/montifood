import "server-only";

// Sends an email via Resend if RESEND_API_KEY is set.
// Until a key is configured, it logs to the server console (no-op),
// so the app works end-to-end during development.
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("[email:noop] would send:", opts.subject, "→", opts.to);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "MontiFood <onboarding@resend.dev>",
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      }),
    });
    if (!res.ok) {
      console.error("[email] send failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[email] send error:", err);
  }
}
