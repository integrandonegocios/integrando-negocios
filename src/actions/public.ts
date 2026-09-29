"use server";

import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validation";
import { allowAuthAttempt } from "@/lib/security/rate-limit";

export type ContactState = { success?: boolean; error?: string };

export async function submitContact(_: ContactState, formData: FormData): Promise<ContactState> {
  // Give bots no signal while avoiding database writes.
  if (String(formData.get("website") ?? "").trim()) return { success: true };
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Revise os campos e escreva uma mensagem com ao menos 10 caracteres." };
  try {
    if (!await allowAuthAttempt("contact", parsed.data.email)) return { error: "Muitas mensagens enviadas. Aguarde 15 minutos e tente novamente." };
    await db.$transaction(async tx => {
      const lead = await tx.contactLead.create({ data: {
        name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone || null,
        company: parsed.data.company || null, message: parsed.data.message,
      } });
      const recipients = await tx.user.findMany({
        where: { status: "ACTIVE", roles: { some: { role: { permissions: { some: { permission: { key: "contacts.read" } } } } } } },
        select: { id: true },
      });
      if (recipients.length) await tx.notification.createMany({ data: recipients.map(({ id }) => ({ userId: id, type: "lead", title: `Novo contato: ${lead.name}`, href: `/admin/contatos/${lead.id}` })) });
    });
    return { success: true };
  } catch {
    console.error("CONTACT_SUBMISSION_FAILED");
    return { error: "Não foi possível enviar sua mensagem. Tente novamente em instantes." };
  }
}
