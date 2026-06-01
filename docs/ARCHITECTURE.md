# Shave — Project Overview

> A personal "read-it-later" / link-stash app, built primarily as a **learning vehicle**.
> The goal was not just to ship a feature, but to deliberately practice things that
> frameworks usually hide: **raw SQL** (no ORM), a **monorepo** layout, and clean,
> conventional **file/architecture patterns** on both the backend and frontend.

---

## 1. What Shave does

Shave lets you "shave" a link off the internet for later. The flow is:

1. **Paste a URL** into an input on the home page and save it.
2. The backend stores the bare URL immediately and returns right away, then
   **asynchronously enriches** it in the background — fetching the page's
   Open Graph metadata (title, type, description, preview image).
3. The frontend **polls** while a link is in a `pending`/`retry` state and swaps the
   spinner for the real title/metadata once enrichment finishes.
4. Links can be **organized into categories**, **edited** (title, summary, category),
   and **marked as read/consumed**.

So the conceptual model is: a fast capture step + a slow background hydration step,
with the UI reconciling the two over time.

---

## 2. Learning goals baked into the project

These were chosen on purpose, and they shaped the whole codebase:

| Goal | How it shows up |
|------|-----------------|
| **Learn SQL deeply** | No ORM anywhere. Every query is hand-written parameterized SQL through `pg`'s `Pool`. Migrations are raw `.sql` files. A custom dynamic `UPDATE` builder was written by hand. |
| **Learn monorepo structure** | Bun workspaces with `apps/server` and `apps/client`, a root `package.json` orchestrating both, and a single `dev` script that boots both apps at once. |
| **Learn standard coding / file patterns** | Backend evolved into a **layered, module-based architecture** (routes → service → repository). Frontend uses a conventional React structure (pages / components / hooks / api / types / layouts). |
| **Stay close to the runtime** | Bun is used end-to-end — bundler, dev server, package manager, env loading — instead of Vite/Webpack/ts-node. |

---

## 3. Repository structure (monorepo)

```
shave/
├── package.json            # root workspace; `dev` script runs both apps
├── docker-compose.yml      # Postgres 16 for local dev
├── tsconfig.json           # shared strict TS config
├── index.ts                # leftover bun-init entry ("Hello via Bun!")
├── CLAUDE.md               # Bun usage conventions
│
├── apps/
│   ├── server/             # Hono + pg backend
│   └── client/             # React 19 + Tailwind v4 frontend (Bun-bundled)
```

The root `package.json` declares the workspace and a combined dev command:

```jsonc
"workspaces": ["apps/*"],
"scripts": {
  "dev": "bun ... run --filter shave-server dev & bun ... run --filter shave-client dev"
}
```

This is a clean demonstration of Bun's `--filter` to target individual workspace
packages while keeping one install and one lockfile (`bun.lock`) at the root.

---

## 4. Backend (`apps/server`)

**Stack:** [Hono](https://hono.dev) (web framework) on Bun, `pg` for Postgres,
`open-graph-scraper` for metadata enrichment.

### 4.1 Architecture — layered, per-module

The backend started simpler and was deliberately **refactored into a module-based,
layered architecture** (commit `refactor(be): migrate to module-based architecture`).
Before that, logic lived in a fat `index.ts` (~109 lines) and a flat `services/`
folder. The current shape isolates each domain (`link`, `category`) into its own
module with clear responsibilities:

```
src/
├── index.ts                 # app bootstrap: CORS, health checks, route mounting, error handling
├── db/
│   ├── client.ts            # single pg Pool, configured from env
│   └── migrations/          # raw .sql, numbered 0001…0003
├── modules/
│   ├── link/
│   │   ├── link.routes.ts       # HTTP layer (Hono routes, request validation)
│   │   ├── link.service.ts      # business logic (enrichment orchestration)
│   │   ├── link.repository.ts   # SQL data access
│   │   └── link.enrichment.ts   # Open Graph metadata fetching
│   └── category/
│       ├── category.routes.ts
│       └── category.repository.ts
├── types/                   # Link, Category, payload types
└── utils/
    ├── AppError.ts          # custom error with HTTP status code
    ├── validation.ts        # UUID validation
    └── linkQueryBuilder.ts  # dynamic UPDATE query builder
```

The layering is the textbook **routes → service → repository** separation:
- **routes** parse/validate input and shape the HTTP response,
- **service** holds orchestration (e.g. "create the link, then kick off enrichment"),
- **repository** is the only place that talks SQL.

> Note: the layering isn't applied uniformly yet. Simple CRUD routes talk to the
> repository directly, and only the enrichment workflow is routed through the service.
> An earlier empty `link.controller.ts` placeholder was removed once it proved unused.

### 4.2 The data model (raw SQL migrations)

Two tables, defined in plain SQL with a Postgres enum:

```sql
-- 0001_create_category.sql
CREATE TYPE enrichment_statuses AS ENUM ('pending', 'done', 'retry', 'failed');
CREATE TABLE category (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 0002_create_link.sql
CREATE TABLE link (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  url TEXT NOT NULL,
  title TEXT,
  type TEXT,
  enrichment_status enrichment_statuses NOT NULL DEFAULT 'pending',
  enrichment_attempts INTEGER DEFAULT 0,
  preview_image TEXT,
  summary TEXT,
  category_id UUID REFERENCES category(id) ON DELETE SET NULL,
  is_consumed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 0003_insert_default_categories.sql
INSERT INTO category (name) VALUES ('study'), ('funny'), ('lifehack');
```

SQL details worth calling out (these are the "learn SQL" payoffs):
- `gen_random_uuid()` for UUID primary keys.
- A **native enum type** (`enrichment_statuses`) to model the enrichment lifecycle.
- `ON DELETE SET NULL` on `link.category_id` — deleting a category orphans its links
  rather than cascading deletes, which is why the delete-category endpoint is safe.
- `user_id` columns already present but unused — schema designed with a future
  multi-user/auth story in mind.
- `enrichment_attempts` counter to support retry logic.

### 4.3 Hand-written queries & the dynamic UPDATE builder

All access is parameterized SQL. Reads support optional filtering and ordering:

```ts
const query = categoryId
  ? 'SELECT * FROM link WHERE category_id=$1 ORDER BY created_at DESC'
  : 'SELECT * FROM link ORDER BY created_at DESC';
```

The most interesting SQL-learning artifact is `utils/linkQueryBuilder.ts`, a small
**dynamic `SET` clause builder** for `PATCH`. It maps API field names to DB columns,
only includes provided fields, and tracks positional parameters ($1, $2, …) safely:

```ts
export const UPDATABLE_FIELDS = {
  title: 'title',
  categoryId: 'category_id',
  isConsumed: 'is_consumed',
  summary: 'summary'
}

// builds e.g. "title=$1, category_id=$2" + matching values array
```

The repository then appends the `WHERE id=$N` using the values length — a neat way to
learn how positional parameters work without an ORM hiding it.

### 4.4 Asynchronous enrichment (fire-and-forget)

This is the core design idea of the backend. On `POST /links` the route:
1. inserts the bare URL and **returns 201 immediately**, then
2. calls `linkService.enrichLink(id)` **without awaiting it** (`.catch` only for logging).

```ts
const createdLink = await linkRepository.create(body.url)
linkService.enrichLink(createdLink.id).catch(e => console.log(e))   // fire-and-forget
return c.json({ ok: true, data: createdLink }, 201)
```

`enrichLink` fetches Open Graph data, writes title/type/summary/preview_image and
flips `enrichment_status` to `done`; on failure it bumps `enrichment_attempts` and
sets status to `failed`. This teaches the pattern of decoupling a fast user-facing
response from a slow side effect, with state tracked in the DB.

### 4.5 HTTP layer, errors, and conventions

- **Consistent envelope:** every response is `{ ok: boolean, data?, error? }`.
- **Custom `AppError`** carries an HTTP status code; a central `app.onError` maps
  `AppError` / Hono `HTTPException` / unknown errors to clean JSON responses.
- **`notFound` handler** for unmatched routes.
- **Input validation** at the edge: UUID format checks via a regex helper, required-
  field checks before hitting the DB.
- **CORS** restricted to the configured frontend origin.
- **Health checks:** `/health` (liveness) and `/health/db` (runs `SELECT 1`).

### 4.6 API surface

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health`, `/health/db` | Liveness / DB connectivity |
| GET | `/categories` | List categories |
| POST | `/categories` | Create category |
| DELETE | `/categories/:id` | Delete category (links keep, FK set null) |
| GET | `/links?category=:id` | List links, optional category filter, newest first |
| GET | `/links/:id` | Single link |
| POST | `/links` | Create link + trigger enrichment |
| PATCH | `/links/:id` | Partial update (title/summary/category/consumed) |
| DELETE | `/links/:id` | Delete link |

---

## 5. Frontend (`apps/client`)

**Stack:** React 19, React Router 7, Tailwind CSS v4, Radix UI primitives +
shadcn-style components, `lucide-react` icons, `sonner` toasts — all bundled and
served by **Bun** (no Vite). `bunfig.toml` wires in the Tailwind plugin and exposes
`BUN_PUBLIC_*` env vars to the browser; `build.ts` does a minified production build.

### 5.1 Structure (conventional React layout)

```
src/
├── index.ts          # Bun.serve dev/prod server on :5173 (SPA fallback "/*")
├── index.html        # mounts #root, loads frontend.tsx
├── frontend.tsx      # React root + BrowserRouter + HMR-safe root caching
├── App.tsx           # renders AppRoutes
├── routes.tsx        # React Router route tree
├── layouts/
│   └── RootLayout.tsx   # Navbar + <Outlet/> + Toaster shell
├── pages/            # Home, All, AllCategories, Category
├── components/       # LinkCard, LinkModal, CategoryCard, CategoryModal, Navbar, Spinner
│   └── ui/           # shadcn-style primitives (button, input, select, card, …)
├── hooks/            # useLinks, useCategories
├── api/              # links.ts, categories.ts (fetch wrappers)
├── types/            # Link/Category + Api* raw shapes
└── lib/utils.ts      # cn() class merge helper
```

### 5.2 Routing

A nested route tree under a shared layout:

- `/` → **Home** (capture input + recent links grid)
- `/all` → **All** (full list view)
- `/categories` → **AllCategories** (grid of categories)
- `/categories/:id` → **Category** (links within one category)

### 5.3 Data layer & the API/UI type boundary

A deliberate pattern here: the backend speaks **snake_case** and the frontend speaks
**camelCase**, and the boundary is made explicit. Each `api/*.ts` module defines an
`Api*` type (raw server shape) and a `to*()` mapper that converts it to the internal
camelCase type:

```ts
function toLink(raw: ApiLink): Link {
  return { id: raw.id, url: raw.url, enrichmentStatus: raw.enrichment_status,
           previewImage: raw.preview_image, /* … */ }
}
```

This keeps server naming from leaking into components and is a good "anti-corruption
layer" habit.

### 5.4 Custom hooks encapsulate state + side effects

`useLinks` and `useCategories` own all fetching, loading/saving/error flags, optimistic
refetching, and user-facing toasts — so pages stay declarative. The standout is the
**polling logic in `useLinks`**, which mirrors the backend's async enrichment:

```ts
useEffect(() => {
  if (links.some(l => l.enrichmentStatus === 'pending' || l.enrichmentStatus === 'retry')) {
    const id = setInterval(() => fetchAllLinks(categoryId), 3000)
    return () => clearInterval(id)   // stop polling once everything is enriched
  }
}, [links, categoryId])
```

`useCategories` also derives a memoized `categoryMap` (`id → name`) so cards/modals can
render category names without extra lookups.

### 5.5 UI behavior

- **`LinkCard`** has `grid` and `list` variants, shows a spinner while a link is still
  enriching, color-codes a top accent bar (read vs unread), and renders type/read badges.
- **`LinkModal`** re-fetches the freshest copy of a link on open, supports inline
  editing (title/summary/category), and a one-click "Mark as read" toggle.
- **`CategoryModal`** lists the links inside a category.
- Errors surface as toasts; loading states use a shared `Spinner`.

---

## 6. Tooling & conventions

- **Bun everywhere:** package manager, runtime, bundler, dev server, env loading
  (no dotenv, no Vite, no ts-node). Captured in the per-app `CLAUDE.md` files.
- **Strict TypeScript:** `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`,
  `noFallthroughCasesInSwitch`, bundler module resolution, `verbatimModuleSyntax`.
- **Postgres via Docker Compose** (`postgres:16`) for a reproducible local DB.
- **Env separation:** root `.env` holds shared DB creds; each app reads only what it
  needs (`PORT`/`FE_URL` for server, `BUN_PUBLIC_BE_URL` for client).
- **Path alias `@/`** in the client for clean imports.

---

## 7. Development history (what the commits show)

The git history reads like a deliberate learning progression:

1. **Foundation** — `bun init`, then `configure database connection`, then
   `add all basic endpoints` and `add enrichment logic` (raw SQL + async enrichment).
2. **Frontend bring-up** — API layer → routing → `useLinks` hook + home page →
   link modal → category pages/hooks, building the React app feature by feature.
3. **Iterative refinement** — added delete endpoints, fixed the "no links" edge case,
   added `created_at` ordering, implemented FE error handling.
4. **Polish & refactor** — repeated UI overhauls/layout fixes, and finally the
   **backend refactor to a module-based architecture**, consolidating the fat
   `index.ts` into per-domain route/service/repository modules.

This arc — build it working, then refactor toward clean structure — is itself one of
the patterns the project set out to practice.

---

## 8. Notable design decisions (and learning takeaways)

- **No ORM, on purpose.** Every join, filter, ordering, enum, FK behavior, and the
  dynamic UPDATE builder were written by hand — the fastest way to actually internalize SQL.
- **Async enrichment with DB-tracked state** teaches decoupling fast responses from slow
  side effects, plus client/server reconciliation via polling.
- **Layered backend modules** make the routes→service→repository boundaries tangible.
- **Explicit API↔UI type mapping** keeps the two halves of the monorepo independently
  evolvable and prevents naming conventions from bleeding across the wire.
- **Schema built for the future** (`user_id`, retry counters) without over-building the
  current feature set.

---

## 9. Known gaps / next steps

- The layering is incomplete: CRUD routes still call the repository directly instead of
  going through the service layer. Completing that separation is the natural next refactor.
- `user_id` columns exist but there's **no auth/multi-user** yet — a natural next feature.
- **No migration runner** is wired up; the numbered `.sql` files appear to be applied
  manually. A small runner (or a tool) would make setup reproducible.
- **No automated tests** yet, despite Bun's test runner being available.
- Enrichment retry status (`retry`) is modeled in the enum and polled for, but there's
  no scheduled retry job that re-attempts `failed`/`retry` links.
- The root `index.ts` (`"Hello via Bun!"`) is a leftover from `bun init` and unused.
