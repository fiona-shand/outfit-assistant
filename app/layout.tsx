import type { Metadata, Viewport } from "next";
import { Caveat, DM_Sans, Instrument_Serif } from "next/font/google";
import ClientBoot from "@/components/ClientBoot";
import Nav from "@/components/Nav";
import "./globals.css";

const sans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const script = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["500", "700"] });

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
    { media: "(prefers-color-scheme: light)", color: "#fbf6ec" },
    { media: "(prefers-color-scheme: dark)", color: "#17140f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${script.variable} antialiased`}>
      <body className="min-h-dvh font-sans">
        <main className="mx-auto max-w-xl px-5 pb-32 pt-[max(1rem,env(safe-area-inset-top))]">{children}</main>
        <Nav />
        <ClientBoot />
      </body>
    </html>
  );
}
