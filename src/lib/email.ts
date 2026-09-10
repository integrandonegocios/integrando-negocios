import "server-only";

export async function sendPasswordResetEmail(email: string, token: string) {
  const { APP_URL, RESEND_API_KEY, EMAIL_FROM } = process.env;
  if (!APP_URL || !RESEND_API_KEY || !EMAIL_FROM) throw new Error("EMAIL_NOT_CONFIGURED");
  const origin = new URL(APP_URL);
  if (origin.username || origin.password || (origin.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && origin.protocol === "http:" && origin.hostname === "localhost"))) {
    throw new Error("INVALID_APP_URL");
  }
  const url = new URL("/redefinir-senha", origin.origin);
  // Fragment keeps the bearer token out of HTTP URLs and access logs.
  url.hash = `token=${token}`;
  const link = url.toString().replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: EMAIL_FROM, to: [email], subject: "Redefinição de senha",
      text: `Recebemos uma solicitação para redefinir sua senha. Acesse: ${url.toString()}\nO link expira em 30 minutos e funciona apenas uma vez. Se você não solicitou, ignore este e-mail.`,
      html: `<p>Recebemos uma solicitação para redefinir sua senha.</p><p><a href="${link}">Redefinir minha senha</a></p><p>O link expira em 30 minutos e funciona apenas uma vez.</p><p>Se você não solicitou esta alteração, ignore este e-mail.</p>`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("EMAIL_DELIVERY_FAILED");
}
