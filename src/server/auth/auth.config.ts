import type { NextAuthConfig } from "next-auth";

import type { UserRole } from "@/generated/prisma/enums";

import { isAdminLoginPath, isAdminPath } from "@/i18n/routing";

/**
 * Edge-safe Auth.js config. No Prisma, bcrypt, or Node-only APIs.
 * Node extras (adapter, Credentials) are merged in `instance.ts`.
 */
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: {
    signIn: "/admin/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (!isAdminPath(pathname) || isAdminLoginPath(pathname)) {
        return true;
      }
      return Boolean(auth?.user);
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
