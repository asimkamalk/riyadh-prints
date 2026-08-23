import type { Metadata } from "next";

import { fontArabic, fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { SiteGraphJsonLd } from "@/components/seo/site-graph";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { rootLayoutMetadata } from "@/lib/seo/metadata";

import "./globals.css";

export const metadata: Metadata = rootLayoutMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(fontSans.variable, fontArabic.variable, "font-sans")}
    >
      <body suppressHydrationWarning>
        <SiteGraphJsonLd />
        <ThemeProvider>
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
