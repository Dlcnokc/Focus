# Focus

A calm, personal four-column board: **Ideas → Ready → Focus → Done**.

**Status (handoff):** Solo v1 is **usable daily**. Live Netlify tracks **`main`**. Phone/UI polish is on branch **`ui-polish`** until merge.

Shipped (this branch): board CRUD + drag, notes collapse/copy, card icons (copy / edit / delete; archive on Done), **export/import**, **title search**, **Done archive**, **phone polish** (column tabs, header/card **···** menus, bottom-sheet modals, touch long-press drag), motion tokens, title validation shake, subtle scrollbars, **storage safety** (corrupt-load backup, no mid-drag saves, drag off while searching, Cancel-first confirms).

Not multi-user. **Next:** merge **`ui-polish` → `main`** (so the live site gets phone polish), then daily-use friction fixes only. Multi-user only if asked.

### Live site

**https://coruscating-travesseiro-be1b90.netlify.app/**

Use this URL for daily planning (not only `npm run dev`). Data is still **this browser only** on that site (`localStorage`).

| Source | Location |
|--------|----------|
| Code (private) | https://github.com/Dlcnokc/Focus |
| Hosted app | https://coruscating-travesseiro-be1b90.netlify.app/ |

### Deploy (how updates go live)

1. Change code locally  
2. Commit  
3. Push to **`main`** on GitHub  
4. Netlify auto-runs `npm run build` and publishes `dist`  

No drag-and-drop of `dist` needed after the GitHub link is set up. Check Netlify **Deploys** if a push did not appear live.

**Docs-only (or other non-app) commits — skip Netlify build:** put `[skip ci]` in the commit message. Example:

```text
Update README and PRODUCT handoff. [skip ci]
```

GitHub still gets the commit; Netlify **does not** rebuild the site. Use this for documentation-only changes. For real app changes, leave `[skip ci]` out so the live site updates.

**Rebuild locally (without deploying):**

```powershell
cd C:\Users\accou\Desktop\Projects\Grok_Projects\Focus
npm run build
```

That writes production files to `dist/` only. Preview with `npm run preview`, or push `main` to publish.

---

## Resume tomorrow (session handoff)

### Before you edit (stay on the right branch)

Always work in **this folder only** (the git clone), not a second copy or a GitHub ZIP.

**Default (shipped live / after polish merges):**

```powershell
cd C:\Users\accou\Desktop\Projects\Grok_Projects\Focus
git checkout main
git pull origin main
git status
```

You want: **`On branch main`**, **`up to date with 'origin/main'`**. Then edit; when ready, commit and `git push origin main` so GitHub and Netlify match your PC.

**While phone/UI polish is still in flight:** stay on **`ui-polish`** — do **not** force-checkout `main` (that drops this work). Pull and push that branch instead:

```powershell
git checkout ui-polish
git pull origin ui-polish
git status
```

Grok (or any agent) can run `git pull` for you at session start — just ask, or it should do this as part of its session checklist.

### Read these in order

1. **`PRODUCT.md`** — what Focus is, v1 scope, non-goals, roadmap  
2. **`AGENTS.md`** — how agents should behave in this repo  
3. **This file** — how to run, folder map, current behavior  

### Suggested next work (pick with the owner)

| Priority | Idea | Notes |
|----------|------|--------|
| **Next** | Merge **`ui-polish` → `main`** | Phone polish is done on the branch; live Netlify only updates after merge + push `main` |
| Habit | Weekly **Export** backup | Browser-only data |
| From use | Fix real friction only | Anything that slows daily planning (no large redesign without asking) |
| Later | Cooperative / multi-user | Only if still wanted after daily solo use |
| Out of scope for now | Separate tax/tools hub site | Owner may do later in another repo — leave Focus alone |

Do **not** start multi-user, auth, or a backend unless the owner asks.

### Quick start (Windows)

```powershell
cd C:\Users\accou\Desktop\Projects\Grok_Projects\Focus
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). For the **public** site, use the Netlify URL above.

**Phone on the same Wi‑Fi (no deploy needed):**

```powershell
npm run dev -- --host
```

Vite prints a **Network** URL like `http://192.168.x.x:5173` — open that on your phone. PC and phone must be on the same network. Or use the live Netlify URL after a push.

| Command | What it does |
|---------|----------------|
| `npm run dev` | Dev server + live reload (this PC only) |
| `npm run dev -- --host` | Dev server reachable from phone on LAN |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `git push origin main` | Triggers Netlify deploy (after commit), unless message has `[skip ci]` |

---

## What works today

| Feature | Behavior |
|---------|----------|
| **Columns** | Ideas, Ready, Focus, Done (fixed) |
| **Add card** | Header **Add card** → Ideas; column **+** / empty-state **Add card** → that column; create modal title **New card** |
| **Edit** | Pencil icon → modal (title + notes); title required; empty title shows red message + brief shake |
| **Delete** | Trash icon → themed confirm modal (blurred backdrop); no browser `alert` |
| **Copy notes** | Clipboard icon (only if card has notes) → copies notes text; brief checkmark feedback |
| **Notes expand** | Long notes start collapsed (~3 lines); bold **Expand** / **Collapse** under the notes |
| **Card actions** | Desktop: top-right icons — copy (if notes), **archive (Done only)**, edit, delete. Phone: same actions behind card **···** |
| **Header actions** | Desktop: Archive / Export / Import as a row next to **Add card**. Phone: those three behind header **···**; **Add card** stays primary |
| **Drag** | Drag from **anywhere on the card** (not action icons / Expand / Collapse). Mouse: small move threshold. Touch: **long-press** so list scroll can win first |
| **Live preview** | Other cards shift while dragging to show insert order |
| **Column highlight** | Column under cursor lights up (including source column) |
| **Cursor snap** | Floating card centers under the pointer (`snapCenterToCursor`) |
| **Phone columns** | **Tabs** (Ideas / Ready / Focus / Done) show one column at a time — no horizontal column scroll; drag onto a tab to move a card across columns |
| **Modals** | Desktop: centered. Phone: **bottom sheet** with handle; full-width actions where helpful |
| **Save** | Auto-saves to `localStorage` key `focus.board.v1` (not during live drag preview; saves on drop / other edits) |
| **Corrupt load** | Bad JSON → backup key `focus.board.v1.bak`, banner + Dismiss, **no overwrite** until user edits/imports |
| **Empty start** | No sample cards; board empty until you add some |
| **Crash recovery** | `ErrorBoundary` shows reload UI instead of a blank page |
| **Export** | **Export** → downloads `focus-board-YYYY-MM-DD.json` (all cards, incl. archived) |
| **Import** | **Import** → pick JSON → **Replace** (wipe board) or **Merge** (same id updates; new ids add) |
| **Search** | Header **Search titles…** — filters visible cards by title only (case-insensitive); full board still saved; **drag disabled** while search is active |
| **Archive** | Done cards only: archive control → confirm → leaves board. **Archive (N)** lists Restore / permanent Delete; search titles in that modal |

### Known limits

- Data is **this browser only** on this machine / origin. Clearing site data can wipe the board — use **Export** as a backup.
- `localhost` and Netlify are **different** boards (different origins).
- No accounts, sync, or second device (export/import is the cross-device path).
- Live Netlify is **`main` only** — phone polish on `ui-polish` is not public until that branch merges.
- No keyboard shortcuts (by choice so far).
- Multi-tab: last write wins (no live sync between tabs).

### Manual smoke test

1. Add cards via global and column **+** (modal says **New card**)  
2. Reject empty title (red message + brief shake)  
3. Edit notes → Save (pencil / card menu)  
4. Long notes: collapsed preview, **Expand** / **Collapse**, **Copy** pastes notes  
5. Drag between columns (search empty); confirm live reordering; refresh → order kept  
6. Search on → drag disabled; clear search → drag works  
7. Delete / Archive / Import confirms → **Cancel** is focused first  
8. Export → open the JSON file → should list cards (incl. archived if any)  
9. Import → Merge and Replace both work; bad file shows error modal  
10. Done → archive → confirm → Archive list → Restore / Delete  
11. Phone/narrow: column tabs; header **···** for Archive/Export/Import; card **···** for actions; long-press to drag; modals rise as bottom sheets  

---

## Design system (quick reference)

| Token area | Where | Notes |
|------------|--------|--------|
| Colors, radii, type, space | `src/index.css` → `:root` | Theme tokens |
| Font | **Source Code Pro** (Google Fonts in `index.html`) | Titles **700**, body **400**, header wordmark **500** |
| Palette | Near-black / greys, **white accent** | Calm dark |
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
├── package.json
├── index.html                 Loads fonts + app
├── vite.config.ts
├── tsconfig*.json
├── public/
│   ├── favicon.svg
│   └── icons.svg              Vite leftover; app icons are inline SVG in Card.tsx
└── src/
    ├── main.tsx               React mount + ErrorBoundary
    ├── App.tsx                Header, board, modals wiring
    ├── index.css              Theme tokens + all styles
    ├── types.ts               Card, ColumnId, EditorMode
    ├── hooks/
    │   └── useBoard.ts        State: CRUD, persist, drag preview API
    ├── lib/
    │   ├── storage.ts         loadBoard/saveCards (`focus.board.v1` + `.bak`)
    │   ├── boardFile.ts       Export/import JSON parse, merge, download
    │   ├── dnd.ts             Collision detection, column helpers
    │   └── boardMove.ts       Pure move/reorder for live preview + drop
    ├── data/
    │   └── placeholderBoard.ts  COLUMNS + DEFAULT_NEW_COLUMN (no seed cards)
    └── components/
        ├── Board.tsx              DndContext, overlay, column highlight
        ├── Column.tsx             Droppable column + list
        ├── Card.tsx               Sortable card + icons + notes expand
        ├── CardFormPanel.tsx      Centered add/edit modal
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
  "cards": [ { "id", "title", "notes", "column", "order", "archived" } ]
}
```

Import also accepts a bare JSON array of cards (same fields). Invalid cards are skipped; if none are valid, import fails with an error modal.


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
  column: 'ideas' | 'ready' | 'focus' | 'done'
  order: number   // position within column
  archived: boolean
}
```

---

## Storage

| Key | Value |
|-----|--------|
| `focus.board.v1` | JSON array of cards |
| `focus.board.v1.bak` | Raw backup if main key is corrupt |

Load/normalize: `src/lib/storage.ts` (`loadBoard`) — `order` / `archived` defaults, trim titles, dedupe ids, reindex per column.

---

## Drag implementation notes (for agents)

- **Library:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers`, `@dnd-kit/utilities`
- **Collision:** `pointerWithin` first (`src/lib/dnd.ts`) so columns activate under the cursor, not only near center
- **Live preview:** `onDragOver` → `previewMove` / `applyCardMove` so other cards make room
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

---

## Related docs

- **`PRODUCT.md`** — product decisions, checklist, roadmap, changelog  
- **`AGENTS.md`** — agent rules, constraints, session start checklist  
