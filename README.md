# Spector Craft Prize

Public site and Payload CMS in one Next.js app. Intended host is **Netlify**.

Production data lives in **Neon Postgres**. Uploads live in **Cloudflare R2**. Public pages are cached and revalidated when CMS content changes. Images are resized by Payload (`thumbnail`, `card`, `hero`) and served through `next/image`.

## Databases

Use two Neon branches. Do not point `pnpm dev` at production.

| Environment | Neon branch | Schema | Where the URL lives |
|---|---|---|---|
| Local | `dev` | Auto-push (`NODE_ENV=development`) | `.env` → `DATABASE_URL` |
| Production | `main` | Migrations only | Netlify env → `DATABASE_URL` (pooled) and `DATABASE_MIGRATE_URL` (direct) |

Create the `dev` branch from the Neon console, then put that connection string in local `.env`. Keep `main` for Netlify.

## Setup

1. Copy env: `cp .env.example .env`
2. Create a [Neon](https://console.neon.tech) project (`spector-craft-prize`) with a `dev` branch. Paste the **dev** connection string into `DATABASE_URL`.
3. Create a [Cloudflare R2](https://dash.cloudflare.com) bucket `spector-craft-prize-media`:
   - Enable the **R2.dev subdomain** (public access)
   - Create an R2 API token with Object Read & Write on that bucket
   - Set CORS on the bucket so browser uploads work (see below)
   - Fill `R2_*` in `.env`
4. Set `PAYLOAD_SECRET` to a long random string and `NEXT_PUBLIC_SERVER_URL` to `http://localhost:3000` (change this to the Netlify URL when you deploy)
5. `pnpm install && pnpm dev`
6. Open [http://localhost:3000](http://localhost:3000) and [http://localhost:3000/admin](http://localhost:3000/admin)

Create the first admin user on `/admin`. Then edit Home, About, Press, Emerging Artists Prize, Editions, and Prize Recipients.

### R2 CORS

Required because uploads go from the browser straight to R2 (`clientUploads`):

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Add the Netlify origin to `AllowedOrigins` when you deploy.

## Deploy

Create a Netlify site from this repo. Set the same env vars as `.env`, except:

- `DATABASE_URL` — Neon **prod** pooled connection string
- `DATABASE_MIGRATE_URL` — Neon **prod** direct connection string (used during `pnpm migrate` in the Netlify build)
- `NEXT_PUBLIC_SERVER_URL` — the live URL

Add that URL to R2 CORS. Before the first production deploy, generate a migration from the current schema:

```bash
pnpm migrate:create
```

Commit the files under `src/migrations`. Netlify runs `pnpm migrate && pnpm build`.

Page-builder section types beyond a starter rich-text block are not in yet.
