import { z } from "zod";

import { appLocaleSchema } from "./common";

export const subscribeNewsletterSchema = z.object({
  email: z.email(),
  locale: appLocaleSchema.default("en"),
  website: z.string().max(200).optional(),
});
