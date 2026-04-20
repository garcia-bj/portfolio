import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgressIndicator } from "@/components/ui/ScrollProgressIndicator";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Portfolio | AI Engineer Brandon Garcia",
  description: "Portfolio of a Senior Full-Stack Developer & AI Engineer specializing in React, Next.js, Python, and AI Agents.",
  icons: {
    icon: "/perfil.avif",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
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
        <ScrollProgressIndicator />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
