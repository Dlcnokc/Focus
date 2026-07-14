# Focus — Product

**Focus** is a solo personal kanban board: **Ideas → Ready → Priority → Completed**. Clean, calm, drag-and-drop. No multi-user until you ask.

| Doc | Role |
|-----|------|
| **This file** | What the product is and is not |
| **`AGENTS.md`** | How coding agents work in this repo |
| **`README.md`** | Run, deploy, smoke test (human runbook) |

---

## Status

- **Solo v1** is usable daily. Export weekly as a backup.
- **Active work branch:** `ui-polish` (confirm with `git branch` / `git status`).
- **Live site** tracks **`main` only** → https://coruscating-travesseiro-be1b90.netlify.app/
- **Code:** https://github.com/Dlcnokc/Focus (private)
- What’s unmerged: `git log main..HEAD --oneline` (on `ui-polish`)
- When you want the live site updated: merge `ui-polish` → `main` and push `main`.

---

## Principles

1. **Simple first** — fewer features that feel great.
2. **Calm UI** — soft dark greyscale; white accent; no visual shouting.
3. **Themeable** — colors/fonts via CSS variables (`src/index.css`).
4. **Solo-first** — no multi-user complexity until requested.
5. **Explainable** — owner is learning real app development.

---

## Board model

### Columns (fixed)

| ID (storage) | Label | Hint |
|--------------|--------|------|
| `ideas` | Ideas | Not figured out yet |
| `ready` | Ready | Clear, not started |
| `focus` | Priority | Ranked by importance |
| `done` | Completed | Finished |

Ids are stable; only labels changed historically. **One board only.**

**Behavior flags** live in `src/data/placeholderBoard.ts` (check flags, not raw ids):

| id | requiresPriority | clearsPriority | allowsDirectAdd | allowsArchive | tracksCompletedDate |
|----|------------------|----------------|-----------------|---------------|---------------------|
| `ideas` | | | ✓ | | |
| `ready` | | | ✓ | | |
| `focus` | ✓ | | ✓ | | |
| `done` | | ✓ | | ✓ | ✓ |

### Cards

Canonical shape: **`src/types.ts`**. In short:

| Field | Notes |
|-------|--------|
| `id`, `title`, `notes`, `column`, `order`, `archived` | Core |
| `title` | Required; **max 20 chars** (see `src/lib/cardTitle.ts`) |
| `priority` | Low → Immediate; **always set in Priority**; cleared on Completed |
| `completedAt` | `YYYY-MM-DD`; stamped on entering Completed; cleared on leave |

**Not in product:** tags, due dates, assignees, attachments, comments, multiple boards.

---

## Behavior (invariants)

- **Sort:** Ideas / Ready / Priority → by priority (ranked first); Completed → by `completedAt` newest first.
- **Priority column:** unranked drop → rank prompt (Cancel → Medium).
- **Completed:** no direct add (drag only); archive only here; entering clears priority and stamps date.
- **Notes:** collapse when layout exceeds ~2 lines (measure, not character count).
- **Drag:** whole card; live insert preview; search active → drag off.
- **Phone:** one column via **selector**; headers hidden; drop chips while dragging for cross-column moves.
- **Desktop:** four columns; action icons always visible.
- **Empty board** on first load (no seed cards). Empty columns: quiet text only.
- **Modals:** themed + blur; desktop centered; phone bottom sheet (tall form + ×). No browser `alert`/`confirm`.

Details and edge cases: **code first**, then `AGENTS.md` quality bar.

---

## Storage

| Key | Purpose |
|-----|---------|
| `focus.board.v1` | Card array JSON |
| `focus.board.v1.bak` | Backup on hard load failure |

Browser `localStorage` only. No accounts. `localhost` ≠ Netlify (different origins). Never wipe user data without migration or explicit approval. Load/normalize rules: `src/lib/storage.ts`. Export/import: `src/lib/boardFile.ts`.

---

## Design direction

- **Mood:** calm dark greyscale; white/off-white accent.
- **Font:** Source Code Pro (weights and board overrides in `src/index.css`).
- **Header:** ring mark + **Focus** only; favicon matches the ring.
- **Tokens:** all colors, type, space, motion in `src/index.css` `:root`.
- **Exceptions for color:** muted danger / edit / archive, priority badge ramp, required asterisk — no new hues without asking.

---

## Non-goals (unless you ask)

- Multi-user, roles, invites, real-time collab  
- Backend, auth, cloud sync  
- Tags, due dates, assignees, attachments, charts, notifications  
- Keyboard shortcuts, native apps  
- Separate “tools hub” / tax apps in this repo  

---

## Next (product, not history)

- Merge `ui-polish` → `main` when you want Netlify updated  
- Fix daily-use friction only; no large redesign without asking  
- Multi-user only if still wanted after solo use feels solid  
