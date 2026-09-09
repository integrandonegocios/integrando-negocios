import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/home/header";

export const metadata: Metadata = {
  title: "Preview — Sites & Sistemas Web",
  robots: { index: false, follow: false },
};

function DesktopProduct() {
  return (
    <div className="flex h-full bg-surface text-text-primary">
      <aside className="flex w-[18%] flex-col justify-between border-r border-border bg-brand-primary-subtle p-[4%]">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-brand-primary" />
            <span className="h-1.5 w-12 rounded-full bg-text-primary/80" />
          </div>
          <div className="mt-8 space-y-3">
            <div className="h-6 rounded-md bg-brand-primary/15" />
            <div className="h-1.5 w-3/4 rounded-full bg-text-muted/20" />
            <div className="h-1.5 w-4/5 rounded-full bg-text-muted/20" />
            <div className="h-1.5 w-2/3 rounded-full bg-text-muted/20" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-5 rounded-full bg-text-primary/15" />
          <span className="h-1.5 w-10 rounded-full bg-text-muted/25" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col p-[4%]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[clamp(0.42rem,0.65vw,0.68rem)] font-bold uppercase tracking-[0.2em] text-brand-primary-hover">Visão geral</p>
            <p className="mt-1 text-[clamp(0.7rem,1.25vw,1.35rem)] font-bold">Operação digital</p>
          </div>
          <span className="rounded-full bg-brand-primary px-[4%] py-[2%] text-[clamp(0.38rem,0.55vw,0.6rem)] font-bold">Novo projeto</span>
        </div>

        <div className="mt-[5%] grid flex-1 grid-cols-[1.45fr_.55fr] gap-[3%]">
          <div className="flex flex-col justify-between rounded-[clamp(0.8rem,1.5vw,1.6rem)] bg-surface-inverse p-[7%] text-text-inverse">
            <div>
              <p className="text-[clamp(0.42rem,0.65vw,0.68rem)] uppercase tracking-[0.17em] text-text-inverse-muted">Estratégia digital</p>
              <p className="mt-[5%] max-w-[12ch] text-[clamp(0.9rem,1.75vw,1.9rem)] font-bold leading-[1.05]">Crescimento com clareza.</p>
            </div>
            <div className="flex items-end gap-[3%]">
              {[42, 64, 53, 78, 88].map((height, index) => (
                <span className="w-[10%] rounded-t-sm bg-brand-primary" key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>

          <div className="grid grid-rows-2 gap-[7%]">
            <div className="rounded-[clamp(0.7rem,1.25vw,1.3rem)] border border-border bg-background-secondary p-[10%]">
              <span className="block size-7 rounded-full bg-brand-primary-light" />
              <p className="mt-[12%] text-[clamp(0.4rem,0.55vw,0.58rem)] text-text-muted">Eficiência</p>
              <p className="text-[clamp(0.9rem,1.5vw,1.55rem)] font-bold">+38%</p>
            </div>
            <div className="rounded-[clamp(0.7rem,1.25vw,1.3rem)] border border-border bg-surface p-[10%]">
              <p className="text-[clamp(0.4rem,0.55vw,0.58rem)] text-text-muted">Projetos ativos</p>
              <p className="mt-[4%] text-[clamp(0.9rem,1.5vw,1.55rem)] font-bold">12</p>
              <div className="mt-[12%] h-1.5 overflow-hidden rounded-full bg-border">
                <div className="h-full w-3/4 rounded-full bg-brand-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileProduct() {
  return (
    <div className="flex h-full flex-col bg-surface p-[9%] text-text-primary">
      <div className="flex items-center justify-between">
        <span className="size-2.5 rounded-full bg-brand-primary" />
        <span className="h-1 w-8 rounded-full bg-text-muted/20" />
      </div>
      <p className="mt-[16%] text-[0.42rem] font-bold uppercase tracking-[0.18em] text-brand-primary-hover">Visão geral</p>
      <p className="mt-[3%] text-sm font-bold leading-tight">Sua operação em movimento.</p>
      <div className="mt-[12%] rounded-2xl bg-surface-inverse p-[10%] text-text-inverse">
        <p className="text-[0.4rem] text-text-inverse-muted">Produtividade</p>
        <p className="mt-1 text-xl font-bold">+38%</p>
        <div className="mt-5 flex h-12 items-end gap-1.5">
          {[38, 54, 47, 72, 86].map((height, index) => (
            <span className="flex-1 rounded-t-sm bg-brand-primary" key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
      <div className="mt-[8%] grid grid-cols-2 gap-2">
        <div className="h-16 rounded-xl bg-brand-primary-subtle" />
        <div className="h-16 rounded-xl bg-background-secondary" />
      </div>
    </div>
  );
}

export default function SitesSistemasWebPreviewPage() {
  return (
    <>
      <Header />
      <main className="min-h-svh bg-background">
        <section className="relative isolate min-h-svh overflow-hidden bg-background pt-24 sm:pt-28">
          <div aria-hidden="true" className="pointer-events-none absolute -right-[14%] top-[4%] h-[88%] w-[52%] rounded-l-[12rem] bg-brand-primary-subtle lg:block" />
          <div aria-hidden="true" className="pointer-events-none absolute bottom-[9%] right-[-8%] h-[44%] w-[48%] rounded-[6rem] border border-brand-primary/30 lg:block" />

          <div className="relative z-10 mx-auto grid min-h-[calc(100svh-7rem)] max-w-[100rem] items-center px-5 sm:px-8 lg:grid-cols-[minmax(0,47fr)_minmax(34rem,53fr)] lg:px-[clamp(2.5rem,5vw,5rem)]">
            <div className="relative z-20 max-w-[44rem] py-14 sm:py-18 lg:pb-24 lg:pt-16">
              <div className="mb-8 flex items-center gap-4">
                <span aria-hidden="true" className="h-px w-10 shrink-0 bg-brand-primary" />
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-primary-hover sm:text-sm">Sites &amp; sistemas web</p>
              </div>

              <h1 className="max-w-[44rem] text-[clamp(3rem,5.2vw,5.85rem)] font-bold leading-[0.94] tracking-[-0.055em] text-text-primary">
                Transformamos ideias em
                <span className="block text-brand-primary-hover">soluções digitais.</span>
              </h1>

              <p className="mt-8 max-w-xl text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
                Sites, landing pages e sistemas personalizados desenvolvidos para empresas que querem crescer, otimizar processos e fortalecer sua presença digital.
              </p>

              <div className="mt-10">
                <Link className="inline-flex min-h-14 items-center justify-center rounded-full bg-brand-primary px-7 text-center text-sm font-bold text-text-primary transition hover:bg-brand-primary-hover hover:text-text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary" href="/#servicos">
                  Conheça nossas soluções
                  <span aria-hidden="true" className="ml-3 text-lg">→</span>
                </Link>
              </div>
            </div>

            <div aria-label="Notebook e smartphone exibindo uma solução digital responsiva" className="relative isolate min-h-[36rem] self-end sm:min-h-[47rem] lg:min-h-[calc(100svh-7rem)]" role="img">
              <div className="absolute left-[1%] top-[12%] z-10 w-[96%] -rotate-2 sm:left-[4%] sm:w-[91%] lg:left-[2%] lg:top-[16%] lg:w-[96%]">
                <div className="rounded-[1.6rem] bg-surface-inverse p-[0.65rem] shadow-2xl shadow-text-primary/15">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[1rem] bg-surface">
                    <DesktopProduct />
                  </div>
                </div>
                <div className="relative mx-auto h-5 w-[106%] -translate-x-[3%] rounded-b-[2rem] bg-surface-inverse-elevated shadow-lg shadow-text-primary/10">
                  <div className="mx-auto h-1.5 w-[15%] rounded-b-lg bg-text-muted/40" />
                </div>
              </div>

              <div className="absolute bottom-[5%] right-[0%] z-20 w-[25%] rotate-2 rounded-[2rem] bg-surface-inverse p-[0.42rem] shadow-2xl shadow-text-primary/20 sm:right-[3%] sm:w-[22%] lg:bottom-[9%] lg:right-[-1%] lg:w-[24%]">
                <div className="relative aspect-[9/19] overflow-hidden rounded-[1.6rem] bg-surface">
                  <div className="absolute left-1/2 top-1.5 z-10 h-2 w-[34%] -translate-x-1/2 rounded-full bg-surface-inverse" />
                  <MobileProduct />
                </div>
              </div>

              <div className="absolute bottom-[5%] left-[2%] z-30 flex flex-wrap gap-2 sm:bottom-[8%] lg:bottom-[12%] lg:left-[8%]">
                {['Responsivo', 'Performance', 'Sob medida'].map((label) => (
                  <span className="rounded-full border border-border bg-surface/90 px-3 py-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-text-secondary shadow-sm backdrop-blur-sm" key={label}>{label}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
