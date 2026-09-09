import Image from "next/image";
import Link from "next/link";

const navigation = [
  { href: "/#inicio", label: "Home" },
  { href: "/#sobre", label: "Quem somos" },
  { href: "/#portfolio", label: "Portfólio" },
  { href: "/#servicos", label: "Serviços" },
  { href: "/#contato", label: "Contatos" },
];

export function Header() {
  return (
    <header className="header-reveal absolute inset-x-0 top-0 z-30 bg-gradient-to-b from-text-inverse/20 to-transparent">
      <div className="mx-auto flex min-h-24 max-w-[100rem] items-center justify-between px-5 sm:min-h-28 sm:px-8 lg:px-[clamp(2.5rem,5vw,5rem)]">
        <Link className="flex items-center" href="/">
          <Image
            alt="Integrando Negócios"
            className="h-[2.625rem] w-auto sm:h-[3.15rem] lg:h-[3.675rem]"
            height={220}
            priority
            src="/logo.png"
            width={460}
          />
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-5 lg:flex xl:gap-8">
          {navigation.map((item, index) => (
            <a className={`group relative py-3 text-xs font-semibold uppercase tracking-[0.12em] text-text-primary transition hover:text-brand-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-text-primary ${index === 0 ? "after:scale-x-100" : ""} after:absolute after:bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-brand-primary after:transition-transform hover:after:scale-x-100`} href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <details className="group relative lg:hidden">
          <summary aria-label="Abrir menu de navegação" className="flex size-11 cursor-pointer list-none items-center justify-center rounded-md text-text-primary marker:content-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-text-primary">
            <span className="grid gap-1.5">
              <span className="block h-0.5 w-7 bg-current" />
              <span className="block h-0.5 w-7 bg-current" />
              <span className="block h-0.5 w-7 bg-current" />
            </span>
          </summary>
          <nav aria-label="Navegação móvel" className="absolute right-0 top-14 w-64 rounded-xl border border-text-inverse/20 bg-surface-inverse/95 p-3 shadow-xl backdrop-blur">
            {navigation.map((item) => (
              <a className="block rounded-lg px-4 py-3 text-sm font-medium text-text-inverse transition hover:bg-brand-primary/15 focus-visible:bg-brand-primary/15 focus-visible:outline-none" href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
