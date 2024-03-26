import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const openSans = Open_Sans({ subsets: ["latin"] });

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
          "flex min-h-full flex-col bg-white dark:bg-gray-950",
          openSans.className,
        )}
      >
        {children}
      </body>
    </html>
  );
}
