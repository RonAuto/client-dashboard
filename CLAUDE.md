# client-dashboard

Dev/test dashboard — Refine + Ant Design + Supabase.

## Stack
- Vite 8 + React 18 + TypeScript
- Refine (core, antd, supabase, react-router-v6)
- Ant Design 5 with RTL + he_IL locale
- Supabase project: aodcoglkawwvpqfddhde

## Commands
```bash
pnpm dev      # start dev server
pnpm build    # production build
pnpm preview  # preview build
```

## Project Structure
```
src/
├── App.tsx                  # Refine config, RTL, routes
├── main.tsx                 # Entry point
├── supabaseClient.ts        # Supabase client
├── authProvider.ts          # Email/password auth
├── interfaces/index.ts      # TypeScript types
├── pages/
│   ├── login/index.tsx      # Login page
│   └── dashboard/index.tsx  # Dashboard overview
├── utils/formatters.ts      # Hebrew date/currency formatters
└── styles/index.css         # RTL body, Heebo font
```

## Auth
Standard Supabase email/password. `authProvider.ts` handles login/logout/check.

## Env Vars
`.env.local` — VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY

## Adding a New Page
1. Create `src/pages/<name>/` with list/create/edit/show as needed
2. Add resource to `resources` array in App.tsx
3. Add route in App.tsx Routes
4. Add RLS policy in Supabase

## Known Issues / Open Questions
- Schema TBD — no tables created yet
- Anon key in .env.local (gitignored)
