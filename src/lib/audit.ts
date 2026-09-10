import "server-only";

import { headers } from "next/headers";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export async function audit(input: { actorUserId?: string; action: string; entityType: string; entityId?: string; metadata?: object }, client: Prisma.TransactionClient = db) {
  const requestHeaders = await headers();
  await client.auditLog.create({ data: {
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata,
    ip: requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: requestHeaders.get("user-agent"),
  } });
}
