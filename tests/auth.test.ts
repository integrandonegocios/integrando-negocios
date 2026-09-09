import assert from "node:assert/strict";
import test from "node:test";
import { permissions, rolePermissions } from "../src/lib/auth/permissions";
import { contactSchema, loginSchema } from "../src/lib/validation";

test("SUPER_ADMIN possui todas as permissões cadastradas", () => {
  assert.deepEqual(rolePermissions.SUPER_ADMIN, permissions);
});

test("AUDITOR não possui permissões de escrita", () => {
  assert.equal(rolePermissions.AUDITOR.some((key) => key.endsWith(".manage") || key.endsWith(".update")), false);
});

test("login normaliza e-mail e rejeita senha curta", () => {
  assert.equal(loginSchema.parse({ email: " ADMIN@EXAMPLE.COM ", password: "uma-senha-segura" }).email, "admin@example.com");
  assert.equal(loginSchema.safeParse({ email: "admin@example.com", password: "curta" }).success, false);
});

test("formulário de contato exige mensagem relevante e bloqueia honeypot", () => {
  assert.equal(contactSchema.safeParse({ name: "Ana", email: "ana@example.com", message: "curta" }).success, false);
  assert.equal(contactSchema.safeParse({ name: "Ana", email: "ana@example.com", message: "Uma mensagem válida para contato.", website: "spam" }).success, false);
});
