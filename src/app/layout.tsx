import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
