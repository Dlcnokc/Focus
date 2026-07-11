# Focus

A calm, personal four-column board: **Ideas → Ready → Focus → Done**.

**Status (as of last session):** Core v1 loop works — create / edit / delete, drag move & reorder with live preview, save in the browser on refresh. Cards: long notes collapse/expand, copy notes, top-right icon actions. Solo only. **Live on Netlify.** No export or multi-user yet.

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

**Rebuild locally (without deploying):**

```powershell
cd C:\Users\accou\Desktop\Projects\Grok_Projects\Focus
npm run build
```

That writes production files to `dist/` only. Preview with `npm run preview`, or push `main` to publish.

---

## Resume tomorrow (session handoff)

Read these in order when starting a new session:

1. **`PRODUCT.md`** — what Focus is, v1 scope, non-goals, roadmap  
2. **`AGENTS.md`** — how agents should behave in this repo  
3. **This file** — how to run, folder map, current behavior  

### Suggested next work (not started — pick with the owner)

| Priority | Idea | Notes |
|----------|------|--------|
| High | **Export / import JSON backup** | Protects against clearing site data |
| Medium | Search / filter by title | v1.1 nice-to-have |
| Medium | Mobile / small-screen polish | Desktop-first today |
| Later | Cooperative / multi-user | Only if still wanted after daily solo use |

Do **not** start multi-user, auth, or a backend unless the owner asks.

### Quick start (Windows)

```powershell
cd C:\Users\accou\Desktop\Projects\Grok_Projects\Focus
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). For the **public** site, use the Netlify URL above.

| Command | What it does |
|---------|----------------|
| `npm run dev` | Dev server + live reload |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `git push origin main` | Triggers Netlify deploy (after commit) |

---

## What works today

| Feature | Behavior |
|---------|----------|
| **Columns** | Ideas, Ready, Focus, Done (fixed) |
| **Add card** | Header **Add card** → Ideas; column **+** / empty-state **Add card** → that column |
| **Edit** | Top-right pencil icon → centered modal (title + notes); title required |
| **Delete** | Top-right trash icon → themed confirm modal (blurred backdrop); no browser `alert` |
| **Copy notes** | Top-right clipboard icon (only if card has notes) → copies notes text; brief checkmark feedback |
| **Notes expand** | Long notes start collapsed (~3 lines); bold **Expand** / **Collapse** under the notes |
| **Drag** | Drag from **anywhere on the card** (not action icons / Expand) |
| **Live preview** | Other cards shift while dragging to show insert order |
| **Column highlight** | Column under cursor lights up (including source column) |
| **Cursor snap** | Floating card centers under the pointer (`snapCenterToCursor`) |
| **Save** | Auto-saves to `localStorage` key `focus.board.v1` |
| **Empty start** | No sample cards; board empty until you add some |
| **Crash recovery** | `ErrorBoundary` shows reload UI instead of a blank page |

### Known limits

- Data is **this browser only** on this machine. Clearing site data can wipe the board.
- No export/import yet.
- No accounts, sync, or second device.
- Phone layout is usable-ish, not polished.
- No keyboard shortcuts (by choice so far).

### Manual smoke test

1. Add cards via global and column **+**  
2. Reject empty title (validation message)  
3. Edit notes → Save (pencil icon)  
4. Long notes: collapsed preview, **Expand** / **Collapse**, **Copy** icon pastes notes  
5. Drag between columns; confirm live reordering  
6. Refresh page → board still there  
7. Delete with confirm (trash icon) → Cancel and confirm both work  

---

## Design system (quick reference)

| Token area | Where | Notes |
|------------|--------|--------|
| Colors, radii, type, space | `src/index.css` → `:root` | Theme tokens |
| Font | **Source Code Pro** (Google Fonts in `index.html`) | Titles **700**, body **400** |
| Palette | Near-black / greys, **white accent** | Calm dark |
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
    │   ├── storage.ts         load/save localStorage (`focus.board.v1`)
    │   ├── dnd.ts             Collision detection, column helpers
    │   └── boardMove.ts       Pure move/reorder for live preview + drop
    ├── data/
    │   └── placeholderBoard.ts  COLUMNS + DEFAULT_NEW_COLUMN (no seed cards)
    └── components/
        ├── Board.tsx              DndContext, overlay, column highlight
        ├── Column.tsx             Droppable column + list
        ├── Card.tsx               Sortable card + Edit/Delete
        ├── CardFormPanel.tsx      Centered add/edit modal
        ├── DeleteConfirmModal.tsx Centered delete confirm
        └── ErrorBoundary.tsx      Crash → reload message
```

### Mental model

1. Browser loads `index.html` → `main.tsx` → `App`  
2. `useBoard` owns the card list; saves to `localStorage` on change  
3. `Board` handles drag (preview + drop); columns/cards render the list  
4. Add/Edit → `CardFormPanel`; Delete → `DeleteConfirmModal`  
5. No server, no login  

### Card shape (code)

```ts
{
  id: string
  title: string
  notes: string
  column: 'ideas' | 'ready' | 'focus' | 'done'
  order: number   // position within column
}
```

---

## Storage

| Key | Value |
|-----|--------|
| `focus.board.v1` | JSON array of cards |

Load/normalize: `src/lib/storage.ts` (adds `order` if missing, reindexes per column).

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

---

## Related docs

- **`PRODUCT.md`** — product decisions, checklist, roadmap, changelog  
- **`AGENTS.md`** — agent rules, constraints, session start checklist  
