import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import ClientBoot from "@/components/ClientBoot";
import Nav from "@/components/Nav";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Outfit Assistant",
  description: "Your daily work outfit, picked for the weather.",
  appleWebApp: { capable: true, title: "Outfits", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#15120f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} antialiased`}>
      <body className="min-h-dvh font-sans">
        <main className="mx-auto max-w-xl px-4 pb-28 pt-[max(1.25rem,env(safe-area-inset-top))]">
          {children}
        </main>
        <Nav />
        <ClientBoot />
      </body>
    </html>
  );
}
