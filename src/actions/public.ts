"use server";

import { after } from "next/server";
import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validation";
import { allowAuthAttempt } from "@/lib/security/rate-limit";
import { emailConfigurationError, sendContactNotificationEmail } from "@/lib/email";
import { contactWhatsAppConfiguration, sendContactNotificationWhatsApp } from "@/lib/whatsapp";

export type ContactState = { success?: boolean; error?: string };

export async function submitContact(_: ContactState, formData: FormData): Promise<ContactState> {
  // Give bots no signal while avoiding database writes.
  if (String(formData.get("website") ?? "").trim()) return { success: true };
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Revise os campos e escreva uma mensagem com ao menos 10 caracteres." };
  try {
    if (!await allowAuthAttempt("contact", parsed.data.email)) return { error: "Muitas mensagens enviadas. Aguarde 15 minutos e tente novamente." };
    const { lead, recipients } = await db.$transaction(async tx => {
      const lead = await tx.contactLead.create({ data: {
        name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone || null,
        company: parsed.data.company || null, message: parsed.data.message,
      } });
      const recipients = await tx.user.findMany({
        where: { status: "ACTIVE", roles: { some: { role: { permissions: { some: { permission: { key: "contacts.read" } } } } } } },
        select: { id: true, email: true },
      });
      if (recipients.length) await tx.notification.createMany({ data: recipients.map(({ id }) => ({ userId: id, type: "lead", title: `Novo contato: ${lead.name}`, href: `/admin/contatos/${lead.id}` })) });
      return { lead, recipients };
    });

    const whatsappConfiguration = contactWhatsAppConfiguration();
    if (recipients.length || whatsappConfiguration.enabled || whatsappConfiguration.error) {
      after(async () => {
        const tasks: Promise<unknown>[] = [];
        if (recipients.length) {
          const configurationError = emailConfigurationError();
          if (configurationError) {
            console.error("CONTACT_NOTIFICATION_EMAIL_CONFIGURATION_FAILED", configurationError);
          } else {
            tasks.push(...recipients.map(({ email }) => sendContactNotificationEmail(email, lead)));
          }
        }

        const whatsapp = contactWhatsAppConfiguration();
        if (whatsapp.error) {
          console.error("CONTACT_NOTIFICATION_WHATSAPP_CONFIGURATION_FAILED", whatsapp.error);
        } else if (whatsapp.enabled) {
          tasks.push(sendContactNotificationWhatsApp(whatsapp.to, lead));
        }

        const results = await Promise.allSettled(tasks);
        const failures = results.flatMap(result => {
          if (result.status === "fulfilled") return [];
          const code = result.reason instanceof Error && /^(EMAIL|WHATSAPP)_DELIVERY_FAILED_[1-5]\d\d$/.test(result.reason.message)
            ? result.reason.message
            : "NOTIFICATION_DELIVERY_FAILED";
          return [code];
        });
        if (failures.some(error => error.startsWith("EMAIL_"))) {
          console.error("CONTACT_NOTIFICATION_EMAIL_FAILED", failures.filter(error => error.startsWith("EMAIL_")));
        }
        if (failures.some(error => error.startsWith("WHATSAPP_"))) {
          console.error("CONTACT_NOTIFICATION_WHATSAPP_FAILED", failures.filter(error => error.startsWith("WHATSAPP_")));
        }
      });
    }
    return { success: true };
  } catch {
    console.error("CONTACT_SUBMISSION_FAILED");
    return { error: "Não foi possível enviar sua mensagem. Tente novamente em instantes." };
  }
}
