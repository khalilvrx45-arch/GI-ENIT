# Project TODO List — CGI ENIT

## 📌 High Priority

> All high-priority items are now complete. See Completed Items below.

---

## 📌 Completed Items
- [x] **Admin/Bureau Project Management UI**: API route (`/api/admin/projects`), `ProjectManager` component, "Gestion des Projets" tab in `/admin` and `/bureau` dashboards. Full CRUD with member assignment checklist, lead selector, pôle picker, deadline, and status toggles.
- [x] Standardized all application user roles to exactly 3 canonical roles: `'admin'`, `'membre_bureau'`, and `'membre_actif'` (`lib/types/roles.ts`).
- [x] Unified member dashboard design system to CGI ENIT dark amber theme (`#0d0e0e`, `#141515`, `#fca311`).
- [x] Fixed login redirect loop and refreshed server component router state.
- [x] Integrated active member portal (`/membre`) with interactive Kanban task board (`@dnd-kit`).
- [x] Optimized page render times by removing full-screen scanlines and heavy CSS backdrop filters.
- [x] Upgraded middleware convention to Next.js 16 `proxy.ts`.
