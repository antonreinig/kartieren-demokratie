# SaaS Boilerplate (Kartieren Demokratie)

This is a robust SaaS boilerplate built on the Vercel ecosystem, designed for rapid prototyping and scalability.

## Tech Stack (Vercel Optimized)

*   **Framework**: Next.js 15+ (App Router)
*   **Language**: TypeScript (Strict Mode)
*   **Styling**: Tailwind CSS + shadcn/ui (New York, Slate)
*   **Database**: Vercel Postgres (Prisma ORM)
*   **Auth**: Auth.js v5 (Google & Apple)
*   **SaaS Features**:
    *   **Rate Limiting**: Upstash Redis (`@upstash/ratelimit`)
    *   **File Uploads**: UploadThing
    *   **Background Jobs**: Inngest
    *   **AI**: Vercel AI SDK

## MVP Setup Guide

### 1. Vercel Import

1.  Push this repository to GitHub.
2.  Go to [Vercel Dashboard](https://vercel.com).
3.  Click "Add New..." -> "Project".
4.  Import the `kartieren-demokratie` repository.
5.  **Environment Variables**: Vercel will help auto-fill some, but you need to configure services first.

### 2. Database (Vercel Postgres)

1.  In your Vercel Project, go to the **Storage** tab.
2.  Click **Connect Store** -> **Postgres** -> **Create New**.
3.  Choose a region and create.
4.  Once created, click **"Connect Project"** to automatically pull `POSTGRES_URL` and `POSTGRES_PRISMA_URL` into your Vercel Environment Variables.

### 3. Rate Limiting (Upstash)

1.  Go to the **Storage** tab in Vercel.
2.  Click **Connect Store** -> **Browse Marketplace** -> **Upstash Redis**.
3.  Follow the flow to create/link a Redis database.
4.  This will set `KV_URL` or `UPSTASH_REDIS_REST_URL`. Ensure your `.env` matches the variable names used in `src/lib/rate-limit.ts` (usually `UPSTASH_REDIS_REST_URL` and `_TOKEN`).

### 4. Authentication (Auth.js)

1.  Generate a secret: `npx auth secret` (copy output).
2.  Add `AUTH_SECRET` to Vercel Environment Variables.
3.  Configure OAuth providers (Google/Apple) and add client IDs/secrets.

### 5. Deployment

1.  Deploy the project.
2.  Vercel will detect Next.js and build accordingly.
3.  Since `prisma` is configured, you may need to run migrations. In Vercel, you can add a build step override or run `npx prisma db push` from your local machine connected to the remote DB.

## Local Development

1.  Copy `.env.example` to `.env`.
2.  Fill in your keys (you can use `vercel env pull .env` if linked).
3.  Run development server:

```bash
npm run dev
```

4.  Start background job worker (Inngest):

```bash
npx inngest-cli@latest dev
```
