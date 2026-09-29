import type { PrismaClient } from "../src/generated/prisma/client";
import { permissions, rolePermissions } from "../src/lib/auth/permissions";

export async function provisionInitialData(db: PrismaClient, account?: { email: string; hash: string; name?: string }) {
  const { email, hash } = account ?? {};
  return db.$transaction(async tx => {
    // One bootstrap at a time; all role replacements commit together.
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(72819401)`;
    for (const key of permissions) {
      const [resource, action] = key.split(".");
      await tx.permission.upsert({ where: { key }, update: { resource, action }, create: { key, resource, action } });
    }
    for (const [name, keys] of Object.entries(rolePermissions)) {
      const role = await tx.role.upsert({ where: { name }, update: {}, create: { name, description: `Perfil de sistema ${name}`, system: true } });
      const records = await tx.permission.findMany({ where: { key: { in: [...keys] } }, select: { id: true } });
      await tx.rolePermission.deleteMany({ where: { roleId: role.id } });
      await tx.rolePermission.createMany({ data: records.map(({ id }) => ({ roleId: role.id, permissionId: id })) });
    }
    if (!email || !hash) return "Perfis configurados. Nenhuma conta foi provisionada.";
    const existing = await tx.user.findUnique({ where: { email }, select: { id: true } });
    // Bootstrap never changes credentials, status or privileges of an existing account.
    if (existing) return "Conta existente preservada. Use a recuperação de senha para recuperar acesso.";
    const role = await tx.role.findUniqueOrThrow({ where: { name: "SUPER_ADMIN" } });
    await tx.user.create({ data: {
      name: account?.name || "Administrador", email, passwordHash: hash,
      roles: { create: { roleId: role.id } },
    } });
    return "Administrador inicial criado.";
  }, { timeout: 30_000 });
}
