export const permissions = [
  "dashboard.read", "users.read", "users.create", "users.update", "users.disable",
  "roles.manage", "contacts.read", "contacts.update", "portfolio.manage",
  "services.manage", "reports.read", "audit.read", "settings.manage",
] as const;

export type PermissionKey = (typeof permissions)[number];

export const rolePermissions: Record<string, readonly PermissionKey[]> = {
  SUPER_ADMIN: permissions,
  ADMIN: permissions.filter((key) => key !== "roles.manage"),
  EDITOR: ["dashboard.read", "portfolio.manage", "services.manage"],
  ATENDIMENTO: ["dashboard.read", "contacts.read", "contacts.update"],
  AUDITOR: ["dashboard.read", "reports.read", "audit.read"],
};

type DelegatedRole = { name: string; permissions: { permission: { key: string } }[] };

export function canManageRole(actor: { permissions: ReadonlySet<string> }, role: DelegatedRole) {
  return (role.name !== "SUPER_ADMIN" || actor.permissions.has("roles.manage")) &&
    role.permissions.every(({ permission }) => actor.permissions.has(permission.key));
}
