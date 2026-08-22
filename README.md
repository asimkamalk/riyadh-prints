This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Database (Neon + Prisma)

Copy `.env.example` to `.env` and paste **two** strings from the Neon Console (**Connect**). They look similar; the hostname is the difference.

| Env var | Which Neon string | Hostname | Used by |
| --- | --- | --- | --- |
| `DATABASE_URL` | **Pooled connection** | contains `-pooler` (e.g. `ep-xxx-pooler.REGION.aws.neon.tech`) | Next.js runtime. `PrismaClient` in `src/lib/db.ts` via `@prisma/adapter-neon` |
| `DIRECT_URL` | **Direct connection** | **no** `-pooler` (e.g. `ep-xxx.REGION.aws.neon.tech`) | Prisma CLI only: `migrate`, `db push`, Studio (`prisma.config.ts`) |

Vercel + Neon: set `DATABASE_URL` on the Vercel project to the **pooled** (`-pooler`) host. Serverless invocations open many short-lived connections; the unpooled host will exhaust Neon's connection limit. `DIRECT_URL` is for migrations (`prisma migrate deploy` in CI), not for the running app.

```bash
npx prisma generate   # after schema changes
npx prisma migrate dev
npm run db:seed
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
