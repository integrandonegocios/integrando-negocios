"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  { id: "slide-1", image: "/assets/images/wal.png", type: "image" },
  { id: "slide-2", type: "inteligencia-artificial" },
  { id: "slide-4", type: "marketing-medico" },
  { id: "slide-5", image: "/assets/images/wal.png", type: "image" },
  { id: "slide-6", type: "sites-sistemas-web" },
] as const;

function SitesDesktopProduct() {
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

function SitesMobileProduct() {
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

function SitesSistemasWebSlide() {
  return (
    <div className="relative isolate min-h-full overflow-hidden bg-background pt-24 sm:pt-28">
      <div aria-hidden="true" className="pointer-events-none absolute -right-[14%] top-[4%] h-[88%] w-[52%] rounded-l-[12rem] bg-brand-primary-subtle lg:block" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[9%] right-[-8%] h-[44%] w-[48%] rounded-[6rem] border border-brand-primary/30 lg:block" />

      <div className="relative z-10 mx-auto grid min-h-[calc(max(100svh,50rem)-7rem)] max-w-[100rem] items-center px-5 sm:px-8 lg:grid-cols-[minmax(0,47fr)_minmax(34rem,53fr)] lg:px-[clamp(2.5rem,5vw,5rem)]">
        <div className="relative z-20 max-w-[44rem] py-14 sm:py-18 lg:pb-24 lg:pt-16">
          <div className="mb-8 flex items-center gap-4">
            <span aria-hidden="true" className="h-px w-10 shrink-0 bg-brand-primary" />
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-primary-hover sm:text-sm">Sites &amp; sistemas web</p>
          </div>

          <h2 className="max-w-[44rem] text-[clamp(3rem,5.2vw,5.85rem)] font-bold leading-[0.94] tracking-[-0.055em] text-text-primary">
            Transformamos ideias em
            <span className="block text-brand-primary-hover">soluções digitais.</span>
          </h2>

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

        <div aria-label="Notebook e smartphone exibindo uma solução digital responsiva" className="relative isolate min-h-[36rem] self-end sm:min-h-[47rem] lg:min-h-[calc(max(100svh,50rem)-7rem)]" role="img">
          <div className="absolute left-[1%] top-[12%] z-10 w-[96%] -rotate-2 sm:left-[4%] sm:w-[91%] lg:left-[2%] lg:top-[16%] lg:w-[96%]">
            <div className="rounded-[1.6rem] bg-surface-inverse p-[0.65rem] shadow-2xl shadow-text-primary/15">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1rem] bg-surface">
                <SitesDesktopProduct />
              </div>
            </div>
            <div className="relative mx-auto h-5 w-[106%] -translate-x-[3%] rounded-b-[2rem] bg-surface-inverse-elevated shadow-lg shadow-text-primary/10">
              <div className="mx-auto h-1.5 w-[15%] rounded-b-lg bg-text-muted/40" />
            </div>
          </div>

          <div className="absolute bottom-[5%] right-[0%] z-20 w-[25%] rotate-2 rounded-[2rem] bg-surface-inverse p-[0.42rem] shadow-2xl shadow-text-primary/20 sm:right-[3%] sm:w-[22%] lg:bottom-[9%] lg:right-[-1%] lg:w-[24%]">
            <div className="relative aspect-[9/19] overflow-hidden rounded-[1.6rem] bg-surface">
              <div className="absolute left-1/2 top-1.5 z-10 h-2 w-[34%] -translate-x-1/2 rounded-full bg-surface-inverse" />
              <SitesMobileProduct />
            </div>
          </div>

          <div className="absolute bottom-[5%] left-[2%] z-30 flex flex-wrap gap-2 sm:bottom-[8%] lg:bottom-[12%] lg:left-[8%]">
            {["Responsivo", "Performance", "Sob medida"].map((label) => (
              <span className="rounded-full border border-border bg-surface/90 px-3 py-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-text-secondary shadow-sm backdrop-blur-sm" key={label}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InteligenciaArtificialSlide() {
  return (
    <div className="relative min-h-full bg-surface-inverse">
      <div aria-hidden="true" className="h-24 bg-background sm:h-28" />

      <div className="relative isolate min-h-[calc(max(100svh,50rem)-6rem)] overflow-hidden bg-surface-inverse sm:min-h-[calc(max(100svh,50rem)-7rem)]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-[10%] top-[6%] size-[34rem] rounded-full bg-brand-primary/[0.07] blur-3xl lg:size-[52rem]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-text-inverse/10" />

        <div className="relative z-10 mx-auto grid min-h-[calc(max(100svh,50rem)-6rem)] max-w-[100rem] px-5 sm:min-h-[calc(max(100svh,50rem)-7rem)] sm:px-8 lg:grid-cols-[minmax(0,58fr)_minmax(29rem,42fr)] lg:px-[clamp(2.5rem,5vw,5rem)]">
          <div className="relative z-20 flex max-w-[54rem] flex-col justify-center py-16 sm:py-20 lg:pb-28 lg:pt-20">
            <div className="mb-9 flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-10 shrink-0 bg-brand-primary" />
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.21em] text-brand-primary sm:text-sm sm:tracking-[0.24em]">
                Inteligência artificial para negócios
              </p>
            </div>

            <h2 className="max-w-[54rem] text-[clamp(3.15rem,5.65vw,6.35rem)] font-bold leading-[0.92] tracking-[-0.058em] text-text-inverse">
              Inteligência para transformar processos em
              <span className="text-brand-primary"> resultados.</span>
            </h2>

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
      </div>
    </div>
  );
}

function MarketingMedicoSlide() {
  return (
    <div className="relative isolate min-h-full overflow-hidden bg-background pt-24 sm:pt-28">
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

      <div className="relative z-10 mx-auto grid min-h-[calc(max(100svh,50rem)-7rem)] max-w-[100rem] items-center px-5 sm:px-8 lg:grid-cols-[minmax(0,50fr)_minmax(31rem,50fr)] lg:px-[clamp(2.5rem,5vw,5rem)]">
        <div className="relative z-20 max-w-[46rem] py-12 sm:py-16 lg:py-10 lg:pr-6">
          <div className="mb-8 flex items-center gap-4">
            <span aria-hidden="true" className="h-px w-10 bg-brand-primary" />
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-primary-hover sm:text-sm">Marketing médico</p>
          </div>
          <h2 className="max-w-[46rem] text-[clamp(3rem,5.6vw,6rem)] font-bold leading-[0.94] tracking-[-0.055em] text-text-primary">
            Sua autoridade também precisa
            <span className="block text-brand-primary-hover">estar no digital.</span>
          </h2>
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

        <div className="relative isolate h-[38rem] self-end sm:h-[48rem] lg:h-[calc(max(100svh,50rem)-7rem)] lg:min-h-[680px]">
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-[6%] -right-[32%] z-0 h-[82%] w-[88%] rounded-tl-[10rem] bg-brand-primary sm:-right-[20%] sm:rounded-tl-[14rem] lg:hidden" />
          <div aria-hidden="true" className="pointer-events-none absolute bottom-[8%] right-[-12%] z-10 h-[58%] w-[94%] rounded-[5rem] border border-brand-primary/50 lg:hidden" />
          <Image
            alt="Médica analisando informações em um tablet"
            className="pointer-events-none absolute bottom-0 right-[-2%] z-20 h-[92%] w-auto max-w-[96vw] object-contain object-bottom sm:right-[2%] sm:h-[94%] lg:right-[1%] lg:h-[96%] lg:max-w-[50vw]"
            height={1536}
            priority
            sizes="(max-width: 639px) 96vw, (max-width: 1023px) 88vw, 50vw"
            src="/assets/images/preview/marketing-medico-doctor-v6.png"
            width={1024}
          />
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  const previousSlide = () => setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  const nextSlide = () => setActiveSlide((current) => (current + 1) % slides.length);

  return (
    <section aria-label="Destaques" className="hero-banner relative min-h-[78rem] overflow-hidden bg-surface-inverse lg:min-h-[max(100svh,50rem)]" id="inicio">
      {slides.map((slide, index) => (
        <div aria-hidden={index !== activeSlide} className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${index === activeSlide ? "opacity-100" : "pointer-events-none opacity-0"}`} inert={index !== activeSlide ? true : undefined} key={slide.id}>
          {slide.type === "inteligencia-artificial" ? (
            <InteligenciaArtificialSlide />
          ) : slide.type === "marketing-medico" ? (
            <MarketingMedicoSlide />
          ) : slide.type === "sites-sistemas-web" ? (
            <SitesSistemasWebSlide />
          ) : (
            <Image alt="" className="object-cover object-center" fill priority={index === 0} sizes="100vw" src={slide.image} />
          )}
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-4 sm:bottom-8">
        <button aria-label="Slide anterior" className="grid size-10 place-items-center rounded-full bg-surface-inverse-deep/35 text-lg text-text-inverse backdrop-blur-sm transition hover:bg-surface-inverse-deep/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-inverse" onClick={previousSlide} type="button">←</button>
        <div aria-label={`Slide ${activeSlide + 1} de ${slides.length}`} className="flex items-center gap-2" role="group">
          {slides.map((slide, index) => (
            <button aria-label={`Ir para o slide ${index + 1}`} aria-pressed={index === activeSlide} className={`h-2 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-text-inverse ${index === activeSlide ? "w-8 bg-text-inverse" : "w-2 bg-text-inverse/55 hover:bg-text-inverse"}`} key={slide.id} onClick={() => setActiveSlide(index)} type="button" />
          ))}
        </div>
        <button aria-label="Próximo slide" className="grid size-10 place-items-center rounded-full bg-surface-inverse-deep/35 text-lg text-text-inverse backdrop-blur-sm transition hover:bg-surface-inverse-deep/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-inverse" onClick={nextSlide} type="button">→</button>
      </div>
    </section>
  );
}
