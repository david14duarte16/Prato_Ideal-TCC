import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import AuthProvider from "@/components/providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Guia de Restaurantes",
  description: "Encontre os melhores restaurantes perto de você.",
};

import Footer from "@/components/layout/Footer";
import VLibrasWidget from "@/components/accessibility/VLibrasWidget";
import AccessibilityPanel from "@/components/accessibility/AccessibilityPanel";
import AriaAnnouncer from "@/components/accessibility/AriaAnnouncer";
import { AuthModalProvider } from "@/components/providers/AuthModalProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <a href="#main-content" className="skip-link">Pular para o conteúdo principal</a>
        <AuthProvider>
          <AuthModalProvider>
            <Navbar />
            <main id="main-content" className="grow" tabIndex={-1}>
              {children}
            </main>
            <Footer />
            <AccessibilityPanel />
            <VLibrasWidget />
            <AriaAnnouncer />
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
