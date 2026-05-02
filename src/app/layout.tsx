import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
});

export const metadata: Metadata = {
  title: "Fuerst.one — Alexander Fuerst",
  description:
    "Alexander Fuerst — creative technology, accessible aesthetics, converting interfaces.",
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
          plexMono.className,
          plexMono.variable,
        )}
      >
        {children}
      </body>
    </html>
  );
}
