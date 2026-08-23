import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { buildMetadata } from "@/lib/seo/metadata";
import { safeCallbackUrl } from "@/server/auth/callback-url";
import { getCurrentUser } from "@/server/auth/guards";

import { LoginForm } from "./login-form";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    locale: "en",
    path: "/admin/login",
    title: "Sign in",
    description: "Sign in to the Riyadh Prints admin dashboard.",
    noIndex: true,
    noFollow: true,
  });
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(params.callbackUrl);
  const user = await getCurrentUser();
  if (user) {
    redirect(callbackUrl as never);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-md py-xl">
      <div className="w-full max-w-md">
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/admin/login", label: "Sign in" },
          ]}
        />
        <Card>
          <CardHeader className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <CardDescription>
              Use your Riyadh Prints staff email and password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm callbackUrl={callbackUrl} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
