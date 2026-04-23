import type { Metadata } from "next";
import { Syne, Outfit, DM_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/context/CartContext";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-display",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
});

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MiniCartDrawer from "@/components/MiniCartDrawer";

export const metadata: Metadata = {
  title: {
    default: "Lagos Boy Wears — EST. 2024",
    template: "%s | Lagos Boy Wears",
  },
  description:
    "Premium streetwear rooted in Lagos urban culture. Dressed in Code. Build Sharp. Ship Clean. Dress the City.",
  keywords: ["Lagos", "streetwear", "fashion", "Nigeria", "urban", "clothing"],
  openGraph: {
    title: "Lagos Boy Wears",
    description: "Premium streetwear rooted in Lagos urban culture.",
    type: "website",
    locale: "en_NG",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${outfit.variable} ${dmMono.variable}`}>
      <body>
        <SessionProviderWrapper>
          <CartProvider>
            <Header />
            <main style={{ minHeight: "calc(100vh - 72px)" }}>{children}</main>
            <Footer />
            <MiniCartDrawer />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#000",
                  color: "#fff",
                  fontFamily: "Outfit, sans-serif",
                  borderRadius: "0",
                  fontSize: "0.875rem",
                },
              }}
            />
          </CartProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
