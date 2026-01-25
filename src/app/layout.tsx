import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgressIndicator } from "@/components/ui/ScrollProgressIndicator";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
        <ScrollProgressIndicator />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
