import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Z4 - AI Life Manager",
  description:
    "Your intelligent life manager. Tasks, habits, notes, and AI assistance in one beautiful place.",
  keywords: ["life manager", "tasks", "habits", "notes", "AI", "productivity"],
  openGraph: {
    title: "Z4 - AI Life Manager",
    description:
      "Your intelligent life manager. Tasks, habits, notes, and AI assistance in one beautiful place.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
                                <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}