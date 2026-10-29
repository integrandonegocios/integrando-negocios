import "server-only";

type ContactLead = {
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
};

type WhatsAppConfiguration =
  | { enabled: false; error: null }
  | { enabled: false; error: string }
  | { enabled: true; error: null; to: string; accessToken: string; phoneNumberId: string; apiVersion: string; templateName: string; languageCode: string };

export function contactWhatsAppConfiguration(): WhatsAppConfiguration {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim() ?? "";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() ?? "";
  const to = (process.env.CONTACT_NOTIFICATION_WHATSAPP_TO ?? "").replace(/\D/g, "");
  const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() ?? "";
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME?.trim() ?? "";
  const languageCode = process.env.WHATSAPP_TEMPLATE_LANGUAGE?.trim() || "pt_BR";
  const values = [accessToken, phoneNumberId, to, apiVersion, templateName];

  if (values.every(value => !value)) return { enabled: false, error: null };
  if (values.some(value => !value)) return { enabled: false, error: "WHATSAPP_NOT_CONFIGURED" };
  if (!/^\d{8,15}$/.test(to)) return { enabled: false, error: "WHATSAPP_INVALID_RECIPIENT" };
  if (!/^v\d+\.\d+$/.test(apiVersion)) return { enabled: false, error: "WHATSAPP_INVALID_API_VERSION" };
  if (!/^[a-zA-Z0-9_]+$/.test(templateName)) return { enabled: false, error: "WHATSAPP_INVALID_TEMPLATE_NAME" };

  return { enabled: true, error: null, to, accessToken, phoneNumberId, apiVersion, templateName, languageCode };
}

export async function sendContactNotificationWhatsApp(to: string, lead: ContactLead) {
  const configuration = contactWhatsAppConfiguration();
  if (!configuration.enabled) throw new Error(configuration.error ?? "WHATSAPP_NOT_CONFIGURED");

  const response = await fetch(`https://graph.facebook.com/${configuration.apiVersion}/${configuration.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${configuration.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: configuration.templateName,
        language: { code: configuration.languageCode },
        components: [{
          type: "body",
          parameters: [lead.name, lead.email, lead.phone || "Não informado", lead.company || "Não informada", lead.message]
            .map(text => ({ type: "text", text: text.slice(0, 1024) })),
        }],
      },
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`WHATSAPP_DELIVERY_FAILED_${response.status}`);
}
