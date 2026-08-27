import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgressIndicator } from "@/components/ui/ScrollProgressIndicator";
import { DotField } from "@/components/ui/DotField";

import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display geométrica para titulares: el contraste lo da el peso, no la itálica
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Brandon Garcia — Full Stack Developer & AI Engineer",
  description:
    "Portafolio de Brandon Garcia, Full Stack Developer & AI Engineer. Agentes autónomos, RAG, plataformas SaaS multitenant y experiencias web de alto rendimiento.",
  icons: {
    icon: "/perfil.avif",
  },
  openGraph: {
    title: "Brandon Garcia — Full Stack Developer & AI Engineer",
    description:
      "Agentes autónomos, RAG, plataformas SaaS multitenant y experiencias web de alto rendimiento.",
    type: "website",
    locale: "es_BO",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Las variables de next/font van en <html>: @theme las resuelve en :root,
    // si viven en <body> quedan indefinidas y las fuentes no se aplican.
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable}`}
    >
      <body suppressHydrationWarning className="antialiased bg-background text-foreground">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0KDF54NSVZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0KDF54NSVZ');
          `}
        </Script>
        <a
          href="#projects"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:font-bold focus:text-primary-foreground"
        >
          Saltar al contenido
        </a>
        <DotField />
        <ScrollProgressIndicator />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
