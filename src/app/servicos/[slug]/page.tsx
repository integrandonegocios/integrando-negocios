import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { canonical } from "@/lib/site-url";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";

const getService = cache(async (slug: string) => {
  await connection();
  return db.service.findFirst({ where: { slug, active: true }, select: { title: true, description: true, slug: true } });
});
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getService((await params).slug);
  if (!service) notFound();
  return { title: service.title, description: service.description.slice(0, 160), alternates: canonical(`/servicos/${service.slug}`) };
}
export default async function ServicePage({ params }: Props) {
  const service = await getService((await params).slug);
  if (!service) notFound();
  return <><Header /><main className="mx-auto min-h-[70svh] max-w-5xl px-5 pb-20 pt-40 sm:px-8">
    <Link href="/#servicos" className="font-semibold underline">← Todos os serviços</Link>
    <h1 className="mt-8 text-4xl font-bold sm:text-6xl">{service.title}</h1>
    <p className="mt-8 whitespace-pre-wrap text-lg leading-8 text-text-secondary">{service.description}</p>
    <Link href="/contato" className="mt-10 inline-flex rounded-lg bg-brand-primary px-6 py-4 font-bold">Converse sobre seu projeto</Link>
  </main><Footer /></>;
}
