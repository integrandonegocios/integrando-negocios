import assert from "node:assert/strict";
import test from "node:test";
import { randomBytes } from "node:crypto";
import { loadServerModule } from "./helpers/server-module";
import * as validation from "../src/lib/validation";
import * as tokens from "../src/lib/security/reset-token";
import type { PasswordState } from "../src/actions/password";

type Actions = Record<"changePassword" | "requestPasswordReset" | "resetPassword", (state: PasswordState, data: FormData) => Promise<PasswordState>>;
type Passwords = { hashPassword(value: string): Promise<string>; verifyPassword(value: string, hash: string): Promise<boolean> };
const passwords = loadServerModule<Passwords>("src/lib/security/password.ts");
const form = (data: Record<string, string>) => { const result = new FormData(); for (const [key, value] of Object.entries(data)) result.set(key, value); return result; };

type Token = { id: string; userId: string; tokenHash: string; expiresAt: Date; usedAt: Date | null };
async function fixture() {
  const oldPassword = randomBytes(20).toString("hex");
  const newPassword = randomBytes(20).toString("hex");
  const user = { id: "user-1", email: "account@example.test", status: "ACTIVE", passwordHash: await passwords.hashPassword(oldPassword) };
  let state = { user, sessions: ["current", "other"], records: [] as Token[], events: [] as object[] };
  let authenticated = true, limited = false, deliveryFailure = false, auditFailure = false, found = true;
  const pending: (() => Promise<void>)[] = [];
  const sent: string[] = [];
  let queue: Promise<unknown> = Promise.resolve();
  const db = {
    user: {
      findUnique: async () => found ? { ...state.user } : null,
      updateMany: async ({ where, data }: { where: { passwordHash: string; status: string }; data: { passwordHash: string } }) => {
        if (where.passwordHash !== state.user.passwordHash || where.status !== state.user.status) return { count: 0 };
        state.user.passwordHash = data.passwordHash; return { count: 1 };
      },
      update: async ({ data }: { data: { passwordHash: string } }) => { state.user.passwordHash = data.passwordHash; },
    },
    session: {
      findFirst: async () => state.sessions.includes("current") ? { id: "current" } : null,
      deleteMany: async ({ where }: { where: { id?: { not: string } } }) => { state.sessions = where.id ? state.sessions.filter(id => id === where.id!.not) : []; },
    },
    passwordResetToken: {
      findUnique: async ({ where }: { where: { tokenHash: string } }) => structuredClone(state.records.find(row => row.tokenHash === where.tokenHash) || null),
      create: async ({ data }: { data: Omit<Token, "id" | "usedAt"> }) => { state.records.push({ ...data, id: `record-${state.records.length}`, usedAt: null }); },
      deleteMany: async ({ where }: { where: { tokenHash?: string } }) => { state.records = where.tokenHash ? state.records.filter(row => row.tokenHash !== where.tokenHash) : []; },
      updateMany: async ({ where, data }: { where: { id?: string; tokenHash?: string; expiresAt?: { gt: Date }; user?: { status: string } }; data: { usedAt: Date } }) => {
        const matching = state.records.filter(row => !row.usedAt && (!where.id || row.id === where.id) && (!where.tokenHash || row.tokenHash === where.tokenHash) && (!where.expiresAt || row.expiresAt > where.expiresAt.gt) && (!where.user || state.user.status === where.user.status));
        matching.forEach(row => { row.usedAt = data.usedAt; }); return { count: matching.length };
      },
    },
    $queryRaw: async (strings: TemplateStringsArray) => strings.join("").includes('"email"') ? (found && state.user.status === "ACTIVE" ? [{ id: user.id, email: user.email }] : []) : [{ id: user.id }],
    $transaction: async (callback: (tx: unknown) => Promise<unknown>): Promise<unknown> => {
      const execution = queue.then(async () => { const before = structuredClone(state); try { return await callback(db); } catch (error) { state = before; throw error; } });
      queue = execution.catch(() => {}); return execution;
    },
  };
  const actions = loadServerModule<Actions>("src/actions/password.ts", {
    "next/navigation": { redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); } },
    "next/server": { after: (callback: () => Promise<void>) => pending.push(callback) },
    "@/lib/db": { db },
    "@/lib/audit": { audit: async (event: object) => { if (auditFailure) throw new Error("TEST_AUDIT_FAILURE"); state.events.push(event); } },
    "@/lib/auth/session": { getSessionUser: async () => authenticated ? { id: user.id, sessionId: "current" } : null },
    "@/lib/security/password": passwords,
    "@/lib/security/reset-token": tokens,
    "@/lib/security/rate-limit": { allowAuthAttempt: async () => !limited },
    "@/lib/validation": validation,
    "@/lib/email": { sendPasswordResetEmail: async (_email: string, token: string) => { if (deliveryFailure) throw new Error("TEST_DELIVERY_FAILURE"); sent.push(token); } },
  });
  return {
    actions, oldPassword, newPassword, sent,
    state: () => state,
    change: (override = {}) => actions.changePassword({}, form({ currentPassword: oldPassword, newPassword, confirmPassword: newPassword, ...override })),
    request: () => actions.requestPasswordReset({}, form({ email: user.email })),
    flush: async () => { while (pending.length) await pending.shift()!(); },
    reset: (token: string, override = {}) => actions.resetPassword({}, form({ token, newPassword, confirmPassword: newPassword, ...override })),
    configure: (options: { authenticated?: boolean; limited?: boolean; found?: boolean; status?: string; deliveryFailure?: boolean; auditFailure?: boolean }) => {
      authenticated = options.authenticated ?? authenticated; limited = options.limited ?? limited; found = options.found ?? found;
      deliveryFailure = options.deliveryFailure ?? deliveryFailure; auditFailure = options.auditFailure ?? auditFailure;
      state.user.status = options.status ?? state.user.status;
    },
  };
}

test("alteração autentica, valida senha e preserva apenas a sessão atual", async () => {
  const f = await fixture();
  f.configure({ authenticated: false }); assert.ok((await f.change()).error);
  f.configure({ authenticated: true }); assert.ok((await f.change({ currentPassword: "incorreta" })).error);
  assert.ok((await f.change({ confirmPassword: "diferente" })).error);
  assert.ok((await f.change({ newPassword: "curta", confirmPassword: "curta" })).error);
  assert.ok((await f.change({ newPassword: f.oldPassword, confirmPassword: f.oldPassword })).error);
  assert.equal(f.state().sessions.length, 2);
  assert.ok((await f.change()).success);
  assert.ok(await passwords.verifyPassword(f.newPassword, f.state().user.passwordHash));
  assert.equal(await passwords.verifyPassword(f.oldPassword, f.state().user.passwordHash), false);
  assert.deepEqual(f.state().sessions, ["current"]);
  assert.deepEqual(f.state().events, [{ actorUserId: "user-1", action: "CHANGE_PASSWORD", entityType: "User", entityId: "user-1" }]);
});

test("alteração respeita rate limit, sessão revogada e rollback da auditoria", async () => {
  const f = await fixture(); f.configure({ limited: true }); assert.ok((await f.change()).error);
  f.configure({ limited: false, auditFailure: true }); assert.ok((await f.change()).error);
  assert.ok(await passwords.verifyPassword(f.oldPassword, f.state().user.passwordHash));
  assert.equal(f.state().sessions.length, 2);
  f.configure({ auditFailure: false }); f.state().sessions = ["other"];
  assert.ok((await f.change()).error);
  assert.ok(await passwords.verifyPassword(f.oldPassword, f.state().user.passwordHash));
});

test("recuperação responde igualmente para conta ativa, inexistente, inativa e limitada", async () => {
  const f = await fixture(); const expected = await f.request(); await f.flush();
  assert.equal(f.sent.length, 1);
  assert.ok(f.state().records[0].tokenHash === tokens.hashResetToken(f.sent[0]));
  assert.ok(!JSON.stringify(f.state()).includes(f.sent[0]));
  f.configure({ found: false }); assert.deepEqual(await f.request(), expected); await f.flush();
  f.configure({ found: true, status: "INACTIVE" }); assert.deepEqual(await f.request(), expected); await f.flush();
  f.configure({ status: "ACTIVE", limited: true }); assert.deepEqual(await f.request(), expected); await f.flush();
  assert.equal(f.sent.length, 1);
});

test("nova solicitação invalida token anterior; falha de envio remove token sem expor erro", async t => {
  const f = await fixture(); await f.request(); await f.flush(); const previous = f.sent[0];
  await f.request(); await f.flush(); assert.equal(f.state().records.length, 1);
  assert.ok((await f.reset(previous)).error);
  const logs: unknown[][] = []; t.mock.method(console, "error", (...args: unknown[]) => logs.push(args));
  f.configure({ deliveryFailure: true }); assert.ok((await f.request()).success); await f.flush();
  assert.equal(f.state().records.length, 0);
  assert.deepEqual(logs, [["PASSWORD_RESET_EMAIL_FAILED"]]);
});

test("redefinição rejeita token ausente, inválido, expirado, usado, conta inativa e confirmação divergente", async () => {
  const f = await fixture(); await f.request(); await f.flush(); const token = f.sent[0];
  assert.ok((await f.reset("")).error); assert.ok((await f.reset(randomBytes(32).toString("hex"))).error);
  assert.ok((await f.reset(token, { confirmPassword: "diferente" })).error);
  f.configure({ limited: true }); assert.ok((await f.reset(token)).error); f.configure({ limited: false });
  const record = f.state().records[0]; record.expiresAt = new Date(Date.now() - 1); assert.ok((await f.reset(token)).error);
  record.expiresAt = new Date(Date.now() + 60_000); record.usedAt = new Date(); assert.ok((await f.reset(token)).error);
  record.usedAt = null; f.configure({ status: "INACTIVE" }); assert.ok((await f.reset(token)).error);
  assert.ok(await passwords.verifyPassword(f.oldPassword, f.state().user.passwordHash));
  assert.equal(f.state().sessions.length, 2);
});

test("redefinição consome uma única vez, revoga sessões e registra apenas auditoria permitida", async () => {
  const f = await fixture(); await f.request(); await f.flush(); const token = f.sent[0];
  await assert.rejects(f.reset(token), { message: "REDIRECT:/login?senha=redefinida" });
  assert.ok(f.state().records[0].usedAt); assert.equal(f.state().sessions.length, 0);
  assert.ok(await passwords.verifyPassword(f.newPassword, f.state().user.passwordHash));
  assert.ok((await f.reset(token)).error);
  assert.deepEqual(f.state().events, [{ actorUserId: "user-1", action: "RESET_PASSWORD", entityType: "User", entityId: "user-1" }]);
});

test("duas redefinições simultâneas só permitem um consumo", async () => {
  const f = await fixture(); await f.request(); await f.flush(); const token = f.sent[0];
  const results = await Promise.allSettled([f.reset(token), f.reset(token)]);
  assert.equal(results.filter(result => result.status === "rejected" && result.reason.message === "REDIRECT:/login?senha=redefinida").length, 1);
  assert.equal(results.filter(result => result.status === "fulfilled" && result.value.error).length, 1);
  assert.equal(f.state().events.length, 1);
});

test("falha de auditoria reverte senha, consumo de token e revogação de sessões", async () => {
  const f = await fixture(); await f.request(); await f.flush(); f.configure({ auditFailure: true });
  assert.ok((await f.reset(f.sent[0])).error);
  assert.equal(f.state().records[0].usedAt, null); assert.equal(f.state().sessions.length, 2);
  assert.ok(await passwords.verifyPassword(f.oldPassword, f.state().user.passwordHash));
});

test("scrypt mantém compatibilidade e rejeita hashes malformados", async () => {
  const value = randomBytes(20).toString("hex"); const hash = await passwords.hashPassword(value);
  assert.ok(await passwords.verifyPassword(value, hash));
  assert.equal(await passwords.verifyPassword(randomBytes(20).toString("hex"), hash), false);
  for (const invalid of ["scrypt:salt:zz", "scrypt:salt:", "outro:salt:abcd", `${hash}:extra`]) {
    assert.equal(await passwords.verifyPassword(value, invalid), false);
  }
});
