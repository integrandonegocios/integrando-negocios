import Link from "next/link";
import { ServiceIcon, type ServiceIconName } from "./service-icon";
import { PortfolioShowcase } from "./portfolio-showcase";
import { db } from "@/lib/db";
import { getPublishedPortfolioProjects } from "@/lib/portfolio";

const services = [
  { title: "Inteligência Artificial", description: "Aplicações de IA para produtividade, automação, análise e novas soluções digitais.", icon: "ai", href: "/preview/inteligencia-artificial" },
  { title: "Sites e Landing Pages", description: "Sites modernos e páginas estratégicas para fortalecer sua presença digital, divulgar serviços e gerar conversões.", icon: "site", href: "/preview/sites-sistemas-web" },
  { title: "Marketing e Redes Sociais", description: "Estratégia, conteúdo e presença digital para fortalecer marcas, aproximar clientes e gerar oportunidades.", icon: "marketing", href: "/contato" },
  { title: "Identidade Visual", description: "Construção de uma identidade profissional e consistente para sua marca.", icon: "identity", href: "/contato" },
  { title: "Sistemas Web", description: "Sistemas personalizados desenvolvidos para processos e necessidades específicas.", icon: "systems", href: "/preview/sites-sistemas-web" },
] as const;

export async function Services() {
  const managed = await db.service.findMany({ where: { active: true }, orderBy: [{ position: "asc" }, { title: "asc" }] }).catch(() => []);
  const displayServices = services.map((service) => {
    const override = managed.find((item) => item.title.toLocaleLowerCase("pt-BR") === service.title.toLocaleLowerCase("pt-BR"));
    return { ...service, description: override?.description || service.description, icon: override?.icon || service.icon };
  });
  const primaryService = displayServices[0];
  const complementaryServices = displayServices.slice(1);
  const complementaryStyles = [
    "bg-surface text-text-primary",
    "bg-brand-primary-subtle text-text-primary",
    "bg-surface-inverse text-text-inverse",
    "bg-surface-inverse-elevated text-text-inverse",
  ];

  return (
    <section className="scroll-mt-24 bg-background-secondary py-20 sm:py-28 lg:py-32" id="servicos">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-brand-accent">Serviços</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">Soluções digitais para o seu negócio.</h2>
          </div>
          <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">Estratégia, design e tecnologia para transformar ideias em soluções digitais profissionais.</p>
        </div>
        <div className="mt-14 overflow-hidden rounded-xl border border-border bg-border shadow-lg shadow-text-primary/[0.04] lg:mt-16 lg:grid lg:min-h-[44rem] lg:grid-cols-[1.35fr_1fr]">
          <article className="group relative flex min-h-[32rem] flex-col overflow-hidden bg-brand-primary p-8 text-text-primary transition duration-300 hover:bg-brand-primary-hover hover:text-text-inverse sm:p-10 lg:min-h-full lg:p-12" data-service-slug="inteligência-artificial">
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full border border-text-primary/10 bg-text-inverse/10" />
            <div className="relative flex items-start justify-between gap-6">
              <div className="origin-top-left scale-125"><ServiceIcon name={primaryService.icon as ServiceIconName} /></div>
              <span className="text-xs font-bold uppercase tracking-[.16em] opacity-65">Serviço principal</span>
            </div>
            <div className="relative mt-auto max-w-xl pt-24">
              <h3 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">{primaryService.title}</h3>
              <p className="mt-5 max-w-lg text-base leading-7 opacity-80 sm:text-lg">{primaryService.description}</p>
              <Link className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-bold focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current" href={primaryService.href}>
                Explorar solução <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </article>

          <div className="grid gap-px md:grid-cols-2">
            {complementaryServices.map((service, index) => {
              const dark = index >= 2;
              return (
                <article className={`group flex min-h-56 flex-col p-6 transition duration-300 hover:relative hover:z-10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-text-primary/10 sm:p-7 ${complementaryStyles[index]}`} data-service-slug={service.title.toLocaleLowerCase("pt-BR").replaceAll(" ", "-")} key={service.title}>
                  <div className="flex items-start justify-between gap-4">
                    <ServiceIcon name={service.icon as ServiceIconName} />
                    <span className={`text-xs font-semibold tabular-nums ${dark ? "text-text-inverse-muted" : "text-text-muted"}`}>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="mt-auto pt-8">
                    <h3 className="text-lg font-semibold tracking-tight">{service.title}</h3>
                    <p className={`mt-2 text-sm leading-6 ${dark ? "text-text-inverse-muted" : "text-text-secondary"}`}>{service.description}</p>
                    <Link className="mt-4 inline-flex w-fit items-center gap-2 text-xs font-semibold focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary" href={service.href}>
                      Saiba mais <span aria-hidden="true" className="text-brand-primary transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Differentials() {
  const items = [["Visão integrada", "Marca, comunicação e tecnologia trabalhando na mesma direção."], ["Soluções sob medida", "Cada decisão parte do momento e dos objetivos da sua empresa."], ["Parceria próxima", "Um processo claro, colaborativo e orientado a prioridades reais."]];
  return <section className="scroll-mt-24 bg-background-secondary py-20 sm:py-28" id="sobre"><div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-20"><div><p className="text-sm font-bold uppercase tracking-[.16em] text-brand-accent">Por que integrar</p><h2 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Mais clareza para transformar o digital em avanço.</h2></div><div className="grid gap-5">{items.map(([title, description], index) => <article className="flex gap-5 border-b border-border-strong pb-5 last:border-0" key={title}><span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-primary text-sm font-bold text-text-primary">0{index + 1}</span><div><h3 className="text-lg font-bold text-text-primary">{title}</h3><p className="mt-1 leading-7 text-text-secondary">{description}</p></div></article>)}</div></div></section>;
}

export async function Portfolio() {
  const managedProjects = await getPublishedPortfolioProjects(3);

  return (
    <section className="scroll-mt-24 bg-background py-20 sm:py-28 lg:py-32" id="portfolio">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-12 max-w-3xl sm:mb-16">
          <p className="text-sm font-bold uppercase tracking-[.18em] text-brand-accent">Cases</p>
          <h2 className="mt-5 text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-text-primary sm:text-5xl lg:text-6xl">Projetos que transformam ideias em resultados.</h2>
        </div>
        <PortfolioShowcase enableLightbox limit={3} managedProjects={managedProjects} />
        <div className="mt-10 flex justify-center">
          <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border-strong bg-surface px-6 text-sm font-semibold text-text-primary transition hover:-translate-y-0.5 hover:border-brand-primary hover:text-brand-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary" href="/projetos">
            Ver todos os projetos <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ContactCta() {
  return <section className="scroll-mt-24 bg-surface py-20 sm:py-28" id="contato"><div className="mx-auto max-w-5xl px-5 text-center sm:px-8"><p className="text-sm font-bold uppercase tracking-[.16em] text-brand-accent">Vamos conversar</p><h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight text-text-primary sm:text-5xl">Seu próximo passo digital pode começar agora.</h2><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-text-secondary">Conte o que sua empresa precisa. Vamos entender o cenário e construir o caminho mais adequado.</p><a className="mt-9 inline-flex rounded-full bg-brand-primary px-7 py-3.5 font-semibold text-text-primary transition hover:bg-brand-primary-hover hover:text-text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary" href="/contato">Solicitar um orçamento</a></div></section>;
}
