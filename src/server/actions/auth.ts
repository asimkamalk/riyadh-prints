"use server";

import { AuthError } from "next-auth";

import { loginSchema } from "@/lib/validations/auth";
import { safeCallbackUrl } from "@/server/auth/callback-url";
import { INVALID_CREDENTIALS_MESSAGE } from "@/server/auth/credentials";
import { signIn } from "@/server/auth/instance";

import { ActionError, createAction } from "./_helpers";

export const signInWithPassword = createAction({
  input: loginSchema,
  roles: "public",
  rateLimit: { windowMs: 15 * 60 * 1000, max: 5 },
  revalidate: () => [],
  audit: {
    action: "auth.signIn",
    entityType: "user",
    entityId: (input) => input.email.toLowerCase().trim(),
  },
  handler: async ({ input }) => {
    const redirectTo = safeCallbackUrl(input.callbackUrl);
    try {
      await signIn("credentials", {
        email: input.email,
        password: input.password,
        redirect: false,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        throw new ActionError(INVALID_CREDENTIALS_MESSAGE);
      }
      throw error;
    }
    return { redirectTo };
  },
});
