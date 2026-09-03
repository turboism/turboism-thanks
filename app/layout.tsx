import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thanks.turboism.dev"),
  title: "Turboism Thanks",
  description: "A public record of gratitude to the people who have shaped Turboism.",
  alternates: {
    canonical: "/thanks",
  },
  openGraph: {
    title: "Turboism Thanks",
    description: "A public record of gratitude to the people who have shaped Turboism.",
    url: "https://turboism.dev/thanks",
    siteName: "Turboism Thanks",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
