import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "App Registry — Project Directory",
  description: "A curated directory of projects and applications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-screen flex flex-col bg-[#0c0a09] text-stone-100 antialiased">
        {children}
      </body>
    </html>
  );
}
