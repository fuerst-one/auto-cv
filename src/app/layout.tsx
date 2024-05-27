import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const font = Open_Sans({ subsets: ["latin"] });

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
          "flex min-h-full flex-col bg-white text-black dark:bg-gray-950",
          font.className,
        )}
      >
        {children}
      </body>
    </html>
  );
}
