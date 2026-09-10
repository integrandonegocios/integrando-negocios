import assert from "node:assert/strict";
import test from "node:test";
import { randomBytes } from "node:crypto";
import { loadServerModule } from "./helpers/server-module";

test("sessão só é criada se o hash verificado ainda pertence a um usuário ativo", async () => {
  let active = true;
  const currentHash = randomBytes(32).toString("hex");
  let created = 0, cookiesSet = 0;
  const db = {
    $queryRaw: async () => [],
    user: { findFirst: async ({ where }: { where: { passwordHash: string } }) => active && where.passwordHash === currentHash ? { id: "user-1" } : null },
    session: { create: async ({ data }: { data: { tokenHash: string } }) => { assert.ok(/^[a-f0-9]{64}$/.test(data.tokenHash)); created++; } },
    $transaction: async (callback: (tx: unknown) => Promise<unknown>) => callback(db),
  };
  const session = loadServerModule<{ createSession(id: string, hash: string): Promise<boolean> }>("src/lib/auth/session.ts", {
    "react": { cache: (fn: unknown) => fn },
    "next/navigation": { redirect: () => {} },
    "next/headers": { cookies: async () => ({ set: (_name: string, _value: string, options: { httpOnly: boolean; sameSite: string; path: string }) => {
      assert.equal(options.httpOnly, true); assert.equal(options.sameSite, "lax"); assert.equal(options.path, "/"); cookiesSet++;
    } }) },
    "@/lib/db": { db },
  });
  assert.equal(await session.createSession("user-1", randomBytes(32).toString("hex")), false);
  active = false; assert.equal(await session.createSession("user-1", currentHash), false);
  assert.equal(created, 0); assert.equal(cookiesSet, 0);
  active = true; assert.equal(await session.createSession("user-1", currentHash), true);
  assert.equal(created, 1); assert.equal(cookiesSet, 1);
});
