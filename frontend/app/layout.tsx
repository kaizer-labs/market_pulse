import "./globals.css";
import type { Metadata } from "next";
import { Orbitron, Space_Grotesk } from "next/font/google";
import { ReactNode } from "react";

const displayFont = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
});

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Financial Market Intelligence",
  description: "Portfolio-first market intelligence platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>{children}</body>
    </html>
  );
}
