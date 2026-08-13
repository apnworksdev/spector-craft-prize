# Spector Craft Prize

Public site and Payload CMS in one Next.js app.

## Local setup

1. Copy env: `cp .env.example .env` (a `.env` is already created for local Postgres).
2. Start Postgres: `docker compose up -d`
3. Install and run: `pnpm install && pnpm dev`
4. Open [http://localhost:3000](http://localhost:3000) and [http://localhost:3000/admin](http://localhost:3000/admin)

Create the first admin user on `/admin`. Then edit Home, About, Press, Emerging Artists Prize, Editions, and Prize Recipients.

Page-builder section types beyond a starter rich-text block are not in yet.

## Deploy

Intended host is **Netlify**. Local disk uploads and Docker Postgres are for development only. Production will need a hosted Postgres and cloud media storage — we will wire that when we deploy.
