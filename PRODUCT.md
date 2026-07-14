# Focus — Product

**Focus** is a kanban board: **Ideas → Ready → Priority → Completed**. Clean, calm, drag-and-drop.

| Doc | Role |
|-----|------|
| **This file** | What the product is today |
| **`AGENTS.md`** | How coding agents work in this repo |
| **`README.md`** | Run, deploy, smoke test (human runbook) |

---

## Status

- **v1** is usable daily. Export weekly as a backup.
- **Active work branch:** `ui-polish` (confirm with `git branch` / `git status`).
- **Live site** tracks **`main` only** → https://coruscating-travesseiro-be1b90.netlify.app/
- **Code:** https://github.com/Dlcnokc/Focus (private)
- What’s unmerged: `git log main..HEAD --oneline` (on `ui-polish`)
- To update the live site: merge `ui-polish` → `main` and push `main`.

---

## Principles

1. **Simple first** — fewer features that feel great.
2. **Calm UI** — soft dark greyscale; white accent; no visual shouting.
3. **Themeable** — colors/fonts via CSS variables (`src/index.css`).

---

## Board model

### Columns (fixed)

| ID (storage) | Label | Hint |
|--------------|--------|------|
| `ideas` | Ideas | Not figured out yet |
| `ready` | Ready | Clear, not started |
| `focus` | Priority | Ranked by importance |
| `done` | Completed | Finished |

Ids are stable; only labels changed historically. **One board.**

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
| `priority` | Low → Immediate; **always set in Priority**; cleared on enter Completed (not restored on leave) |
| `completedAt` | `YYYY-MM-DD`; see Completed rules below |
| `order` | Manual drag rank; **tiebreaker** after priority / date display sorts |

---

## Behavior (invariants)

- **Display sort vs order:** Ideas / Ready / Priority sort by priority (highest first), then `order` as tiebreaker. Completed sorts by `completedAt` newest first, then `order`. Manual drag order only sticks among equal rank / same date.
- **Priority column:** unranked drop → rank prompt (**Use Medium** / Cancel path applies Medium).
- **Completed:** no direct add (drag only); archive only here. Entering clears priority (not restored on leave). `completedAt` is stamped on first enter if missing, **preserved** if already set when re-entering; editable on the edit form while the card is in Completed; cleared when leaving Completed.
- **Notes:** collapse when layout exceeds ~2 lines (measure, not character count).
- **Drag:** whole card; live insert preview; search active → drag off.
- **Phone:** one column via **selector**; headers hidden; drop chips while dragging for cross-column moves.
- **Desktop:** four columns; action icons always visible.
- **Empty board** on first load (no seed cards). Empty columns: quiet text only.
- **Modals:** themed + blur; focus trap + restore; desktop centered; phone bottom sheet (tall form + ×). Destructive confirms use muted danger primary; Cancel focused first. No browser `alert`/`confirm`.
- **Resilience:** corrupt load → backup key + **block save** until an intentional board change; load-error banner in the UI; multi-tab change notice (no auto-overwrite); `ErrorBoundary` crash screen (reload) so a drag/render failure does not blank the session forever.

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
- **Semantic color today:** muted danger / edit / archive, priority badge ramp, required asterisk.
