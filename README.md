# Focus

A calm, personal four-column board: **Ideas → Ready → Priority → Completed**.

**Status (handoff):** Solo v1 is **usable daily** and live on Netlify.

Shipped: board CRUD + drag, notes collapse/copy, icons, **card priority** (badge + auto-sort + prompt), **export/import**, **title search**, **Completed archive**, **mobile CSS**, subtle scrollbars, **storage safety** (corrupt-load backup, no mid-drag saves, drag off while searching, safer confirm focus).

Not multi-user. Next: daily use + friction fixes; multi-user only if asked.

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

Read these in order when starting a new session:

1. **`PRODUCT.md`** — what Focus is, v1 scope, non-goals, roadmap  
2. **`AGENTS.md`** — how agents should behave in this repo  
3. **This file** — how to run, folder map, current behavior  

### Suggested next work (pick with the owner)

| Priority | Idea | Notes |
|----------|------|--------|
| Habit | Weekly **Export** backup | Browser-only data |
| From use | Fix real friction only | Phone drag, archive extras, etc. |
| Later | Cooperative / multi-user | Only if still wanted after daily solo use |
| Out of scope for now | Separate tax/tools hub site | Owner may do later in another repo — leave Focus alone |

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
| **Add card** | Header **Add card** → Ideas; column **+** / empty-state **Add card** → that column. **Completed has no add** — cards only arrive there by drag |
| **Edit** | Top-right pencil icon → centered modal (title + notes + priority); title required (red asterisk) |
| **Priority** | Low → Immediate (6 levels): dropdown on create/edit, colored badge on card, every column sorts ranked cards first. Dropping an unranked card into Priority prompts for a rank (Cancel = Medium); entering Completed clears it |
| **Completed date** | Entering Completed stamps today's date (shown on the card); editable via date picker in the edit modal; Completed sorts newest-first by it; leaving Completed clears it |
| **Delete** | Top-right trash icon → themed confirm modal (blurred backdrop); no browser `alert` |
| **Copy notes** | Top-right clipboard icon (only if card has notes) → copies notes text; brief checkmark feedback |
| **Notes expand** | Long notes start collapsed (~3 lines); bold **Expand** / **Collapse** under the notes |
| **Drag** | Drag from **anywhere on the card** (not action icons / Expand) |
| **Live preview** | Other cards shift while dragging to show insert order |
| **Column highlight** | Column under cursor lights up (including source column) |
| **Cursor snap** | Floating card centers under the pointer (`snapCenterToCursor`) |
| **Save** | Auto-saves to `localStorage` key `focus.board.v1` (not during live drag preview; saves on drop / other edits) |
| **Corrupt load** | Bad JSON → backup key `focus.board.v1.bak`, banner, **no overwrite** until user edits/imports |
| **Empty start** | No sample cards; board empty until you add some |
| **Crash recovery** | `ErrorBoundary` shows reload UI instead of a blank page |
| **Export** | Header **Export** → downloads `focus-board-YYYY-MM-DD.json` (all cards) |
| **Import** | Header **Import** → pick JSON → **Replace** (wipe board) or **Merge** (same id updates; new ids add) |
| **Search** | Header **Search titles…** — filters visible cards by title only (case-insensitive); full board still saved; **drag disabled** while search is active |
| **Archive** | Completed cards only: archive icon → confirm → leaves board. Header **Archive (N)** lists Restore / permanent Delete; search titles in that modal. Export includes archived |

### Known limits

- Data is **this browser only** on this machine / origin. Clearing site data can wipe the board — use **Export** as a backup.
- `localhost` and Netlify are **different** boards (different origins).
- No accounts, sync, or second device (export/import is the cross-device path).
- Phone: four columns swipe horizontally; header stacks; desktop unchanged.
- No keyboard shortcuts (by choice so far).
- Multi-tab: last write wins (no live sync between tabs).

### Manual smoke test

1. Add cards via global and column **+**  
2. Reject empty title (validation message)  
3. Edit notes → Save (pencil icon)  
4. Long notes: collapsed preview, **Expand** / **Collapse**, **Copy** icon pastes notes  
5. Drag between columns (search empty); confirm live reordering; refresh → order kept  
6. Search on → drag disabled; clear search → drag works  
7. Delete / Archive / Import confirms → **Cancel** is focused first  
8. Export → open the JSON file → should list cards (incl. archived if any)  
9. Import → Merge and Replace both work; bad file shows error modal  
10. Completed → archive icon → confirm → Archive list → Restore / Delete  
11. Priority: create a ranked card (badge shows, column sorts); drag an unranked card into Priority → prompt appears; drag a ranked card into Completed → badge clears  
12. Phone/narrow: swipe columns; header stacks  

---

## Design system (quick reference)

| Token area | Where | Notes |
|------------|--------|--------|
| Colors, radii, type, space | `src/index.css` → `:root` | Theme tokens |
| Font | **Source Code Pro** (Google Fonts in `index.html`) | Titles **700**, body **400** |
| Palette | Near-black / greys, **white accent** | Calm dark. Two sanctioned color exceptions: priority-badge ramp (`--color-priority-*`) and required-field red (`--color-required`) |
| Columns | Soft `--color-column` fill | Quieter than cards |
| Cards | Lighter fill + box-shadow | Drag whole card |
| Modals | Centered `.modal` + blurred `.modal-backdrop` | Add/edit + delete |

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
├── public/favicon.svg
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
    │   ├── placeholderBoard.ts  COLUMNS + DEFAULT_NEW_COLUMN (no seed cards)
    │   └── priorities.ts        Priority levels, rank, sort, labels, default
    └── components/
        ├── Board.tsx              DndContext, overlay, column highlight
        ├── Column.tsx             Droppable column + list
        ├── Card.tsx               Sortable card + icons + notes expand
        ├── CardFormPanel.tsx      Centered add/edit modal
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
| `focus.board.v1.bak` | Raw backup if main key is corrupt |

Load/normalize: `src/lib/storage.ts` (`loadBoard`) — `order` / `archived` defaults, trim titles, dedupe ids, reindex per column.

---

## Drag implementation notes (for agents)

- **Library:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers`, `@dnd-kit/utilities`
- **Collision:** `pointerWithin` first (`src/lib/dnd.ts`) so columns activate under the cursor, not only near center
- **Live preview:** `onDragOver` → `previewMove` / `applyCardMove` so other cards make room
- **Stability:** skip no-op moves; do not reshuffle when hovering **same column chrome** only (prevents React update loops / blank screen)
- **Cancel:** snapshot at drag start; restore if drop cancelled / no `over`
- **Overlay:** `DragOverlay` + `snapCenterToCursor`; whole card is draggable; Edit/Delete `stopPropagation` on pointer down

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
