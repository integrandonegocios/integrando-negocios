"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { getSessionUser } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { createResetToken, hashResetToken } from "@/lib/security/reset-token";
import { allowAuthAttempt } from "@/lib/security/rate-limit";
import { changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validation";
import { sendPasswordResetEmail } from "@/lib/email";

export type PasswordState = { error?: string; success?: string };
const genericMessage = "Se existir uma conta cadastrada com esse e-mail, enviaremos as instruções para redefinição da senha.";
const invalidToken = "Link inválido ou expirado. Solicite uma nova recuperação.";

export async function changePassword(_: PasswordState, formData: FormData): Promise<PasswordState> {
  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    const session = await getSessionUser();
    if (!session) return { error: "Sua sessão expirou. Entre novamente." };
    if (!await allowAuthAttempt("change", session.id)) return { error: "Muitas tentativas. Aguarde 15 minutos." };
    const user = await db.user.findUnique({ where: { id: session.id } });
    if (!user || user.status !== "ACTIVE" || !await verifyPassword(parsed.data.currentPassword, user.passwordHash)) return { error: "Senha atual incorreta." };
    const passwordHash = await hashPassword(parsed.data.newPassword);
    await db.$transaction(async tx => {
      // Lock the user to serialize change, reset and token issuance.
      await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${user.id} FOR UPDATE`;
      const activeSession = await tx.session.findFirst({ where: { id: session.sessionId, userId: user.id, expiresAt: { gt: new Date() } } });
      if (!activeSession) throw new Error("SESSION_EXPIRED");
      const updated = await tx.user.updateMany({ where: { id: user.id, status: "ACTIVE", passwordHash: user.passwordHash }, data: { passwordHash } });
      if (updated.count !== 1) throw new Error("PASSWORD_CHANGED");
      await tx.session.deleteMany({ where: { userId: user.id, id: { not: session.sessionId } } });
      await tx.passwordResetToken.deleteMany({ where: { userId: user.id } });
      await audit({ actorUserId: user.id, action: "CHANGE_PASSWORD", entityType: "User", entityId: user.id }, tx);
    });
    return { success: "Senha alterada com sucesso." };
  } catch {
    return { error: "Não foi possível alterar a senha. Tente novamente." };
  }
}

export async function requestPasswordReset(_: PasswordState, formData: FormData): Promise<PasswordState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Informe um e-mail válido." };
  try {
    if (await allowAuthAttempt("forgot", parsed.data.email)) {
      // Account lookup and provider latency cannot affect the public response timing.
      after(async () => {
        try {
          const issued = await db.$transaction(async tx => {
            const users = await tx.$queryRaw<{ id: string; email: string }[]>`SELECT "id", "email" FROM "User" WHERE "email" = ${parsed.data.email} AND "status" = 'ACTIVE' FOR UPDATE`;
            const user = users[0];
            if (!user) return null;
            const { token, tokenHash, expiresAt } = createResetToken();
            await tx.passwordResetToken.deleteMany({ where: { userId: user.id } });
            await tx.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } });
            return { email: user.email, token, tokenHash };
          });
          if (issued) {
            try {
              await sendPasswordResetEmail(issued.email, issued.token);
            } catch {
              await db.passwordResetToken.deleteMany({ where: { tokenHash: issued.tokenHash } });
              console.error("PASSWORD_RESET_EMAIL_FAILED");
            }
          }
        } catch {
          console.error("PASSWORD_RESET_REQUEST_FAILED");
        }
      });
    }
  } catch {
    console.error("PASSWORD_RESET_REQUEST_FAILED");
  }
  return { success: genericMessage };
}

export async function resetPassword(_: PasswordState, formData: FormData): Promise<PasswordState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    if (!await allowAuthAttempt("reset")) return { error: "Muitas tentativas. Aguarde 15 minutos." };
    const tokenHash = hashResetToken(parsed.data.token);
    const record = await db.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!record || record.usedAt || record.expiresAt <= new Date()) return { error: invalidToken };
    const passwordHash = await hashPassword(parsed.data.newPassword);
    await db.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${record.userId} FOR UPDATE`;
      const now = new Date();
      const consumed = await tx.passwordResetToken.updateMany({ where: { id: record.id, tokenHash, usedAt: null, expiresAt: { gt: now }, user: { status: "ACTIVE" } }, data: { usedAt: now } });
      if (consumed.count !== 1) throw new Error("INVALID_TOKEN");
      await tx.user.update({ where: { id: record.userId }, data: { passwordHash } });
      await tx.passwordResetToken.updateMany({ where: { userId: record.userId, usedAt: null }, data: { usedAt: now } });
      await tx.session.deleteMany({ where: { userId: record.userId } });
      await audit({ actorUserId: record.userId, action: "RESET_PASSWORD", entityType: "User", entityId: record.userId }, tx);
    });
  } catch {
    return { error: "Não foi possível redefinir a senha. O link pode estar inválido ou expirado. Solicite uma nova recuperação." };
  }
  redirect("/login?senha=redefinida");
}
