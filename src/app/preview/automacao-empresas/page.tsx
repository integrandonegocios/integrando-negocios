import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/home/header";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Preview — Automação para Empresas",
  robots: { index: false, follow: false },
};

const steps = [
  { index: "01", label: "Contato recebido", detail: "Nova solicitação", completed: false },
  { index: "02", label: "Dados organizados", detail: "Processo iniciado", completed: false },
  { index: "03", label: "Ação executada", detail: "Rotina automática", completed: false },
  { index: "04", label: "Concluído", detail: "Resultado entregue", completed: true },
] as const;

export default function AutomacaoEmpresasPreviewPage() {
  return (
    <>
      <Header />
      <main className="min-h-svh bg-brand-primary-subtle">
        <section className="relative isolate min-h-svh overflow-hidden bg-brand-primary-subtle pt-24 sm:pt-28">
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-[52%] -right-[18%] aspect-square w-[72%] rounded-full bg-brand-primary/[0.055]" />
          <div aria-hidden="true" className="pointer-events-none absolute left-[7%] top-[18%] size-2 rounded-full bg-brand-primary/30" />

          <div className="relative z-10 mx-auto flex min-h-[calc(100svh-7rem)] max-w-[100rem] flex-col px-5 pb-20 pt-12 sm:px-8 sm:pb-24 sm:pt-16 lg:px-[clamp(2.5rem,5vw,5rem)] lg:pb-24 lg:pt-14">
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(24rem,.7fr)] lg:gap-16">
              <div>
                <div className="mb-8 flex items-center gap-4">
                  <span aria-hidden="true" className="h-px w-10 shrink-0 bg-brand-primary" />
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-primary-hover sm:text-sm">Automação para empresas</p>
                </div>

                <h1 className="max-w-[17ch] text-[clamp(3.15rem,6vw,6.9rem)] font-bold uppercase leading-[0.88] tracking-[-0.06em] text-text-primary">
                  Menos tarefas manuais.
                  <span className="mt-2 block"><span className="text-brand-primary-hover">Mais tempo</span> para crescer.</span>
                </h1>
              </div>

              <div className="lg:pb-2">
                <p className="max-w-xl text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
                  Automatizamos processos e conectamos ferramentas para tornar a rotina da sua empresa mais simples, rápida e eficiente.
                </p>
                <Link className="mt-8 inline-flex min-h-14 items-center justify-center rounded-full bg-brand-primary px-7 text-center text-sm font-bold text-text-primary transition hover:bg-brand-primary-hover hover:text-text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary" href="/contato">
                  Descubra o que podemos automatizar
                  <span aria-hidden="true" className="ml-3 text-lg">→</span>
                </Link>
              </div>
            </div>

            <div aria-label="Fluxo de automação: um contato é recebido, os dados são organizados, a ação é executada e o processo é concluído" className={`${styles.flow} mt-16 grid flex-1 content-center gap-5 md:grid-cols-4 md:gap-7 lg:mt-12`} role="img">
              {steps.map((step, index) => (
                <div className={`${styles.step} relative z-10 pl-14 md:pl-0 ${index % 2 === 0 ? "md:-translate-y-8" : "md:translate-y-8"}`} key={step.index}>
                  <span aria-hidden="true" className="absolute left-[0.86rem] top-8 size-3 rounded-full border-[3px] border-brand-primary-subtle bg-brand-primary shadow-[0_0_0_0.45rem_var(--color-brand-primary-subtle)] md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2" />
                  <div className={`min-h-28 rounded-3xl border px-5 py-5 shadow-sm md:min-h-32 ${step.completed ? "border-brand-primary/30 bg-brand-primary text-text-primary" : "border-border bg-surface/85 text-text-primary backdrop-blur-sm"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <span className={`text-[0.65rem] font-bold tracking-[0.18em] ${step.completed ? "text-text-primary/60" : "text-text-muted"}`}>{step.index}</span>
                      {step.completed ? (
                        <span aria-hidden="true" className={`${styles.check} grid size-8 place-items-center rounded-full bg-text-primary text-sm text-text-inverse`}>✓</span>
                      ) : (
                        <span aria-hidden="true" className="size-2 rounded-full bg-brand-primary/60" />
                      )}
                    </div>
                    <p className="mt-4 text-sm font-bold sm:text-base">{step.label}</p>
                    <p className={`mt-1 text-xs ${step.completed ? "text-text-primary/65" : "text-text-muted"}`}>{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex items-center justify-between border-t border-brand-primary/15 pt-5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-text-muted">
              <span>A tecnologia trabalha</span>
              <span className="text-brand-primary-hover">Sua empresa avança</span>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
