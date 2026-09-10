"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { createSession, deleteSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation";
import { verifyPassword } from "@/lib/security/password";

export type AuthState = { error?: string };

export async function login(
  _: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    console.log("LOGIN_DEBUG", {
      etapa: "validacao",
      erro: parsed.error.issues[0]?.message,
    });

    return {
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const user = await db.user.findUnique({
    where: {
      email: parsed.data.email,
    },
  });

  const passwordValid = user
    ? await verifyPassword(
        parsed.data.password,
        user.passwordHash
      )
    : false;

  console.log("LOGIN_DEBUG", {
    usuarioEncontrado: !!user,
    status: user?.status,
    senhaCorreta: passwordValid,
  });

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

  await createSession(user.id);

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