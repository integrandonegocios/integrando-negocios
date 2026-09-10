import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const COOKIE_NAME = "in_session";
const SESSION_DAYS = 7;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, verifiedPasswordHash: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const created = await db.$transaction(async tx => {
    // A login verified before a concurrent reset must not create a new session afterward.
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
    const user = await tx.user.findFirst({ where: { id: userId, status: "ACTIVE", passwordHash: verifiedPasswordHash }, select: { id: true } });
    if (!user) return false;
    await tx.session.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });
    return true;
  });
  if (!created) return false;
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return true;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  cookieStore.delete(COOKIE_NAME);
}

export const getSessionUser = cache(async () => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        include: {
          roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
        },
      },
    },
  });
  if (!session || session.expiresAt <= new Date() || session.user.status !== "ACTIVE") return null;
  return {
    sessionId: session.id,
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    roles: session.user.roles.map(({ role }) => role.name),
    permissions: new Set(session.user.roles.flatMap(({ role }) => role.permissions.map(({ permission }) => permission.key))),
  };
});

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requirePermission(permission: string) {
  const user = await requireUser();
  if (!user.permissions.has(permission)) redirect("/admin/acesso-negado");
  return user;
}
