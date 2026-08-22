import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { requireAuth } from "@/server/auth/guards";
import { absoluteUrl } from "@/lib/utils/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Dashboard";
  const description = "Riyadh Prints admin dashboard.";
  const canonical = absoluteUrl("/admin");

  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: {
      canonical,
      languages: {
        en: canonical,
        ar: canonical,
        "x-default": canonical,
      },
    },
  };
}

export default async function AdminHomePage() {
  const user = await requireAuth();

  return (
    <main className="container-page py-xl">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/admin", label: "Dashboard" },
        ]}
      />
      <h1 className="mb-md">Dashboard</h1>
      <p className="text-muted-foreground">
        Signed in as {user.email} ({user.role.toLowerCase()}).
      </p>
    </main>
  );
}
