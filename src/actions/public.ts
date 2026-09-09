"use server";

import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validation";

export type ContactState = { success?: boolean; error?: string };

export async function submitContact(_: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Revise os campos e escreva uma mensagem com ao menos 10 caracteres." };
  if (parsed.data.website) return { success: true };
  const lead = await db.contactLead.create({ data: {
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    company: parsed.data.company || null,
    message: parsed.data.message,
  } });
  const recipients = await db.user.findMany({
    where: { status: "ACTIVE", roles: { some: { role: { name: { in: ["SUPER_ADMIN", "ADMIN", "ATENDIMENTO"] } } } } },
    select: { id: true },
  });
  if (recipients.length) await db.notification.createMany({ data: recipients.map(({ id }) => ({ userId: id, type: "lead", title: `Novo contato: ${lead.name}`, href: `/admin/contatos/${lead.id}` })) });
  return { success: true };
}

