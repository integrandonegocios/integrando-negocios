import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { permissions, rolePermissions } from "../src/lib/auth/permissions";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL não está configurada.");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
const scrypt = promisify(scryptCallback);

async function passwordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${hash.toString("hex")}`;
}

async function main() {
  for (const key of permissions) {
    const [resource, action] = key.split(".");
    await db.permission.upsert({ where: { key }, update: { resource, action }, create: { key, resource, action } });
  }
  for (const [name, keys] of Object.entries(rolePermissions)) {
    const role = await db.role.upsert({ where: { name }, update: {}, create: { name, description: `Perfil de sistema ${name}`, system: true } });
    const records = await db.permission.findMany({ where: { key: { in: [...keys] } }, select: { id: true } });
    await db.rolePermission.deleteMany({ where: { roleId: role.id } });
    await db.rolePermission.createMany({ data: records.map(({ id }) => ({ roleId: role.id, permissionId: id })) });
  }
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 12) throw new Error("ADMIN_PASSWORD deve ter ao menos 12 caracteres.");
    const role = await db.role.findUniqueOrThrow({ where: { name: "SUPER_ADMIN" } });
    await db.user.upsert({ where: { email }, update: {}, create: { name: process.env.ADMIN_NAME?.trim() || "Administrador", email, passwordHash: await passwordHash(password), roles: { create: { roleId: role.id } } } });
  } else {
    console.warn("ADMIN_EMAIL/ADMIN_PASSWORD ausentes: perfis criados, mas nenhum administrador foi provisionado.");
  }
}

main().finally(() => db.$disconnect());
