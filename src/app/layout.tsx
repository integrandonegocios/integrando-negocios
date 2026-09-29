import type { Metadata } from "next";
import "./globals.css";
import { siteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  openGraph: { type: "website", locale: "pt_BR", siteName: "Integrando Negócios" },
  title: {
    default: "Integrando Negócios | Soluções digitais para empresas",
    template: "%s | Integrando Negócios",
  },
  description:
    "Soluções digitais para empresas que querem crescer: sites, marketing, design, sistemas, automação e inteligência artificial.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body className="bg-background text-text-primary antialiased">{children}</body>
    </html>
  );
}
