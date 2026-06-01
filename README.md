# Shave

A personal "read-it-later" app. Paste a link and Shave saves it instantly, then
enriches it in the background — pulling the title, type, and preview metadata from the
page — so you can organize, skim, and mark links as read later.

> Built as a learning project: no ORM (hand-written SQL), a Bun monorepo, and a
> conventional layered backend / React frontend structure.

## Features

- **Instant capture** — links are saved immediately; metadata is fetched asynchronously.
- **Auto-enrichment** — Open Graph title, type, description, and preview image.
- **Categories** — organize links and browse them per category.
- **Inline editing** — update title, summary, and category; mark links as read.
- **Live updates** — the UI polls while a link is still being enriched.

## Tech stack

- **Backend:** Bun · [Hono](https://hono.dev) · PostgreSQL (`pg`, raw SQL) · `open-graph-scraper`
- **Frontend:** React 19 · React Router · Tailwind CSS v4 · Radix UI — bundled and served by Bun
- **Tooling:** Bun workspaces (monorepo), Docker Compose for Postgres

## Project structure

```
apps/
├── server/   # Hono API — layered routes / service / repository, raw SQL migrations
└── client/   # React SPA — pages, components, hooks, and a typed API layer
```

## Getting started

**Prerequisites:** [Bun](https://bun.com) and Docker (for Postgres).

```bash
# 1. Install dependencies
bun install

# 2. Configure environment
#    Set DB credentials, PORT, FE_URL, and BUN_PUBLIC_BE_URL in .env

# 3. Start Postgres
docker compose up -d

# 4. Apply the SQL migrations in apps/server/src/db/migrations (in order)

# 5. Run both apps (server + client)
bun run dev
```

The client runs on `http://localhost:5173` and the API on the configured `PORT`.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/links?category=:id` | List links (optional category filter) |
| `POST` | `/links` | Save a link and trigger enrichment |
| `PATCH` | `/links/:id` | Update title, summary, category, or read status |
| `DELETE` | `/links/:id` | Delete a link |
| `GET` | `/categories` | List categories |
| `POST` | `/categories` | Create a category |
| `DELETE` | `/categories/:id` | Delete a category |
