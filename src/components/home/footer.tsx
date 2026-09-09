import Image from "next/image";
import Link from "next/link";

function InstagramIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect height="18" rx="5" width="18" x="3" y="3" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" fill="currentColor" r="1" stroke="none" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.7a8.5 8.5 0 1 1 16.2-4.1Z" />
      <path d="M8.2 7.8c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .5.4l.8 1.9c.1.3 0 .5-.1.7l-.6.8c-.2.2-.1.4 0 .6.7 1.2 1.7 2.2 3 2.8.2.1.4.1.6-.1l.9-1.1c.2-.2.4-.3.7-.2l1.9.9c.3.1.5.3.5.5 0 .3-.1 1.4-.8 2-.7.6-1.6.9-2.6.6-1-.3-2.3-.8-3.9-2.2-1.3-1.1-2.2-2.5-2.5-3-.3-.6-1.5-3 .4-4.2Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background-secondary">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Link className="flex items-center" href="/">
              <Image alt="Integrando Negócios" className="h-[2.625rem] w-auto" height={220} src="/logo.png" width={460} />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-text-secondary">Soluções digitais para empresas que querem crescer.</p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-text-primary">Navegação</h2>
            <ul className="mt-4 space-y-2 text-sm text-text-secondary">
              <li><Link className="hover:text-brand-primary-hover" href="/#servicos">Serviços</Link></li>
              <li><Link className="hover:text-brand-primary-hover" href="/#portfolio">Portfólio</Link></li>
              <li><Link className="hover:text-brand-primary-hover" href="/#sobre">Sobre</Link></li>
              <li><Link className="hover:text-brand-primary-hover" href="/#contato">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-text-primary">Contato</h2>
            <p className="mt-4 text-sm leading-6 text-text-secondary">Quer conversar sobre uma solução para sua empresa?</p>
            <a className="mt-3 inline-block text-sm font-semibold text-brand-primary-hover hover:text-brand-accent" href="/contato">Solicitar orçamento →</a>
            <div className="mt-6 flex items-center gap-3">
              <a aria-label="Acessar Instagram da Integrando Negócios" className="grid size-11 place-items-center rounded-lg border border-border bg-surface text-text-primary transition hover:-translate-y-0.5 hover:border-brand-primary hover:text-brand-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary" href="https://instagram.com/integrandonegocios.oficial" rel="noreferrer" target="_blank">
                <InstagramIcon />
              </a>
              <a aria-label="Conversar com a Integrando Negócios pelo WhatsApp" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#25d366] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1ebe5d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25d366]" href="https://wa.me/5585988952760" rel="noreferrer" target="_blank">
                <WhatsAppIcon />
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-sm text-text-muted sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Integrando Negócios. Todos os direitos reservados.</p>
          <p>Feito para negócios em movimento.</p>
        </div>
      </div>
    </footer>
  );
}
