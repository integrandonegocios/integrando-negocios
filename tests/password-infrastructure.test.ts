import assert from "node:assert/strict";
import test from "node:test";
import { randomBytes } from "node:crypto";
import { loadServerModule } from "./helpers/server-module";
import { hashResetToken } from "../src/lib/security/reset-token";

test("rate limit aplica 5 por identidade e 20 por IP com chaves opacas", async () => {
  const buckets = new Map<string, number>();
  const limiter = loadServerModule<{ allowAuthAttempt(scope: string, identity?: string): Promise<boolean> }>("src/lib/security/rate-limit.ts", {
    "next/headers": { headers: async () => new Headers({ "x-forwarded-for": "untrusted" }) },
    "./reset-token": { hashResetToken },
    "@/lib/db": { db: {
      $queryRaw: async (_query: TemplateStringsArray, key: string) => {
        assert.match(key, /^[a-f0-9]{64}$/);
        const attempts = (buckets.get(key) || 0) + 1; buckets.set(key, attempts); return [{ attempts }];
      },
      authRateLimit: { deleteMany: async () => {} },
    } },
  });
  for (let i = 0; i < 5; i++) assert.equal(await limiter.allowAuthAttempt("forgot", "account@example.test"), true);
  assert.equal(await limiter.allowAuthAttempt("forgot", "account@example.test"), false);
  for (let i = 0; i < 20; i++) assert.equal(await limiter.allowAuthAttempt("reset"), true);
  assert.equal(await limiter.allowAuthAttempt("reset"), false);
});

test("envio usa configuração do servidor e fragmento; falhas não expõem resposta do provedor", async t => {
  const keys = ["APP_URL", "RESEND_API_KEY", "EMAIL_FROM"] as const;
  const original = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  t.after(() => { for (const key of keys) { if (original[key] === undefined) delete process.env[key]; else process.env[key] = original[key]; } });
  const email = loadServerModule<{ sendPasswordResetEmail(email: string, token: string): Promise<void> }>("src/lib/email.ts");
  const token = randomBytes(32).toString("hex");
  let calls = 0, fail = false;
  t.mock.method(globalThis, "fetch", async (input: string, init: RequestInit) => {
    calls++;
    assert.equal(input, "https://api.resend.com/emails");
    const body = JSON.parse(String(init.body));
    assert.equal(body.from, process.env.EMAIL_FROM);
    assert.equal(body.subject, "Redefinição de senha");
    assert.ok(body.text.includes(`/redefinir-senha#token=${token}`));
    assert.equal(body.text.includes("?token="), false);
    assert.ok(!body.html.includes(process.env.RESEND_API_KEY!));
    return new Response(fail ? "PRIVATE_PROVIDER_DETAILS" : "{}", { status: fail ? 500 : 200 });
  });
  for (const key of keys) delete process.env[key];
  await assert.rejects(email.sendPasswordResetEmail("recipient@example.test", token), { message: "EMAIL_NOT_CONFIGURED" });
  assert.equal(calls, 0);
  process.env.APP_URL = "https://example.test";
  process.env.EMAIL_FROM = "sender@example.test";
  // Test-only input; fetch is intercepted and never reaches a provider.
  process.env.RESEND_API_KEY = randomBytes(24).toString("hex");
  await email.sendPasswordResetEmail("recipient@example.test", token); assert.equal(calls, 1);
  fail = true;
  await assert.rejects(email.sendPasswordResetEmail("recipient@example.test", token), { message: "EMAIL_DELIVERY_FAILED" });
  process.env.APP_URL = "https://user:password@example.test";
  await assert.rejects(email.sendPasswordResetEmail("recipient@example.test", token), { message: "INVALID_APP_URL" });
  assert.equal(calls, 2);
});
