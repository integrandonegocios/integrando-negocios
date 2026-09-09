import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/home/header";

export const metadata: Metadata = {
  title: "Preview — Marketing Médico",
  robots: { index: false, follow: false },
};

export default function MarketingMedicoPreviewPage() {
  return (
    <>
      <Header />
      <main className="min-h-svh bg-background">
        <section className="relative isolate min-h-svh overflow-hidden bg-background pt-24 sm:pt-28">
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[64%] lg:block">
            <Image
              alt=""
              className="object-cover object-center opacity-35"
              fill
              priority
              sizes="64vw"
              src="/assets/images/preview/marketing-medico-clinic-background-v1.png"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/10" />
          </div>

          <div aria-hidden="true" className="pointer-events-none absolute -bottom-[8%] -right-[12%] z-[1] hidden h-[92%] w-[43%] rounded-l-[12rem] bg-brand-primary lg:block" />
          <div aria-hidden="true" className="pointer-events-none absolute bottom-[12%] right-[-3%] z-[2] hidden h-[51%] w-[53%] rounded-[6rem] border border-brand-primary/55 lg:block" />

          <div className="relative z-10 mx-auto grid min-h-[calc(100svh-7rem)] max-w-[100rem] items-center px-5 sm:px-8 lg:grid-cols-[minmax(0,50fr)_minmax(31rem,50fr)] lg:px-[clamp(2.5rem,5vw,5rem)]">
            <div className="relative z-20 max-w-[46rem] py-12 sm:py-16 lg:py-10 lg:pr-6">
              <div className="mb-8 flex items-center gap-4">
                <span aria-hidden="true" className="h-px w-10 bg-brand-primary" />
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-primary-hover sm:text-sm">
                  Marketing médico
                </p>
              </div>

              <h1 className="max-w-[46rem] text-[clamp(3rem,5.6vw,6rem)] font-bold leading-[0.94] tracking-[-0.055em] text-text-primary">
                Sua autoridade também precisa
                <span className="block text-brand-primary-hover">estar no digital.</span>
              </h1>

              <p className="mt-8 max-w-xl text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
                Estratégia, conteúdo, tecnologia e presença digital para fortalecer sua marca e conectar sua clínica aos pacientes certos.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link className="inline-flex min-h-14 items-center justify-center rounded-full bg-brand-primary px-7 text-center text-sm font-bold text-text-primary transition hover:bg-brand-primary-hover hover:text-text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary" href="/contato">
                  Quero fortalecer minha presença digital
                  <span aria-hidden="true" className="ml-3 text-lg">→</span>
                </Link>
                <Link className="group inline-flex min-h-14 items-center justify-center gap-3 border-b border-brand-primary px-3 text-sm font-bold text-text-primary transition hover:text-brand-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary" href="/#servicos">
                  Conheça nossas soluções
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>

            <div className="relative isolate h-[38rem] self-end sm:h-[48rem] lg:h-[calc(100svh-7rem)] lg:min-h-[680px]">
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-[6%] -right-[32%] z-0 h-[82%] w-[88%] rounded-tl-[10rem] bg-brand-primary sm:-right-[20%] sm:rounded-tl-[14rem] lg:hidden" />
              <div aria-hidden="true" className="pointer-events-none absolute bottom-[8%] right-[-12%] z-10 h-[58%] w-[94%] rounded-[5rem] border border-brand-primary/50 lg:hidden" />
              <Image
                alt="Médica analisando informações em um tablet no consultório"
                className="pointer-events-none absolute bottom-0 right-[-2%] z-20 h-[92%] w-auto max-w-[96vw] object-contain object-bottom sm:right-[2%] sm:h-[94%] lg:right-[1%] lg:h-[96%] lg:max-w-[50vw]"
                height={1536}
                priority
                sizes="(max-width: 639px) 96vw, (max-width: 1023px) 88vw, 50vw"
                src="/assets/images/preview/marketing-medico-doctor-v6.png"
                width={1024}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
