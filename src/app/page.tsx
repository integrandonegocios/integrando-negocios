import { Footer } from "@/components/home/footer";
import { connection } from "next/server";
import { Header } from "@/components/home/header";
import { Hero } from "@/components/home/hero";
import { ContactCta, Differentials, Portfolio, Services } from "@/components/home/sections";

import { canonical } from "@/lib/site-url";

export const metadata = { alternates: canonical("/") };

export default async function Home() {
  await connection();
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Differentials />
        <Portfolio />
        <ContactCta />
      </main>
      <Footer />
    </>
  );
}
