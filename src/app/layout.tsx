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
  title: "Prato Ideal",
  description: "Encontre os melhores restaurantes perto de você.",
  icons: {
    icon: "/logo-icon-32.png",
    apple: "/logo-icon-128.png",
  },
};

import Footer from "@/components/layout/Footer";
import VLibrasWidget from "@/components/accessibility/VLibrasWidget";
import AccessibilityPanel from "@/components/accessibility/AccessibilityPanel";
import AriaAnnouncer from "@/components/accessibility/AriaAnnouncer";
import { AuthModalProvider } from "@/components/providers/AuthModalProvider";

import CookieBanner from "@/components/layout/CookieBanner";

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
            <CookieBanner />
            <AriaAnnouncer />
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
