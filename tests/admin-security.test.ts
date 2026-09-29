import assert from "node:assert/strict";
import test from "node:test";
import { loadServerModule } from "./helpers/server-module";
import * as validation from "../src/lib/validation";
import * as access from "../src/lib/auth/permissions";

const role = (name: string) => ({ id: name, name, permissions: access.rolePermissions[name].map(key => ({ permission: { key } })) });
function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}
function fixture(actorRole = "ADMIN", targetRole = "EDITOR", activeSuperAdmins = 2) {
  let state = { created: 0, status: "ACTIVE", sessions: 2, tokens: 1, audits: 0 };
  let failAudit = false;
  const actor = { id: "actor", permissions: new Set<string>(access.rolePermissions[actorRole]) };
  const tx = {
    $queryRaw: async () => [],
    role: { findUnique: async ({ where }: { where: { id: string } }) => access.rolePermissions[where.id] ? role(where.id) : null },
    user: {
      findUnique: async ({ where }: { where: { id: string } }) => ({ id: where.id, status: "ACTIVE", roles: [{ role: role(where.id === actor.id ? actorRole : targetRole) }] }),
      create: async () => { state.created++; return { id: "new-user" }; },
      update: async ({ data }: { data: { status: string } }) => { state.status = data.status; },
      count: async () => activeSuperAdmins,
    },
    session: { deleteMany: async () => { state.sessions = 0; } },
    passwordResetToken: { deleteMany: async () => { state.tokens = 0; } },
  };
  const actions = loadServerModule<{ createUser(data: FormData): Promise<void>; setUserStatus(data: FormData): Promise<void> }>("src/actions/admin.ts", {
    "next/cache": { revalidatePath: () => {} },
    "@/lib/db": { db: { $transaction: async (callback: (client: typeof tx) => Promise<unknown>) => {
      const before = structuredClone(state);
      try { return await callback(tx); } catch (error) { state = before; throw error; }
    } } },
    "@/lib/auth/session": { requirePermission: async (key: string) => { if (!actor.permissions.has(key)) throw new Error("Acesso negado"); return actor; } },
    "@/lib/auth/permissions": access,
    "@/lib/security/password": { hashPassword: async () => "test-hash" },
    "@/lib/storage/cloudinary": {},
    "@/lib/validation": validation,
    "@/lib/audit": { audit: async (_input: unknown, client: unknown) => { assert.equal(client, tx); if (failAudit) throw new Error("AUDIT_FAILED"); state.audits++; } },
  });
  return { actions, state: () => state, failAudit: () => { failAudit = true; } };
}
const userForm = (roleId: string) => form({ name: "Nova conta", email: "new@example.test", password: "senha-inicial-segura", roleId });

test("ADMIN não cria SUPER_ADMIN nem perfil inexistente; pode criar EDITOR", async () => {
  const f = fixture();
  await assert.rejects(f.actions.createUser(userForm("SUPER_ADMIN")), /não pode conceder/);
  await assert.rejects(f.actions.createUser(userForm("missing")), /não pode conceder/);
  assert.equal(f.state().created, 0);
  await f.actions.createUser(userForm("EDITOR"));
  assert.equal(f.state().created, 1);
  assert.equal(f.state().audits, 1);
});

test("SUPER_ADMIN cria conta superior; falha de auditoria reverte criação", async () => {
  const f = fixture("SUPER_ADMIN");
  await f.actions.createUser(userForm("SUPER_ADMIN"));
  assert.equal(f.state().created, 1);
  f.failAudit();
  await assert.rejects(f.actions.createUser(userForm("EDITOR")), /AUDIT_FAILED/);
  assert.equal(f.state().created, 1);
});

test("status bloqueia gestão superior, autodesativação e último SUPER_ADMIN", async () => {
  const admin = fixture("ADMIN", "SUPER_ADMIN");
  await assert.rejects(admin.actions.setUserStatus(form({ id: "target", status: "INACTIVE" })), /não pode gerenciar/);
  await assert.rejects(admin.actions.setUserStatus(form({ id: "actor", status: "INACTIVE" })), /própria conta/);
  const last = fixture("SUPER_ADMIN", "SUPER_ADMIN", 1);
  await assert.rejects(last.actions.setUserStatus(form({ id: "target", status: "INACTIVE" })), /ao menos um/);
  assert.equal(last.state().status, "ACTIVE");
  await assert.rejects(admin.actions.setUserStatus(form({ id: "target", status: "INVALID" })));
});

test("desativação autorizada revoga sessões e tokens atomicamente", async () => {
  const f = fixture();
  f.failAudit();
  await assert.rejects(f.actions.setUserStatus(form({ id: "target", status: "INACTIVE" })));
  assert.deepEqual(f.state(), { created: 0, status: "ACTIVE", sessions: 2, tokens: 1, audits: 0 });
  const ok = fixture();
  await ok.actions.setUserStatus(form({ id: "target", status: "INACTIVE" }));
  assert.deepEqual(ok.state(), { created: 0, status: "INACTIVE", sessions: 0, tokens: 0, audits: 1 });
});
