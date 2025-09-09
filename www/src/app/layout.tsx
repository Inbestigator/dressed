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
  title: "Dressed",
  description: "A sleek, serverless-ready Discord bot framework.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh flex flex-col`}
      >
        {children}
        <footer className="text-sm text-muted-foreground h-8 mt-auto gap-8 flex justify-end px-8">
          <Link href="/docs" className="hover:underline">
            Docs
          </Link>
          <Link
            href="https://github.com/Inbestigator/dressed"
            target="_blank"
            className="hover:underline"
          >
            GitHub
          </Link>
          <Link
            href="https://discord.gg/Crj9wW863c"
            target="_blank"
            className="hover:underline"
          >
            Discord
          </Link>
        </footer>
      </body>
    </html>
  );
}
