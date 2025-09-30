import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
});

export const metadata: Metadata = {
  title: "Alexander Fuerst - Fuerst.one Auto-CV",
  description: "Alexander Fuerst's auto-generated CV & Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "relative flex min-h-full flex-col bg-background text-foreground antialiased",
          grotesk.className,
          grotesk.variable,
          plexMono.variable,
        )}
      >
        {children}
      </body>
    </html>
  );
}
