# Focus — Product Brief

**Focus** is a personal project board. Clean, calm, drag-and-drop. Built for one person first; cooperation can come later.

This document is the source of truth for *what* we are building and *why*. Implementation details live in code; how agents work lives in `AGENTS.md`. How to run and resume work lives in `README.md`.

---

## One-sentence pitch

A simple four-column board where work moves from ideas → ready → in progress → done — without the clutter or cost of heavy project tools.

---

## Current status (handoff)

**Solo v1 is shipped and usable daily** (export weekly). Phone UI polish lives on branch **`ui-polish`** until merged to `main`.

- Four columns, CRUD, drag + live preview, localStorage  
- Card icons (copy / edit / delete; **archive on Done only**), notes collapse/copy, title search (drag off while searching)  
- Export/import JSON; Done-only archive + list search / restore / permanent delete  
- **Phone polish shipped** (on `ui-polish`): column **tabs** (one column at a time), stacked header, **···** overflow menus (header + cards), bottom-sheet modals, touch long-press drag, safe areas  
- Desktop: icon row always visible; calm motion tokens; soft action-icon hovers; title validation shake  
- Themed scrollbars; storage safety (corrupt-load backup, no mid-drag saves, Cancel-first confirms)  
- Design: calm dark greyscale, white accent, Source Code Pro  
- **Live (`main` only):** https://coruscating-travesseiro-be1b90.netlify.app/ — does **not** include `ui-polish` until merge  
- **Code:** https://github.com/Dlcnokc/Focus (private); push `main` → Netlify; docs-only: `[skip ci]`  

**Not built / park for later:**

- Daily-use friction only (fix from real use; no large redesign without asking)  
- Archive extras, multi-user, backend/cloud sync  
- Separate “tools hub” / tax calculator (other repos later; leave Focus alone)  

See **Roadmap** and **README → Resume tomorrow**.

---

## Who it is for

| Phase | Users |
|-------|--------|
| **v1 (now)** | Only the owner (solo) |
| **Later** | Optional shared / cooperative use — not designed until v1 feels good daily |

---

## Problem

Paid boards are often noisy, opinionated, or expensive. Lightweight tools miss drag-and-drop or a clear ideas-vs-ready split. Focus should feel like a quiet place to park work and move it with intention.

---

## Product principles

1. **Simple first** — Prefer fewer features that feel great over many half-baked ones.
2. **Calm UI** — Soft contrast, no visual shouting. Default mood: **calm dark greyscale**.
3. **Theme is not forever** — Colors, fonts, and density must be easy to change (CSS variables / theme tokens).
4. **Make it work** — Pretty when it helps focus; never block shipping on pixel-perfect polish.
5. **Solo-first architecture** — Do not invent multi-user complexity early.
6. **Explainable** — The owner is learning real app development; keep product and code understandable.

---

## Board model (v1)

### Columns (fixed for v1)

| Column ID | Label | Meaning |
|-----------|--------|---------|
| `ideas` | Ideas | Ideas and issues not yet figured out |
| `ready` | Ready | Clear work, not started |
| `focus` | Focus | Actively in progress |
| `done` | Done | Finished |

One board only in v1.

### Card fields (as implemented)

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | Stable unique id |
| `title` | yes | Required to create/save (trim; empty rejected) |
| `notes` | no | Plain text string (may be `""`) |
| `column` | yes | One of the four column ids |
| `order` | yes | Position within the column (drag reorder) |
| `archived` | yes | `false` by default; soft-removed from the board when `true` |

**Not implemented yet** (optional later): `createdAt`, `updatedAt`, assignees, tags, due dates, priorities, attachments, comments, subtasks, multiple boards.

---

## Features

### Shipped (v1 core)

- [x] Four-column board layout  
- [x] Create card (title required) — column **+**, empty-state add, global **Add card** (defaults to Ideas); modal title **New card**  
- [x] Edit card (title + notes) — themed modal, blurred backdrop (desktop **centered**; phone **bottom sheet**)  
- [x] Delete card — **custom** confirm modal (no browser alert)  
- [x] Card actions: copy notes, edit, delete; **archive on Done** — desktop top-right icons; phone **···** menu  
- [x] Long notes **collapse** by default; bold Expand/Collapse under notes  
- [x] **Copy notes** to clipboard from the card  
- [x] Board starts empty (no sample/seed cards)  
- [x] Drag entire card (action icons / Expand excluded from drag start)  
- [x] Move between columns + reorder within column  
- [x] Live drag preview (other cards make room for insert position)  
- [x] Column drop highlight under cursor (including source column)  
- [x] Floating card snaps center to cursor while dragging  
- [x] Touch: long-press to drag so list scroll wins first; mouse: small distance threshold  
- [x] Persist to `localStorage` (`focus.board.v1`) — survives refresh  
- [x] Storage safety: corrupt load backup + block overwrite; no persist mid-drag; drag disabled during title search  
- [x] Destructive confirms focus **Cancel** first (delete / archive / import)  
- [x] Empty title rejected with red message + brief shake  
- [x] Calm dark greyscale + white accent + Source Code Pro (700 card/column titles / 400 body; header wordmark 500)  
- [x] Theme tokens + shared motion tokens in CSS  
- [x] Empty column states  
- [x] Error boundary (reload UI on crash)  
- [x] Runs locally (`npm run dev`)  
- [x] Export / import JSON backup (download + replace or merge confirm)  
- [x] Search / filter by card title (header; display-only filter)  
- [x] Archive Done cards (confirm + Archive list modal; restore or permanent delete)  
- [x] Phone polish: column tabs (Ideas / Ready / Focus / Done), stacked header, header **···** for Archive/Export/Import, bottom-sheet modals, safe areas  

### Nice-to-have / next

- [ ] Keyboard shortcuts (only if owner wants them)  
- [ ] Merge **`ui-polish`** → `main` so Netlify picks up phone polish  

### Explicitly later

- Multi-user / cooperative boards  
- Real-time collaboration  
- Accounts, invites, roles  
- File attachments  
- Notifications / email  
- Charts, reports, time tracking  
- Mobile native apps  
- Custom column builder  
- Integrations (GitHub, Slack, etc.)  
- Cloud sync / multi-device without export hacks  

---

## Data & storage (v1)

**Browser `localStorage` only**

| Key | Purpose |
|-----|---------|
| `focus.board.v1` | Card array JSON |
| `focus.board.v1.bak` | Raw backup if main key fails to parse (do not overwrite main until user acts) |

- No account required  
- Data lives in this browser profile on this origin (localhost ≠ Netlify)  
- Clearing site data can wipe the board → **Export** is the safety net  
- Live drag previews are **not** written until drop (or cancel restore)

---

## Design direction

### Mood: calm dark greyscale

- Near-black page, soft column panels, slightly lifted cards + shadow  
- **White / off-white accent** for primary actions and focus  
- **Source Code Pro** — bold card/column titles (700), regular body (400); header wordmark medium (500)  
- Modals with **blurred** backdrop: desktop centered; phone bottom sheet with handle  
- Header: brand mark (unfilled ring) + **Focus** only (no subtitle); no phase footer  

### UX decisions locked in recent sessions

- Add/edit: themed modal (not side panel); **Cancel** + backdrop click close; no extra Close button; create heading **New card**  
- Delete: themed modal, not `window.confirm`  
- Drag: whole card surface; live reorder preview; all columns can highlight; touch long-press  
- Card chrome: desktop top-right icons; phone **···** menu (copy / edit / delete; **archive on Done only**); long notes collapse with bold Expand under notes  
- Header secondary actions (Archive / Export / Import): desktop row; phone **···** overflow  
- Global Add → **Ideas** by default  


### Theme flexibility

- Prefer CSS custom properties in `src/index.css`  
- Design tweaks should not require logic rewrites  

---

## Success criteria (daily use)

1. Prefer Focus over sticky notes / paid boards for personal work  
2. Drag feels reliable; layout survives refresh  
3. UI stays calm enough to open without dread  
4. Owner can explain the app in one sentence  
5. Theme can be adjusted without gutting structure  

---

## Roadmap

| Phase | Goal | Status |
|-------|------|--------|
| **Phase 1** | Design shell, tokens, columns | Done |
| **Phase 2 / 2.1** | CRUD + centered modals + empty board | Done |
| **Phase 3** | Persist + drag move/reorder + live preview | Done |
| **Deploy** | Static host + GitHub auto-deploy | **Done** (Netlify) |
| **Archive** | Done-only archive + list (restore / delete) | **Done** |
| **Mobile / phone polish** | Swipe, dots, menus, bottom sheets, touch drag | **Done** on `ui-polish` (merge → `main` still open) |
| **v2** | Stronger persistence if needed (beyond localStorage) | Later |
| **v3+** | Cooperative features if still wanted | Later |

---

## Open decisions

| Topic | Current default | Status |
|-------|-----------------|--------|
| Project folder | `Grok_Projects/Focus` | Decided |
| App name | Focus | Decided |
| Storage | Browser `localStorage` | Decided |
| Theme | Calm dark greyscale + white accent | Decided |
| Font | Source Code Pro (700 titles / 400 body; header 500) | Decided |
| Columns | Ideas / Ready / Focus / Done | Decided |
| Stack | Vite + React + TypeScript + @dnd-kit | Decided |
| Global add default column | Ideas | Decided |
| Deploy | Netlify + GitHub `main` auto-deploy | Decided |
| Live URL | https://coruscating-travesseiro-be1b90.netlify.app/ | Decided |
| Code host | https://github.com/Dlcnokc/Focus (private) | Decided |
| Export format | JSON (`version` 1 + `cards` array) | Decided |

---

## Non-goals

- Competing with Jira / Linear in v1  
- Enterprise multi-tenancy, SSO, audit logs  
- Freezing design forever (theme will keep evolving)  

---

## Changelog (product decisions)

| Date | Decision |
|------|----------|
| 2026-07-09 | Named **Focus**. Solo-first. Four columns. Browser storage. Calm dark. PRODUCT + AGENTS before code. |
| 2026-07-09 | Columns: Ideas / Ready / Focus / Done. Greys/blacks + white accent. Phase 1 shell. |
| 2026-07-09 | Font: Source Code Pro. Phase 2 CRUD. Phase 2.1 centered modals + custom delete + empty board. |
| 2026-07-09 | Phase 3: localStorage, full-card drag, live preview, column highlight (incl. source), snap center to cursor. |
| 2026-07-09 | Docs handoff for next session: README/AGENTS/PRODUCT updated to match shipped v1 core. |
| 2026-07-11 | Deployed to Netlify; private GitHub repo; push to `main` auto-builds. Live URL recorded in README. |
| 2026-07-11 | Card UI: top-right icon actions (copy/edit/delete); long notes collapse/expand; copy notes to clipboard. |
| 2026-07-11 | Export/import JSON: download all cards; import with Replace or Merge confirm; centered modals. |
| 2026-07-11 | Search/filter cards by title in header (display-only; does not delete data). |
| 2026-07-11 | Docs: document Netlify `[skip ci]` for non-app commits. |
| 2026-07-11 | Archive Done cards: confirm modal, header Archive list, restore/delete; `archived` on card. |
| 2026-07-11 | Baseline mobile CSS (tokens + media queries; four columns swipe on phone). |
| 2026-07-11 | Hardening: corrupt-load backup, no mid-drag save, drag off while search, Cancel-first confirms, normalize titles/ids. |
| 2026-07-11 | Docs audit: archive marked Done; mobile further polish = next; docs aligned to code (icons, Cancel focus, roadmap). |
| 2026-07-11 | **ui-polish** branch: phone overhaul (header/card ··· menus, column dots + snap, bottom-sheet modals, TouchSensor long-press, safe areas); motion tokens; form polish (**New card**, title shake); soft action-icon hovers. |
| 2026-07-11 | Docs updated to match `ui-polish` (mobile polish = Done on branch; merge to `main` / Netlify still open). |
| 2026-07-13 | Phone: replaced column swipe/dots with **tabs** (one column at a time); tabs are droppable for cross-column drag. |
