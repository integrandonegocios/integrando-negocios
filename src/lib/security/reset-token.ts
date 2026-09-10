import { createHash, randomBytes } from "node:crypto";

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createResetToken() {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: hashResetToken(token), expiresAt: new Date(Date.now() + 30 * 60_000) };
}
