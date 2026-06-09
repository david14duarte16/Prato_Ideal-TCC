import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import AuthProvider from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

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
import AccessibilityPanel from "@/components/accessibility/AccessibilityPanel";
import AriaAnnouncer from "@/components/accessibility/AriaAnnouncer";
import ToastContainer from "@/components/ui/Toast";
import { AuthModalProvider } from "@/components/providers/AuthModalProvider";
import { FavoritesProvider } from "@/components/providers/FavoritesProvider";

import CookieBanner from "@/components/layout/CookieBanner";
import { MapProvider } from "@/components/providers/MapProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <a href="#main-content" className="skip-link">Pular para o conteúdo principal</a>
        <AuthProvider>
          <AuthModalProvider>
            <FavoritesProvider>
              <MapProvider>
                <Navbar />
              <main id="main-content" className="grow" tabIndex={-1}>
                {children}
              </main>
              <Footer />
              <AccessibilityPanel />
              <CookieBanner />
              <AriaAnnouncer />
                <ToastContainer />
              </MapProvider>
            </FavoritesProvider>
          </AuthModalProvider>
        </AuthProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}
