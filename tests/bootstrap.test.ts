import assert from "node:assert/strict";
import test from "node:test";
import { loadServerModule } from "./helpers/server-module";
import * as permissions from "../src/lib/auth/permissions";

test("bootstrap preserva conta existente e cria administrador apenas uma vez", async () => {
  let account: { id: string; passwordHash: string; status: string } | null = null;
  let creations = 0;
  const tx = {
    $queryRaw: async () => [],
    permission: { upsert: async () => {}, findMany: async () => [{ id: "permission" }] },
    role: { upsert: async () => ({ id: "role" }), findUniqueOrThrow: async () => ({ id: "super-admin" }) },
    rolePermission: { deleteMany: async () => {}, createMany: async () => {} },
    user: {
      findUnique: async () => account,
      create: async ({ data }: { data: { passwordHash: string; roles: { create: { roleId: string } } } }) => {
        creations++; assert.equal(data.roles.create.roleId, "super-admin");
        account = { id: "account", passwordHash: data.passwordHash, status: "ACTIVE" };
      },
    },
  };
  const db = { $transaction: async (callback: (client: typeof tx) => Promise<string>) => callback(tx) };
  const bootstrap = loadServerModule<{ provisionInitialData(client: typeof db, account: { email: string; hash: string }): Promise<string> }>("prisma/bootstrap.ts", {
    "../src/lib/auth/permissions": permissions,
  });
  const input = { email: "admin@example.test", hash: "original" };
  await bootstrap.provisionInitialData(db, input);
  assert.equal(creations, 1);
  account = { id: "account", passwordHash: "changed-by-user", status: "INACTIVE" };
  assert.match(await bootstrap.provisionInitialData(db, { ...input, hash: "replacement" }), /preservada/);
  assert.deepEqual(account, { id: "account", passwordHash: "changed-by-user", status: "INACTIVE" });
  assert.equal(creations, 1);
});
