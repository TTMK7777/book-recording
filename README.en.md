[日本語](./README.md) | **English**

# book-recording

A personal web app for managing your reading history effectively and boosting reading motivation.

For the detailed background and differentiation strategy, see [`IDEAS.md`](./IDEAS.md); for operating rules, see [`plan.md`](./plan.md).

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS v4**
- **shadcn/ui** (base-ui based)
- **Drizzle ORM** + **Supabase Postgres**
- **Supabase Auth** (`@supabase/ssr`) — Email magic link
- **Vercel** as the deployment target

## Features (implemented in Phase 1)

| Endpoint / Page | Role |
|------------------------|------|
| `GET /api/books/lookup?isbn=xxx` | Bibliographic lookup via openBD → Google Books fallback |
| `/login` | Log in with an Email magic link |
| `/auth/callback` | Supabase OAuth callback |
| `/books` | Your bookshelf list (auth required) |
| `/books/new` | Enter ISBN → preview → register |
| `/books/[isbn]` | Edit bibliography and reading log (★ / review / public toggle / dates) |

## Directory layout

```
src/
├── app/
│   ├── api/books/lookup/    # Bibliographic lookup API
│   ├── auth/callback/       # Supabase auth callback
│   ├── books/               # list / register / detail
│   └── login/               # login page
├── components/ui/           # shadcn/ui components
├── db/
│   ├── index.ts             # Drizzle client (Lazy Proxy)
│   └── schema.ts            # books / reading_logs / highlights
├── lib/
│   ├── auth.ts              # requireUserId() helper
│   ├── books/               # openBD / Google Books / ISBN normalization
│   ├── import/              # Phase 2 import pipeline
│   │   ├── types.ts         # intermediate-representation schema (zod)
│   │   └── parsers/         # amazon-notebook (Strict / Lenient / position extraction)
│   ├── supabase/            # server / client / middleware
│   └── utils.ts             # cn utility
└── middleware.ts            # auth guard
drizzle/                     # migrations
public/bookmarklet/          # Kindle Web Notebook extraction bookmarklet
docs/import/                 # DOM-structure investigation notes for import paths
tests/                       # Vitest unit tests + fixtures
vitest.config.ts             # Vitest config
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Fill in environment variables
cp .env.example .env.local
#   - NEXT_PUBLIC_SUPABASE_URL          (Supabase Settings → API)
#   - NEXT_PUBLIC_SUPABASE_ANON_KEY     (Supabase Settings → API → anon public)
#   - DATABASE_URL                       (Supabase Settings → Database → Transaction pooler)

# 3. Supabase Auth configuration
#   - Authentication → Providers → Email: enable it (on by default)
#   - Authentication → URL Configuration → Site URL: http://localhost:3000
#                                          Add http://localhost:3000/** to Redirect URLs

# 4. Apply the DB schema
npm run db:push

# 5. Start the dev server
npm run dev
```

Once it opens, send a magic link from `/login`, click the link in the email, then register an ISBN at `/books/new`.

## Scripts

| Command | Purpose |
|---------|------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (single run) |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:coverage` | Vitest + v8 coverage |
| `npm run db:generate` | Generate migrations from the schema |
| `npm run db:push` | Push the schema directly to the DB (for early development) |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Inspect the DB with Drizzle Studio |

## Implementation phases

| Phase | Content | Status |
|-------|------|------|
| **Phase 1** | ISBN registration → lookup → list/detail → ★/review + Auth | ✅ Code complete / ⏳ Pending real-device verification |
| **Phase 2** | Kindle bulk import (Web Notebook C as the main path: bibliography + highlights + notes) | 🟡 Scaffold complete / real JSON fetch + UI remaining |
| Phase 3 | LinkedIn post draft generation / streaks | Not started |
| Phase 4 | OGP images / public pages / genre radar | Not started |
| Phase 5 (optional) | Obsidian / MCP integration / external publication (D-Gmail integration) | Not started |

## License

A reading-record app intended for personal use. Released under the [MIT License](./LICENSE).
