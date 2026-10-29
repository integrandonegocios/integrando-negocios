import "server-only";

export function emailConfigurationError(): "EMAIL_NOT_CONFIGURED" | "INVALID_APP_URL" | null {
  const { APP_URL, RESEND_API_KEY, EMAIL_FROM } = process.env;
  if (!APP_URL || !RESEND_API_KEY || !EMAIL_FROM) return "EMAIL_NOT_CONFIGURED";

  try {
    const origin = new URL(APP_URL);
    if (origin.username || origin.password || (origin.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && origin.protocol === "http:" && origin.hostname === "localhost"))) {
      return "INVALID_APP_URL";
    }
  } catch {
    return "INVALID_APP_URL";
  }

  return null;
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const { APP_URL, RESEND_API_KEY, EMAIL_FROM } = process.env;
  const configurationError = emailConfigurationError();
  if (configurationError) throw new Error(configurationError);
  if (!APP_URL || !RESEND_API_KEY || !EMAIL_FROM) throw new Error("EMAIL_NOT_CONFIGURED");
  const origin = new URL(APP_URL);
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
  if (!response.ok) throw new Error(`EMAIL_DELIVERY_FAILED_${response.status}`);
}

type ContactLeadEmail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}

export async function sendContactNotificationEmail(to: string, lead: ContactLeadEmail) {
  const { APP_URL, RESEND_API_KEY, EMAIL_FROM } = process.env;
  const configurationError = emailConfigurationError();
  if (configurationError) throw new Error(configurationError);
  if (!APP_URL || !RESEND_API_KEY || !EMAIL_FROM) throw new Error("EMAIL_NOT_CONFIGURED");

  const appOrigin = new URL(APP_URL).origin;
  const leadUrl = new URL(`/admin/contatos/${encodeURIComponent(lead.id)}`, appOrigin).toString();
  const subject = `Novo contato pelo site: ${lead.name.replace(/[\r\n]+/g, " ")}`;
  const text = [
    "Novo contato recebido pelo site Integrando Negócios.",
    "",
    `Nome: ${lead.name}`,
    `E-mail: ${lead.email}`,
    `Telefone: ${lead.phone || "Não informado"}`,
    `Empresa: ${lead.company || "Não informada"}`,
    "",
    "Mensagem:",
    lead.message,
    "",
    `Abrir na área administrativa: ${leadUrl}`,
  ].join("\n");
  const html = [
    "<h1>Novo contato recebido pelo site</h1>",
    `<p><strong>Nome:</strong> ${escapeHtml(lead.name)}</p>`,
    `<p><strong>E-mail:</strong> ${escapeHtml(lead.email)}</p>`,
    `<p><strong>Telefone:</strong> ${escapeHtml(lead.phone || "Não informado")}</p>`,
    `<p><strong>Empresa:</strong> ${escapeHtml(lead.company || "Não informada")}</p>`,
    `<p><strong>Mensagem:</strong></p><p>${escapeHtml(lead.message).replace(/\r?\n/g, "<br>")}</p>`,
    `<p><a href="${escapeHtml(leadUrl)}">Abrir contato na área administrativa</a></p>`,
  ].join("");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [to],
      subject,
      text,
      html,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`EMAIL_DELIVERY_FAILED_${response.status}`);
}
