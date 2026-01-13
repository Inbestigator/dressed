import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Dressed",
    template: "%s - Dressed",
  },
  openGraph: { images: ["/dressed_small.webp"] },
  twitter: { card: "summary" },
  description: "A sleek, serverless-ready Discord bot framework.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} flex min-h-dvh flex-col antialiased`}>
        {children}
        <footer className="flex h-8 justify-end gap-8 px-8 text-muted-foreground text-sm">
          <Link href="/docs" className="hover:underline">
            Docs
          </Link>
          <Link href="https://github.com/Inbestigator/dressed" target="_blank" className="hover:underline">
            GitHub
          </Link>
          <Link href="https://discord.gg/AJTkvuCpZu" target="_blank" className="hover:underline">
            Discord
          </Link>
        </footer>
      </body>
    </html>
  );
}
