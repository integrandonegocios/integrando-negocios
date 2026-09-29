"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { createSession, deleteSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation";
import { verifyPassword } from "@/lib/security/password";
import { allowAuthAttempt } from "@/lib/security/rate-limit";

// Same scrypt work for an unknown account, without a usable credential.
const dummyHash = `scrypt:${"0".repeat(32)}:${"0".repeat(128)}`;

export type AuthState = {
  error?: string;
};

export async function login(
  _: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Dados inválidos.",
    };
  }

  try {
    if (!await allowAuthAttempt("login", parsed.data.email)) {
      return { error: "Muitas tentativas. Aguarde 15 minutos." };
    }
  } catch {
    return { error: "Não foi possível entrar agora. Tente novamente." };
  }

  const user = await db.user.findUnique({
    where: {
      email: parsed.data.email,
    },
  });

  const passwordValid = await verifyPassword(parsed.data.password, user?.passwordHash ?? dummyHash);

  const valid =
    user &&
    user.status === "ACTIVE" &&
    passwordValid;

  if (!valid) {
    return {
      error: "E-mail ou senha inválidos.",
    };
  }

  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      lastLoginAt: new Date(),
    },
  });

  if (!await createSession(user.id, user.passwordHash)) {
    return { error: "E-mail ou senha inválidos." };
  }

  await audit({
    actorUserId: user.id,
    action: "LOGIN",
    entityType: "Session",
  });

  redirect("/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
