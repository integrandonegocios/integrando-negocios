import assert from "node:assert/strict";
import test from "node:test";
import { loadServerModule } from "./helpers/server-module";
import * as validation from "../src/lib/validation";

function form(values: Record<string, string>) { const data = new FormData(); for (const [key, value] of Object.entries(values)) data.set(key, value); return data; }

test("login limita antes de consultar conta, falha fechado e verifica hash substituto", async () => {
  let allowed = false, failLimiter = false, lookups = 0, verifies = 0;
  const auth = loadServerModule<{ login(state: object, data: FormData): Promise<{ error?: string }> }>("src/actions/auth.ts", {
    "next/navigation": { redirect: () => { throw new Error("REDIRECT"); } },
    "@/lib/db": { db: { user: { findUnique: async () => { lookups++; return null; } } } },
    "@/lib/audit": {}, "@/lib/auth/session": {}, "@/lib/validation": validation,
    "@/lib/security/password": { verifyPassword: async (_password: string, hash: string) => { verifies++; assert.match(hash, /^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/); return false; } },
    "@/lib/security/rate-limit": { allowAuthAttempt: async (scope: string, identity: string) => { assert.equal(scope, "login"); assert.equal(identity, "test@example.test"); if (failLimiter) throw new Error("PRIVATE"); return allowed; } },
  });
  const data = form({ email: "TEST@example.test", password: "valid-length-password" });
  assert.match((await auth.login({}, data)).error!, /Muitas tentativas/);
  assert.equal(lookups, 0);
  allowed = true; failLimiter = true;
  assert.match((await auth.login({}, data)).error!, /Não foi possível/);
  assert.equal(lookups, 0);
  failLimiter = false;
  assert.match((await auth.login({}, data)).error!, /E-mail ou senha inválidos/);
  assert.equal(verifies, 1);
});

test("contato bloqueia spam e excesso; falha de notificação reverte lead", async t => {
  t.mock.method(console, "error", () => {});
  let leads = 0, notifications = 0, limited = false, fail = false, attempts = 0;
  const tx = {
    contactLead: { create: async () => { leads++; return { id: "lead", name: "Ana" }; } },
    user: { findMany: async () => [{ id: "recipient" }] },
    notification: { createMany: async () => { if (fail) throw new Error("PRIVATE_DATABASE_DETAILS"); notifications++; } },
  };
  const action = loadServerModule<{ submitContact(state: object, data: FormData): Promise<{ error?: string; success?: boolean }> }>("src/actions/public.ts", {
    "@/lib/validation": validation,
    "@/lib/security/rate-limit": { allowAuthAttempt: async () => { attempts++; return !limited; } },
    "@/lib/db": { db: { $transaction: async (callback: (client: typeof tx) => Promise<void>) => {
      const before = [leads, notifications];
      try { await callback(tx); } catch (error) { [leads, notifications] = before; throw error; }
    } } },
  });
  const values = { name: "Ana", email: "ana@example.test", message: "Preciso de um novo site.", website: "" };
  assert.equal((await action.submitContact({}, form({ ...values, website: "bot" }))).success, true);
  assert.equal(attempts, 0);
  limited = true;
  assert.match((await action.submitContact({}, form(values))).error!, /Muitas mensagens/);
  assert.equal(leads, 0);
  limited = false; fail = true;
  assert.match((await action.submitContact({}, form(values))).error!, /Não foi possível/);
  assert.equal(leads, 0);
  fail = false;
  assert.equal((await action.submitContact({}, form(values))).success, true);
  assert.deepEqual([leads, notifications], [1, 1]);
});
