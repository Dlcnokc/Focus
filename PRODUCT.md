# Focus — Product Brief

**Focus** is a personal project board. Clean, calm, drag-and-drop. Built for one person first; cooperation can come later.

This document is the source of truth for *what* we are building and *why*. Implementation details live in code; how agents work lives in `AGENTS.md`. How to run and resume work lives in `README.md`.

---

## One-sentence pitch

A simple four-column board where work moves from ideas → ready → priority → completed — without the clutter or cost of heavy project tools.

---

## Current status (handoff)

**Solo v1 is shipped and usable daily** (export weekly).

### Branch state (read this first)

| Branch | Role | Tip (as of 2026-07-13 handoff) |
|--------|------|--------------------------------|
| **`ui-polish`** | **Active work branch** — stay here unless owner says otherwise | `cddb294` — notes collapse at **2 lines** (layout-measured) + quieter Expand/Collapse |
| **`main`** | What Netlify deploys | `aaee213` — full app **except** that notes-collapse commit |

**Next agent:** `git checkout ui-polish && git pull origin ui-polish`. Do **not** force-checkout `main` while this branch is ahead. When owner wants live site updated: merge `ui-polish` → `main` and push `main`.

### Shipped product (both branches unless noted)

- Four columns (Ideas / Ready / Priority / Completed), CRUD, drag + live preview, localStorage  
- Card **priority** (Low → Immediate: badge, all-column auto-sort, prompt on unranked drop into Priority) and **completed dates** (auto-stamp, editable, newest-first sort in Completed)  
- Card actions (copy / edit / delete; **archive on Completed only**), title search (drag off while searching)  
- **Notes:** collapse when text paints past **~2 lines** (ResizeObserver / layout measure — not a character cutoff); Expand/Collapse control; copy notes  
  - *On `ui-polish` only until merge:* measured 2-line clamp + lighter Expand styling (`cddb294`)  
- Export/import JSON; Completed-only archive + list search / restore / permanent delete  
- **Phone:** column **tabs** (one full-width column at a time; droppable tabs for cross-column drag), stacked header, **···** menus (header + cards), bottom-sheet modals, touch long-press drag, safe areas  
- **Phone add/edit form:** tall bottom sheet (~full height); notes field grows; **×** close (no fake drag-handle bar)  
- Desktop: four columns side-by-side; icon row always visible; calm motion tokens; soft action-icon hovers; title validation shake  
- Themed scrollbars; storage safety (corrupt-load backup, no mid-drag saves, Cancel-first confirms)  
- Design: calm dark greyscale, white accent, Source Code Pro; package manager **pnpm**  
- **Live:** https://coruscating-travesseiro-be1b90.netlify.app/ (tracks `main` only)  
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
| `focus` | Priority | Ranked by importance (auto-sorted by priority) |
| `done` | Completed | Finished |

Column ids are stable storage keys; the 2026-07-11 rename (Focus → Priority, Done → Completed) changed labels only so saved boards keep working.

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
| `priority` | no* | One of Low / Medium Low / Medium / Medium High / High / Immediate. *Always set for cards in Priority (picked on create, or prompted on drop only when the card has no priority yet; defaults Medium). Shown as a colored badge; every column auto-sorts ranked cards first (unranked keep manual order below). Cleared when a card enters Completed — moving it back to Priority prompts fresh. |
| `completedAt` | no | ISO date (YYYY-MM-DD) stamped automatically when a card enters Completed; editable there via the edit modal (date picker); cleared on leaving. Completed sorts by it, newest first (undated legacy cards sink). |

**Not implemented yet** (optional later): `createdAt`, `updatedAt`, assignees, tags, due dates, attachments, comments, subtasks, multiple boards.

---

## Features

### Shipped (v1 core)

- [x] Four-column board layout  
- [x] Create card (title required) — column **+**, empty-state add, global **Add card** (defaults to Ideas); modal titled per column (**New Idea / New Ready Task / New Priority Task**). Completed has no direct add — cards only arrive there by drag  
- [x] Edit card (title + notes + priority; completed date on Completed) — themed modal, blurred backdrop (desktop **centered**; phone **bottom sheet**)  
- [x] Delete card — **custom** confirm modal (no browser alert)  
- [x] Card actions: copy notes, edit, delete; **archive on Completed** — desktop top-right icons; phone **···** menu  
- [x] Notes that paint past **~2 lines** collapse (layout-measured); Expand/Collapse under notes  
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
- [x] Runs locally (`pnpm run dev`)  
- [x] Export / import JSON backup (download + replace or merge confirm)  
- [x] Search / filter by card title (header; display-only filter)  
- [x] Archive Done cards (confirm + Archive list modal; restore or permanent delete)  
- [x] Phone polish: column tabs (Ideas / Ready / Priority / Completed), stacked header, header **···** for Archive/Export/Import, bottom-sheet modals, safe areas  

### Nice-to-have / next

- [ ] Keyboard shortcuts (only if owner wants them)  

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
- Modals with **blurred** backdrop: desktop **centered**; phone **bottom sheet** (no decorative drag handle)  
- Phone add/edit form: tall sheet; notes grow into leftover space; **×** in header + Cancel  
- Header: brand mark (unfilled ring) + **Focus** only (no subtitle); no phase footer  

### UX decisions locked in recent sessions

- Add/edit: themed modal (not side panel); **Cancel** + backdrop + **×** close; create headings per column (**New Idea / New Ready Task / New Priority Task**)  
- Delete: themed modal, not `window.confirm`  
- Drag: whole card surface; live reorder preview; all columns can highlight; touch long-press  
- Card chrome: desktop top-right icons; phone **···** menu (copy / edit / delete; **archive on Completed only**); notes past ~2 lines collapse (measured) with Expand/Collapse  
- Phone columns: **tabs**, not horizontal swipe  
- Header secondary actions (Archive / Export / Import): desktop row; phone **···** overflow  
- Global Add → **Ideas** by default  
- Column count badge: plain muted number (no grey pill)


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
| **Archive** | Completed-only archive + list (restore / delete) | **Done** |
| **Mobile / phone polish** | Column tabs, ··· menus, bottom sheets, touch drag, tall form + × | **Done** (on `main`); notes 2-line measure polish on **`ui-polish`** until merge |
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
| Columns | Ideas / Ready / Priority / Completed (ids `ideas/ready/focus/done`) | Decided |
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
| 2026-07-11 | Renamed columns Focus → **Priority**, Done → **Completed** (labels only; ids stable). Create modal titled "New {Idea / Ready Task / Priority Task / Completed Task}"; required/optional text replaced with red asterisk. |
| 2026-07-11 | Card `priority` (Low → Immediate, 6 levels): dropdown on create/edit, prompt when dragged into Priority (Cancel defaults Medium), colored badge on card, Priority column auto-sorts by rank. |
| 2026-07-11 | Package manager: npm → **pnpm** (`pnpm-lock.yaml`, `packageManager` pinned in package.json, build-script allowlist in `pnpm-workspace.yaml`). Netlify auto-detects pnpm from the lockfile. |
| 2026-07-11 | Completed cannot be added to directly (no **+** / empty-state add); cards reach it only by dragging from other columns. |
| 2026-07-11 | Entering Completed clears a card's `priority` (edit form hides the field there); dragging back to Priority prompts for a fresh rank. |
| 2026-07-11 | Priority auto-sort extended to all columns (ranked first, unranked keep manual order below); drop into Priority prompts only when the card has no priority yet. |
| 2026-07-11 | Column behavior centralized as flags on `ColumnDef` (`requiresPriority` / `clearsPriority` / `allowsDirectAdd` / `allowsArchive`) — one home for per-column rules. Load/import now enforces them too: unranked Priority cards default to Medium (closes the import loophole). Shared `PriorityBadge` component. |
| 2026-07-11 | Docs audit: archive marked Done; mobile further polish = next; docs aligned to code (icons, Cancel focus, roadmap). |
| 2026-07-11 | **ui-polish** branch: phone overhaul (header/card ··· menus, column dots + snap, bottom-sheet modals, TouchSensor long-press, safe areas); motion tokens; form polish (**New card**, title shake); soft action-icon hovers. |
| 2026-07-11 | Docs updated to match `ui-polish` (mobile polish = Done on branch; merge to `main` / Netlify still open). |
| 2026-07-12 | Completed date: entering Completed stamps `completedAt` (today), shown on the card and editable via a date picker in the edit modal; Completed sorts newest-first by it; leaving Completed clears it. New `tracksCompletedDate` column flag. |
| 2026-07-13 | Phone: replaced column swipe/dots with **tabs** (one column at a time); tabs are droppable for cross-column drag. |
| 2026-07-13 | Merged `sean-dev` (priority, completed dates, column flags, pnpm) with `ui-polish` (phone tabs, motion tokens, modal chrome, title shake). Per-column create-modal headings kept over ui-polish's "New card". |
| 2026-07-13 | Phone form: tall add/edit sheet (notes grow); removed fake drag-handle bar; **×** close on form. Column count: no grey circle. Expand/Collapse quieter greys; white on hover. |
| 2026-07-13 | Notes collapse: **2-line** clamp; show Expand when layout measures overflow (wrapping counts, not only long character strings). On branch **`ui-polish`** (`cddb294`); merge → `main` still open for that commit. |
| 2026-07-13 | Docs handoff: PRODUCT / README / AGENTS aligned to branch state and measured notes collapse. |
