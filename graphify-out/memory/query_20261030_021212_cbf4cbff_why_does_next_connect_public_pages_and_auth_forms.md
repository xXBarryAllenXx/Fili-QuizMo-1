---
type: "query"
date: "2026-10-30T02:12:12.610791+00:00"
question: "Why does next connect Public Pages and Auth Forms to Search API and Auth Context, Build Config and Dependencies, Dashboard UI Sections, Supabase Auth and Routing, and Root Layout and Fonts?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["next", "react", "package.json", "layout.tsx", "proxy.ts", "server.ts", "use-search-filters.ts", "dashboard-shell.tsx", "navbar.tsx", "footer.tsx"]
---

# Q: Why does next connect Public Pages and Auth Forms to Search API and Auth Context, Build Config and Dependencies, Dashboard UI Sections, Supabase Auth and Routing, and Root Layout and Fonts?

## Answer

Expanded from original query via vocab: [next, react, auth, search, dashboard, layout, login, config, supabase, build]. Traced bridge node ref_next (package.json L18, degree 23). Its 23 edges touch 6 communities, all EXTRACTED imports_from: Public Pages and Auth Forms (13 - next/link in footer, navbar, button-link, signup/teacher-login/admin-login pages; next/navigation useRouter/usePathname/redirect in login forms, dashboard-shell, about pages; next.config.ts imports NextConfig), Supabase Auth and Routing (4 - next/navigation redirect in admin/teacher dashboard pages, next/headers cookies in lib/supabase/server.ts, next/server NextResponse/NextRequest in proxy.ts), Build Config and Dependencies (2 - package.json imports and next@16.4.3 declares), Dashboard UI Sections (2 - next/navigation in admin/teacher dashboard content), Root Layout and Fonts (1 - layout.tsx imports Metadata and Geist/Geist_Mono from next/font/google), Search API and Auth Context (1 - use-search-filters.ts imports usePathname/useRouter/useSearchParams). Conclusion: the bridge is a hub artifact - one node represents the whole next package, so every layer importing a different submodule (link, navigation, headers, server, font) attaches to the same node. It shows the app is framework-bound at every layer, not that those communities are coupled to each other. react has the same shape (19 edges, 4 communities).

## Outcome

- Signal: useful

## Source Nodes

- next
- react
- package.json
- layout.tsx
- proxy.ts
- server.ts
- use-search-filters.ts
- dashboard-shell.tsx
- navbar.tsx
- footer.tsx