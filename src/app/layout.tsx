import type { Metadata } from "next";
import { Fraunces, Outfit, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const body = Outfit({ subsets: ["latin"], variable: "--font-body" });
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Cap — the agent cannot exceed it",
  description:
    "Crypto World's Fair. Harbor Labs opens an $8 Solana payment channel. Scout buys Hyperliquid marks off-chain. One settlement. Unused USDC returns.",
  icons: { icon: "/logo.png" },
};

const logoSrc = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.png`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        <header className="wrap site-header">
          <Link href="/" className="brand">
            <img src={logoSrc} alt="" width={36} height={36} />
            C<em>ap</em>
          </Link>
          <nav className="nav">
            <Link href="/desk">Desk</Link>
            <Link href="/how">How the cap holds</Link>
            <Link href="/pitch">Pitch</Link>
            <Link href="/open">Open</Link>
          </nav>
        </header>
        {children}
        <footer className="wrap site-footer">
          <span>Crypto World’s Fair · Solana + Hyperliquid</span>
          <span>Scout can call. Priya holds the cap.</span>
        </footer>
      </body>
    </html>
  );
}
