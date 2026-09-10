import assert from "node:assert/strict";
import test from "node:test";
import { changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from "../src/lib/validation";
import { createResetToken, hashResetToken } from "../src/lib/security/reset-token";

test("tokens têm 256 bits aleatórios, hash SHA-256 e validade de 30 minutos", () => {
  const before = Date.now();
  const first = createResetToken();
  const second = createResetToken();
  assert.ok(/^[a-f0-9]{64}$/.test(first.token));
  assert.ok(first.token !== second.token);
  assert.ok(first.tokenHash !== first.token);
  assert.ok(first.tokenHash === hashResetToken(first.token));
  assert.ok(first.expiresAt.getTime() >= before + 30 * 60_000);
  assert.ok(first.expiresAt.getTime() <= Date.now() + 30 * 60_000);
});

test("alteração exige senha atual, mínimo de 12, confirmação e senha diferente", () => {
  const data = { currentPassword: "senha-anterior", newPassword: "nova-senha-segura", confirmPassword: "nova-senha-segura" };
  assert.equal(changePasswordSchema.safeParse(data).success, true);
  for (const change of [
    { currentPassword: "" },
    { newPassword: "12345678901", confirmPassword: "12345678901" },
    { confirmPassword: "outra-senha" },
    { currentPassword: data.newPassword },
    { newPassword: "x".repeat(129), confirmPassword: "x".repeat(129) },
  ]) assert.equal(changePasswordSchema.safeParse({ ...data, ...change }).success, false);
});

test("redefinição valida token e não modifica espaços da senha", () => {
  const data = { token: createResetToken().token, newPassword: "  senha com espaços  ", confirmPassword: "  senha com espaços  " };
  assert.ok(resetPasswordSchema.parse(data).newPassword === data.newPassword);
  assert.equal(resetPasswordSchema.safeParse({ ...data, token: "inválido" }).success, false);
  assert.equal(resetPasswordSchema.safeParse({ ...data, confirmPassword: "diferente" }).success, false);
});

test("recuperação normaliza e limita e-mail no servidor", () => {
  assert.equal(forgotPasswordSchema.parse({ email: " ADMIN@EXAMPLE.COM " }).email, "admin@example.com");
  assert.equal(forgotPasswordSchema.safeParse({ email: "inválido" }).success, false);
  assert.equal(forgotPasswordSchema.safeParse({ email: `${"a".repeat(250)}@example.com` }).success, false);
});
