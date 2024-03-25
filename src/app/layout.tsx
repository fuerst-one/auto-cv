import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import clsx from "clsx";
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
        className={clsx(
          "flex min-h-full flex-col bg-white dark:bg-gray-950",
          openSans.className,
        )}
      >
        {children}
      </body>
    </html>
  );
}
