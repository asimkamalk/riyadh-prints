"use server";

import { z } from "zod";

import { signOut } from "@/server/auth/instance";

import { createAction } from "./_helpers";

export const signOutAdmin = createAction({
  input: z.object({}),
  roles: ["ADMIN", "EDITOR", "VIEWER"],
  revalidate: () => [],
  audit: { action: "auth.signOut", entityType: "user", entityId: () => "self" },
  handler: async () => {
    await signOut({ redirectTo: "/admin/login" });
    return { ok: true as const };
  },
});
