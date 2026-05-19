This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Authentication (Supabase)

This project includes an authentication flow built with Supabase. It supports email/password sign-in, email magic links, and sign-up. The implementation is minimal and intended for officer/admin access to protected pages (for example, `/generate`).

Key files added or updated:

- [app/signin/page.tsx](app/signin/page.tsx) — client UI for sign-in, sign-up, and sending magic links.
- [app/auth/callback/page.tsx](app/auth/callback/page.tsx) — consumes Supabase magic-link / OAuth redirects and stores the session.
- [app/components/auth-button.tsx](app/components/auth-button.tsx) — header control showing signed-in email and a sign-out button.
- [app/components/site-shell.tsx](app/components/site-shell.tsx) — header updated to include the auth button and link to sign-in.
- [lib/supabaseClient.ts](lib/supabaseClient.ts) — Supabase client factory (already present and used by the new pages).
- [lib/supabaseAdmin.ts](lib/supabaseAdmin.ts) — server/service-role client (already present).

Environment variables

Create a `.env.local` file in the `gdavs` folder with values from your Supabase project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key_here
SUPABASE_SERVICE_ROLE_KEY=service_role_key_here
```

Supabase dashboard setup

- In your Supabase project, under Auth → Settings → Redirect URLs add:
	- `http://localhost:3000/auth/callback` (for local development)
	- your production callback URL when deploying
- Ensure SMTP/email is configured in Supabase so magic links are deliverable.

How the magic link flow works

1. User enters their email and requests a magic link from the sign-in page.
2. Supabase sends an email with a link that redirects back to `/auth/callback`.
3. The callback page calls `supabase.auth.getSessionFromUrl()` to complete sign-in and store the session.
4. The header `AuthButton` reflects the signed-in user and provides sign-out.

Run locally

From the `gdavs` folder:

```bash
npm install
npm run dev
```

Next recommended steps

- Add middleware (`middleware.ts`) to protect server-side or page routes (e.g. `/generate`) and redirect unauthenticated users to `/signin`.
- Add tests or manual sign-in checks to verify email delivery and callback handling.
- Optionally add OAuth providers (Google/GitHub) in Supabase and expose buttons on the sign-in page.

If you want, I can add the middleware to protect routes now.
