import { Geist, Geist_Mono } from "next/font/google";
import { Poppins } from "next/font/google";
import "./globals.css";
import ClientProviders from "./ClientProviders";
import { icons } from "lucide-react";
import { LayoutProvider } from '@/contexts/LayoutContext';
import "leaflet/dist/leaflet.css";

// Force all pages to be dynamic (no static generation during build)
export const dynamic = "force-dynamic";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap"
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "XDENTAL",
  description: "Your app description",
  icons: {
    icon: "/XDENTAL.png",
    apple: "/XDENTAL.png",
    shortcut: "/XDENTAL.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <LayoutProvider>
      <html lang="en" className={`${poppins.variable} ${geistSans.variable} ${geistMono.variable} antialiased font-sans`} suppressHydrationWarning>
        <body suppressHydrationWarning>

          <ClientProviders>
            {children}
          </ClientProviders>
        </body>
      </html>
    </LayoutProvider>
  );
}