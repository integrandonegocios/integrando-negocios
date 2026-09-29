import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/site-url";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const origin = siteUrl();
  if (!origin) return [];
  const services = await db.service.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } });
  return [
    ...["/", "/contato", "/projetos"].map(path => ({ url: new URL(path, origin).toString() })),
    ...services.map(service => ({ url: new URL(`/servicos/${service.slug}`, origin).toString(), lastModified: service.updatedAt })),
  ];
}
