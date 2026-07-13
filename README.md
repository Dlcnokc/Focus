# Focus

A calm, personal four-column board: **Ideas → Ready → Priority → Completed**.

**Status (handoff):** Solo v1 is **usable daily**. Live Netlify tracks **`main`**.

**Active branch:** **`ui-polish`** (ahead of `main`: notes 2-line measure, column-count polish, title max 20, favicon/cleanup, docs). Stay until merge → `main`.

Shipped (code on this branch): board CRUD + drag, **notes collapse** (measured ~2 lines — *Netlify still on `main` until merge*), **title max 20** (`n/20` counter + shake validation), **column counts** centered with titles, favicon matches header mark, **card priority**, **completed dates**, card actions, **export/import**, **title search**, **Completed archive**, **phone polish**, motion tokens, **storage safety**.

Not multi-user. **Next:** push **`ui-polish`** if not pushed; merge **`ui-polish` → `main`** when ready for live; then daily-use friction only. Multi-user only if asked.

### Live site

**https://coruscating-travesseiro-be1b90.netlify.app/**

Use this URL for daily planning (not only `pnpm run dev`). Data is still **this browser only** on that site (`localStorage`).

| Source | Location |
|--------|----------|
| Code (private) | https://github.com/Dlcnokc/Focus |
| Hosted app | https://coruscating-travesseiro-be1b90.netlify.app/ |

### Deploy (how updates go live)

1. Change code locally  
2. Commit  
3. Push to **`main`** on GitHub  
4. Netlify auto-runs the build (it detects `pnpm-lock.yaml` and uses pnpm) and publishes `dist`  

No drag-and-drop of `dist` needed after the GitHub link is set up. Check Netlify **Deploys** if a push did not appear live.

**Docs-only (or other non-app) commits — skip Netlify build:** put `[skip ci]` in the commit message. Example:

```text
Update README and PRODUCT handoff. [skip ci]
```

GitHub still gets the commit; Netlify **does not** rebuild the site. Use this for documentation-only changes. For real app changes, leave `[skip ci]` out so the live site updates.

**Rebuild locally (without deploying):**

```powershell
cd <your local clone>
pnpm run build
```

That writes production files to `dist/` only. Preview with `pnpm run preview`, or push `main` to publish.

---

## Resume tomorrow (session handoff)

### Before you edit (stay on the right branch)

Always work in **this folder only** (the git clone), not a second copy or a GitHub ZIP.

**Right now (2026-07-13):** work is on **`ui-polish`**. Use:

```powershell
cd <your local clone>
git checkout ui-polish
git pull origin ui-polish
git status
```

You want: **`On branch ui-polish`**, **`up to date with 'origin/ui-polish'`**. Commit and `git push origin ui-polish`. Merge to `main` only when the owner wants the live site updated.

**When back on `main` only** (no feature branch):

```powershell
git checkout main
git pull origin main
git status
```

Then push `main` for Netlify. Do **not** force-checkout `main` while `ui-polish` has unmerged commits.

Grok (or any agent) should pull the active branch at session start (see `AGENTS.md`).

### Read these in order

1. **`PRODUCT.md`** — current status, branch table, v1 scope, non-goals, roadmap  
2. **`AGENTS.md`** — how agents should behave in this repo  
3. **This file** — how to run, folder map, current behavior  

### What changed last session (ui-polish)

| Change | Detail |
|--------|--------|
| **Title max 20** | `src/lib/cardTitle.ts` — validate / normalize / clamp; form `maxLength` + **`n/20`** counter; empty or over-limit → red message + shake; load/import clamps long titles; card CSS single-line ellipsis |
| Favicon + cleanup | Tab icon matches header ring mark; remove unused `icons.svg` / dead exports; `PriorityPromptModal` uses modal chrome; TypeScript `strict` |
| Column counts | Count digits use same em metrics as title then `scale()` so they sit mid-line; Completed keeps header height with invisible **+** spacer (`9c13d25`) |
| Notes clamp (earlier) | **2 lines** layout-measured (`cddb294`); quieter Expand/Collapse |
| Docs | PRODUCT / README / AGENTS aligned to sort rules, flags, storage, title limit |

### Suggested next work (pick with the owner)

| Priority | Idea | Notes |
|----------|------|--------|
| First | **Push** `ui-polish` if not on origin yet | Then owner can review on branch |
| Ship | Merge **`ui-polish` → `main`** | Notes measure + column counts + title limit + cleanup on Netlify |
| Optional | Raise title max if 20 feels too tight | Owner asked for 20 for clean single-line cards; CSS ellipsis also helps |
| Habit | Weekly **Export** backup | Browser-only data |
| From use | Fix real friction only | No large redesign without asking |
| Later | Cooperative / multi-user | Only if still wanted after daily solo use |
| Out of scope for now | Separate tax/tools hub site | Leave Focus alone |

Do **not** start multi-user, auth, or a backend unless the owner asks.

### Quick start (Windows)

This repo uses **pnpm** (`packageManager` is pinned in package.json). One-time setup if you don't have it: `npm install -g pnpm` or `corepack enable`.

```powershell
cd <your local clone>
pnpm install
pnpm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). For the **public** site, use the Netlify URL above.

**Phone on the same Wi‑Fi (no deploy needed):**

```powershell
pnpm run dev --host
```

Vite prints a **Network** URL like `http://192.168.x.x:5173` — open that on your phone. PC and phone must be on the same network. Or use the live Netlify URL after a push.

| Command | What it does |
|---------|----------------|
| `pnpm run dev` | Dev server + live reload (this PC only) |
| `pnpm run dev --host` | Dev server reachable from phone on LAN |
| `pnpm run build` | Production build → `dist/` |
| `pnpm run preview` | Preview production build |
| `git push origin main` | Triggers Netlify deploy (after commit), unless message has `[skip ci]` |

---

## What works today

| Feature | Behavior |
|---------|----------|
| **Columns** | Ideas, Ready, Priority, Completed (fixed; internal ids stay `ideas/ready/focus/done`) |
| **Add card** | Header **Add card** → Ideas; column **+** / empty-state **Add card** → that column; modal titled per column (**New Idea / New Ready Task / New Priority Task**). **Completed has no add** — cards only arrive there by drag |
| **Edit** | Pencil icon → modal (title + notes + priority; completed date on Completed); title required (red asterisk), **max 20 chars** with **`n/20`** counter; empty or over-limit → red message + brief shake |
| **Title length** | Max **20** characters (`MAX_CARD_TITLE_LENGTH`). Input cannot type past 20; create/edit save validates the same rules; load/import shortens legacy long titles |
| **Priority** | Low → Immediate (6 levels): dropdown on create/edit, colored badge on card. **Ideas / Ready / Priority** sort ranked cards first (unranked keep manual order below). Dropping an unranked card into Priority prompts for a rank (Cancel = Medium); entering Completed clears it |
| **Completed date** | Entering Completed stamps today's date (shown on the card); editable via date picker in the edit modal; **Completed sorts newest-first by date** (not priority); leaving Completed clears it |
| **Delete** | Trash icon → themed confirm modal (blurred backdrop); no browser `alert` |
| **Copy notes** | Clipboard icon (only if card has notes) → copies notes text; brief checkmark feedback |
| **Notes expand** | Notes that wrap past ~2 lines collapse with **Expand** / **Collapse** (measured, not a character cutoff) |
| **Card actions** | Desktop: top-right icons — copy (if notes), **archive (Completed only)**, edit, delete. Phone: same actions behind card **···** |
| **Header actions** | Desktop: Archive / Export / Import as a row next to **Add card**. Phone: those three behind header **···**; **Add card** stays primary |
| **Drag** | Drag from **anywhere on the card** (not action icons / Expand / Collapse). Mouse: small move threshold. Touch: **long-press** so list scroll can win first |
| **Live preview** | Other cards shift while dragging to show insert order |
| **Column highlight** | Column under cursor lights up (including source column) |
| **Cursor snap** | Floating card centers under the pointer (`snapCenterToCursor`) |
| **Phone columns** | **Tabs** (Ideas / Ready / Priority / Completed) show one column at a time — no horizontal column scroll; drag onto a tab to move a card across columns |
| **Modals** | Desktop: centered. Phone: **bottom sheet** (no drag handle); add/edit is **tall** with **×** close; full-width actions where helpful |
| **Save** | Auto-saves to `localStorage` key `focus.board.v1` (not during live drag preview; saves on drop / other edits) |
| **Corrupt load** | Bad JSON / non-array / zero valid cards → backup key `focus.board.v1.bak`, banner + Dismiss, **no overwrite** until user edits/imports. Partial invalid rows: keep good cards, write `.bak`, still allow save |
| **Empty start** | No sample cards; board empty until you add some |
| **Crash recovery** | `ErrorBoundary` shows reload UI instead of a blank page |
| **Export** | **Export** → downloads `focus-board-YYYY-MM-DD.json` (all cards, incl. archived) |
| **Import** | **Import** → pick JSON → **Replace** (wipe board) or **Merge** (same id updates; new ids add) |
| **Search** | Header **Search titles…** — filters visible cards by title only (case-insensitive); full board still saved; **drag disabled** while search is active |
| **Archive** | Completed cards only: archive control → confirm → leaves board. **Archive (N)** lists Restore / permanent Delete; search titles in that modal. Export includes archived |

### Known limits

- Data is **this browser only** on this machine / origin. Clearing site data can wipe the board — use **Export** as a backup.
- `localhost` and Netlify are **different** boards (different origins).
- No accounts, sync, or second device (export/import is the cross-device path).
- Live Netlify is **`main` only**. Latest notes measure, column-count polish, and title limit live on **`ui-polish`** until merge (and title limit may need a commit first).
- Title max **20** is intentional and tight — longer wording must be shortened or the limit raised by the owner.
- No keyboard shortcuts (by choice so far).
- Multi-tab: last write wins (no live sync between tabs).

### Manual smoke test

1. Add cards via global and column **+** (modal titled per column, e.g. **New Idea**); title counter shows **`n/20`**  
2. Reject empty title (red message + brief shake); typing stops at 20 chars; over-limit save shows too-long message + shake if forced past max  
3. Edit notes → Save (pencil / card menu); phone form is tall with **×**  
4. Notes past ~2 lines (including short wrapping text): collapsed preview, **Expand** / **Collapse**, **Copy** pastes notes  
4b. Column headers: count sits mid-line with title; Completed header aligns with columns that have **+**  
5. Drag between columns (search empty); confirm live reordering; refresh → order kept  
6. Search on → drag disabled; clear search → drag works  
7. Delete / Archive / Import confirms → **Cancel** is focused first  
8. Export → open the JSON file → should list cards (incl. archived if any)  
9. Import → Merge and Replace both work; bad file shows error modal  
10. Completed → archive → confirm → Archive list → Restore / Delete  
11. Priority: create a ranked card (badge shows, column sorts); drag an unranked card into Priority → prompt appears; drag a ranked card into Completed → badge clears + completed date stamps  
12. Phone/narrow: column tabs; drag onto a tab to change column; header **···**; card **···**; long-press to drag; bottom-sheet modals  

---

## Design system (quick reference)

| Token area | Where | Notes |
|------------|--------|--------|
| Colors, radii, type, space | `src/index.css` → `:root` | Theme tokens |
| Font | **Source Code Pro** (Google Fonts in `index.html`) | Titles **700**, body **400**, header wordmark **500** |
| Palette | Near-black / greys, **white accent** | Calm dark. Sanctioned color exceptions: action hues (`--color-danger/edit/archive`), priority-badge ramp (`--color-priority-*`), required-field red (`--color-required`) |
| Columns | Soft `--color-column` fill | Quieter than cards |
| Cards | Lighter fill + box-shadow | Drag whole card |
| Motion | `--motion-duration` / `--motion-ease` in `:root` | Buttons/hovers; cards stay transform-free for drag |
| Modals | `.modal` + blurred `.modal-backdrop` | Desktop centered; phone bottom sheet |

**Theme token** = named CSS variable (e.g. `--color-bg`) so redesigns are one-file edits.

---

## Why this stack?

| Choice | Plain English |
|--------|----------------|
| **Vite** | Fast dev server; saves → browser updates |
| **React** | UI built from small components |
| **TypeScript** | Catches shape mistakes early |
| **@dnd-kit** | Drag-and-drop (core, sortable, modifiers, utilities) |
| **localStorage** | Persist board without a server |

---

## Folder map

```
Focus/
├── PRODUCT.md                 Product source of truth
├── AGENTS.md                  Rules for coding agents
├── README.md                  Runbook + handoff (this file)
├── package.json               packageManager: pnpm
├── pnpm-lock.yaml
├── pnpm-workspace.yaml        build-script allowlist for pnpm
├── netlify.toml               build command + dist publish
├── index.html                 Loads fonts + app
├── vite.config.ts
├── tsconfig*.json
├── public/
│   └── favicon.svg            Tab icon (matches header ring mark)
└── src/
    ├── main.tsx               React mount + ErrorBoundary
    ├── App.tsx                Header, board, modals wiring
    ├── index.css              Theme tokens + all styles
    ├── types.ts               Card, ColumnId, EditorMode
    ├── hooks/
    │   ├── useBoard.ts        State: CRUD, persist, drag preview API
    │   └── useModalChrome.ts  Escape stack + body scroll lock for modals
    ├── lib/
    │   ├── storage.ts         loadBoard/saveCards (`focus.board.v1` + `.bak`)
    │   ├── cardTitle.ts       Title max length, validate, normalize, load clamp
    │   ├── boardFile.ts       Export/import JSON parse, merge, download
    │   ├── dnd.ts             Collision detection, column + tab droppable helpers
    │   ├── boardMove.ts       Pure move/reorder for live preview + drop
    │   └── dates.ts           ISO date helpers for completedAt
    ├── data/
    │   ├── placeholderBoard.ts  COLUMNS + flags + DEFAULT_NEW_COLUMN (no seed cards)
    │   └── priorities.ts        Priority levels, rank, sort, labels, default
    └── components/
        ├── Board.tsx              DndContext, phone column tabs, overlay
        ├── Column.tsx             Droppable column + list
        ├── Card.tsx               Sortable card + icons + measured notes collapse
        ├── CardFormPanel.tsx      Add/edit modal (desktop centered; phone tall sheet)
        ├── PriorityBadge.tsx      Shared priority chip on cards
        ├── PriorityPromptModal.tsx  Rank prompt on drop into Priority
        ├── DeleteConfirmModal.tsx Centered delete confirm
        ├── ArchiveConfirmModal.tsx  Archive confirm
        ├── ArchiveListModal.tsx   Archived list + search
        ├── ImportBoardModal.tsx   Replace vs merge confirm
        ├── ImportErrorModal.tsx   Bad import file message
        └── ErrorBoundary.tsx      Crash → reload message
```

### Export file shape

```json
{
  "version": 1,
  "exportedAt": "2026-07-11T…",
  "cards": [ { "id", "title", "notes", "column", "order", "archived", "priority?", "completedAt?" } ]
}
```

Import also accepts a bare JSON array of cards (same fields). Invalid cards are skipped; if none are valid, import fails with an error modal. Import does **not** require or validate `version` (any object with a `cards` array works).


### Mental model

1. Browser loads `index.html` → `main.tsx` → `App`  
2. `useBoard` owns the card list; persists when allowed (not mid-drag; not after corrupt load until user acts)  
3. `Board` handles drag (preview + drop); columns/cards render active (non-archived) list  
4. Add/Edit → `CardFormPanel`; Delete / Archive / Import → centered modals  
5. Export/Import → `boardFile.ts`; still no server/login  

### Card shape (code)

```ts
{
  id: string
  title: string
  notes: string
  column: 'ideas' | 'ready' | 'focus' | 'done'   // ids; labels are Ideas/Ready/Priority/Completed
  order: number   // position within column
  archived: boolean
  priority?: 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high' | 'immediate'
  // always set in Priority; always absent in Completed
  completedAt?: string   // YYYY-MM-DD; only on Completed cards, set on entry
}
```

---

## Storage

| Key | Value |
|-----|--------|
| `focus.board.v1` | JSON array of cards |
| `focus.board.v1.bak` | Raw backup when load fails hard (bad JSON, non-array, zero valid cards) or when some rows are invalid |

Load/normalize: `src/lib/storage.ts` (`loadBoard`) — `order` / `archived` defaults, trim titles, drop empty titles, dedupe ids (last wins), reindex per column, Priority missing rank → Medium, Completed strips priority and keeps valid `completedAt` only. Hard failure sets `allowPersist: false` until the user acts.

---

## Drag implementation notes (for agents)

- **Library:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers`, `@dnd-kit/utilities`
- **Collision:** `pointerWithin` → else `rectIntersection` → else `closestCorners` (`src/lib/dnd.ts`); within hits, prefer **card** droppables over column/tab chrome so columns activate under the cursor
- **Live preview:** `onDragOver` → `previewMove` / `applyCardMove` so other cards make room
- **Drop on empty column / tab:** appends to end of that column (`boardMove.ts`)
- **Display sort vs `order`:** Column re-sorts for display (priority on Ideas/Ready/Priority; date on Completed). Stored `order` still survives refresh; mixed ranks may not match pure drag order after re-sort
- **Stability:** skip no-op moves; do not reshuffle when hovering **same column chrome** only (prevents React update loops / blank screen)
- **Cancel:** snapshot at drag start; restore if drop cancelled / no `over`
- **Sensors:** `MouseSensor` (distance) + `TouchSensor` (long-press ~220ms so list scroll wins first); both use huge thresholds when search disables drag  
- **Overlay:** `DragOverlay` + `snapCenterToCursor`; whole card is draggable; copy / archive / edit / delete / Expand-Collapse use `stopPropagation` on pointer down  
- **Phone:** column tabs in `Board` (`board-nav__tab`); inactive columns use `display: none` but stay mounted for DnD; tabs are droppable (`tab:ideas` …) so cross-column moves still work

If drag ever blanks the UI again: check console + ErrorBoundary message; avoid setState loops in `onDragOver`.

---

## Design knobs

| Want… | Change… |
|-------|---------|
| Page / column / card colors | `:root` tokens in `src/index.css` |
| Font weights | `--font-weight-title` / `--font-weight-body` |
| Column names / hints | `COLUMNS` in `src/data/placeholderBoard.ts` |
| Default column for global Add | `DEFAULT_NEW_COLUMN` (currently `ideas`) |
| Priority levels / labels / default | `src/data/priorities.ts`; badge colors via `--color-priority-*` tokens |

---

## Related docs

- **`PRODUCT.md`** — product decisions, checklist, roadmap, changelog  
- **`AGENTS.md`** — agent rules, constraints, session start checklist  
