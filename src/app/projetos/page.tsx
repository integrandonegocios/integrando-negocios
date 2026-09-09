import type { Metadata } from "next";
import { connection } from "next/server";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { PortfolioShowcase } from "@/components/home/portfolio-showcase";
import { getPublishedPortfolioProjects } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Projetos | Integrando Negócios",
  description: "Conheça os projetos desenvolvidos pela Integrando Negócios.",
};

export default async function ProjectsPage() {
  await connection();
  const managedProjects = await getPublishedPortfolioProjects();

  return (
    <>
      <Header />
      <main className="bg-background pt-24 sm:pt-28">
        <section className="py-20 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-12 max-w-3xl sm:mb-16">
              <p className="text-sm font-bold uppercase tracking-[.18em] text-brand-accent">Portfólio</p>
              <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-text-primary sm:text-5xl lg:text-6xl">Todos os projetos realizados.</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">Uma seleção de trabalhos que unem estratégia, design e tecnologia.</p>
            </div>
            <PortfolioShowcase columns={4} enableLightbox managedProjects={managedProjects} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
