import "server-only";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { hashResetToken } from "./reset-token";

// Atomic PostgreSQL counters are shared across Vercel instances. No raw email/IP is stored.
export async function allowAuthAttempt(scope: string, identity?: string) {
  const requestHeaders = await headers();
  // Vercel overwrites this header. Do not trust arbitrary forwarded headers elsewhere.
  const ip = process.env.VERCEL === "1"
    ? requestHeaders.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    : "local";
  const keys = [{ value: `${scope}:ip:${ip}`, limit: 20 }];
  if (identity) keys.push({ value: `${scope}:identity:${identity}`, limit: 5 });
  const results = [];
  for (const { value, limit } of keys) {
    const key = hashResetToken(value);
    const rows = await db.$queryRaw<{ attempts: number }[]>`
      INSERT INTO "AuthRateLimit" ("key", "attempts", "expiresAt")
      VALUES (${key}, 1, NOW() + INTERVAL '15 minutes')
      ON CONFLICT ("key") DO UPDATE SET
        "attempts" = CASE WHEN "AuthRateLimit"."expiresAt" <= NOW() THEN 1 ELSE LEAST("AuthRateLimit"."attempts" + 1, 1000000) END,
        "expiresAt" = CASE WHEN "AuthRateLimit"."expiresAt" <= NOW() THEN NOW() + INTERVAL '15 minutes' ELSE "AuthRateLimit"."expiresAt" END
      RETURNING "attempts"`;
    results.push(rows[0].attempts <= limit);
  }
  await db.authRateLimit.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  return results.every(Boolean);
}
