import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/home/header";

export const metadata: Metadata = {
  title: "Preview — Inteligência Artificial para Negócios",
  robots: { index: false, follow: false },
};

export default function InteligenciaArtificialPreviewPage() {
  return (
    <>
      <Header />
      <main className="min-h-svh bg-surface-inverse">
        <div aria-hidden="true" className="h-24 bg-background sm:h-28" />

        <section className="relative isolate min-h-[calc(100svh-6rem)] overflow-hidden bg-surface-inverse sm:min-h-[calc(100svh-7rem)]">
          <div aria-hidden="true" className="pointer-events-none absolute -right-[10%] top-[6%] size-[34rem] rounded-full bg-brand-primary/[0.07] blur-3xl lg:size-[52rem]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-text-inverse/10" />

          <div className="relative z-10 mx-auto grid min-h-[calc(100svh-6rem)] max-w-[100rem] px-5 sm:min-h-[calc(100svh-7rem)] sm:px-8 lg:grid-cols-[minmax(0,58fr)_minmax(29rem,42fr)] lg:px-[clamp(2.5rem,5vw,5rem)]">
            <div className="relative z-20 flex max-w-[54rem] flex-col justify-center py-16 sm:py-20 lg:pb-28 lg:pt-20">
              <div className="mb-9 flex items-center gap-4">
                <span aria-hidden="true" className="h-px w-10 shrink-0 bg-brand-primary" />
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.21em] text-brand-primary sm:text-sm sm:tracking-[0.24em]">
                  Inteligência artificial para negócios
                </p>
              </div>

              <h1 className="max-w-[54rem] text-[clamp(3.15rem,5.65vw,6.35rem)] font-bold leading-[0.92] tracking-[-0.058em] text-text-inverse">
                Inteligência para transformar processos em
                <span className="text-brand-primary"> resultados.</span>
              </h1>

              <p className="mt-9 max-w-2xl text-base leading-7 text-text-inverse-muted sm:text-lg sm:leading-8">
                Soluções de IA para automatizar processos, otimizar rotinas e ampliar a produtividade da sua empresa.
              </p>

              <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link className="inline-flex min-h-14 items-center justify-center rounded-full bg-brand-primary px-7 text-center text-sm font-bold text-text-primary transition hover:bg-brand-primary-hover hover:text-text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary" href="/#servicos">
                  Conheça nossas soluções
                  <span aria-hidden="true" className="ml-3 text-lg">→</span>
                </Link>
                <Link className="group inline-flex min-h-14 items-center justify-center gap-3 px-6 text-sm font-bold text-text-inverse transition hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-inverse" href="/contato">
                  Fale com um especialista
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>

            <div aria-label="Fluxo abstrato representando processos conectados a resultados" className="relative isolate min-h-[32rem] self-end sm:min-h-[40rem] lg:min-h-full" role="img">
              <div aria-hidden="true" className="absolute bottom-[12%] right-[-36%] aspect-square w-[115%] rounded-full border border-text-inverse/10 sm:right-[-22%] lg:bottom-[8%] lg:right-[-32%] lg:w-[128%]" />
              <div aria-hidden="true" className="absolute bottom-[20%] right-[-17%] aspect-square w-[84%] rounded-[28%] border border-text-inverse/15 bg-surface-inverse-elevated/45 sm:right-[-6%] lg:bottom-[16%] lg:right-[-15%] lg:w-[92%]" />
              <div aria-hidden="true" className="absolute bottom-[29%] right-[3%] aspect-square w-[55%] rounded-[32%] border border-text-inverse/10 bg-surface-inverse-elevated/75 shadow-2xl shadow-surface-inverse-deep/35 lg:bottom-[25%] lg:right-[1%] lg:w-[61%]" />

              <div aria-hidden="true" className="absolute bottom-[47%] left-[-18%] right-[-24%] z-10 h-px bg-brand-primary/75 sm:left-[-12%] lg:bottom-[44%] lg:left-[-29%]" />
              <div aria-hidden="true" className="absolute bottom-[47%] left-[-18%] z-20 size-3 -translate-y-[calc(50%-0.5px)] rounded-full border border-brand-primary bg-surface-inverse shadow-[0_0_0_0.45rem_var(--color-surface-inverse)] sm:left-[-12%] lg:bottom-[44%] lg:left-[-29%]" />
              <div aria-hidden="true" className="absolute bottom-[47%] right-[16%] z-20 size-5 -translate-y-[calc(50%-0.5px)] rounded-full bg-brand-primary shadow-[0_0_0_0.65rem_var(--color-surface-inverse-elevated)] lg:bottom-[44%] lg:right-[17%]" />

              <div aria-hidden="true" className="absolute bottom-[31%] right-[12%] z-10 h-[32%] w-[22%] rounded-[2.5rem] bg-brand-primary lg:bottom-[27%] lg:right-[11%] lg:h-[35%]" />
              <div aria-hidden="true" className="absolute bottom-[35%] right-[16%] z-20 h-[24%] w-px bg-text-primary/25 lg:bottom-[31%]" />
            </div>
          </div>

          <p className="absolute bottom-7 left-5 z-20 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-text-inverse/35 sm:left-8 lg:left-[clamp(2.5rem,5vw,5rem)]">
            Estratégia · Automação · Produtividade
          </p>
        </section>
      </main>
    </>
  );
}
