import type { Metadata } from "next";

import { fontArabic, fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Riyadh Prints",
    template: "%s · Riyadh Prints",
  },
  description: "Printing company in Riyadh, Saudi Arabia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(fontSans.variable, fontArabic.variable, "font-sans")}
    >
      <body>{children}</body>
    </html>
  );
}
