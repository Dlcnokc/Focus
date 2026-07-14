# AGENTS.md — Focus

Instructions for coding agents. Prefer this file + `PRODUCT.md` + `README.md` over assumptions. **Code wins** for shapes, flags, and styles — docs state intent and invariants.

---

## Session start

1. **One clone only** (this repo folder). Do not edit a ZIP or second copy.
2. **Sync the active branch** (default **`dlcnokc`** — experimental work branch — unless the owner says otherwise):
   ```powershell
   git checkout dlcnokc
   git pull origin dlcnokc
   git status
   ```
   Confirm branch + clean/expected dirty state. Do **not** force-checkout `main` while unmerged work lives on a feature branch.
3. Read **`PRODUCT.md`** (current model). Skim this file.
4. For run/deploy/smoke: **`README.md`**.
5. If changing code: `pnpm run dev` from repo root.
6. Implement the **smallest** requested slice.

If `PRODUCT.md` conflicts with a user request, **ask once** before implementing the conflict.

---

## Product snapshot

Kanban: **Ideas → Waiting → Priority → Completed** (ids `ideas/ready/focus/done`).

- Cards: title (**max 20**), notes, priority, `completedAt`, `archived`, `order`
- Display sort: priority on Ideas/Waiting/Priority; date newest-first on Completed; manual `order` is the **tiebreaker**
- Drag + live preview; persist `localStorage` key `focus.board.v1`
- Full product rules: **`PRODUCT.md`**

---

## Owner & communication

- Values clean, simple UI; often wants theme tweaks.
- After meaningful work: say **what** changed and **how to try it**.
- Plain English; small reviewable diffs; product language (“your board,” “a card”).
- Do not teach or over-explain unless asked.

---

## Current architecture (match what exists)

1. **Four fixed columns** — title + notes + priority; DnD; `localStorage` persistence.
2. **One board** in the browser; no backend, auth, or cloud sync in code today.
3. **Theme tokens** — colors/fonts/spacing via CSS variables in `src/index.css`; no scattered hard-coded colors.
4. **Modals** — shared `ModalShell` (focus trap + restore, Escape, scroll lock); themed + blurred backdrop. Desktop: centered. Phone: bottom sheet; add/edit tall + **×** + Cancel. Not `alert`/`confirm`.
5. **No keyboard shortcuts** in the app today.

---

## Design & UX rules

- Mood: calm dark greyscale; white accent. Semantic color: muted danger/edit/archive, priority ramp, required asterisk.
- Type weights, board overrides, form fields: **`src/index.css`** (do not invent a second system).
- Header: ring + **Focus** only; favicon matches ring.
- Columns quieter than cards; empty columns = quiet text (no dashed placeholder card).
- Whole card draggable; action controls + notes Expand must stay clickable (`pointerdown` stop on those).
- Desktop: card/header action icons visible. Phone: **···** for secondary; **Add card** stays primary; column **selector** (headers hidden); drop chips while dragging.
- Notes collapse at ~2 lines (layout measure). Live drag preview; column under cursor highlights; overlay snaps to cursor center.
- Motion: shared CSS tokens; respect `prefers-reduced-motion`.
- Design changes: tokens first, then layout if needed. No unrelated refactors while theming.

---

## Where logic lives

| Concern | Location |
|---------|----------|
| Card CRUD + persist | `src/hooks/useBoard.ts` |
| localStorage load/save | `src/lib/storage.ts` |
| Title max / validate / clamp | `src/lib/cardTitle.ts` + form + load clamp |
| Export / import | `src/lib/boardFile.ts` + header + import modals |
| Archive / restore | `useBoard` + archive modals |
| Priority rank / sort | `src/data/priorities.ts` (`comparePriorityThenOrder`) + `PriorityBadge` / `PriorityPromptModal` |
| completedAt / date sort | `src/lib/dates.ts` (`compareCompletedDateThenOrder`, `isIsoDate`) |
| Display sort applied | `cardsInColumn` in `storage.ts` (Column + Board consume sorted lists) |
| Column enter/leave rules | `src/lib/columnRules.ts` + flags in `placeholderBoard.ts` (wired from `useBoard` commit) |
| Drag collision / phone drop ids | `src/lib/dnd.ts` (`isReservedCardId`) |
| Pure move / reorder | `src/lib/boardMove.ts` |
| DnD UI / selector / overlay | `src/components/Board.tsx` |
| Notes measure / Expand | `src/components/Card.tsx` |
| Theme / layout CSS | `src/index.css` |
| Column defs + flags | `src/data/placeholderBoard.ts` |
| Modal shell (focus trap / restore) | `src/components/ModalShell.tsx` + `useModalChrome.ts` |
| Crash screen | `src/components/ErrorBoundary.tsx` |

Card shape: **`src/types.ts`**.

---

## Quality bar

- After meaningful changes: app must **run**; say how to open/test. Prefer **`pnpm run test` + `pnpm run build`** after logic changes; always build when touching types or drag.
- **Column placement** must survive refresh. **Display order** is priority/date first; manual `order` is a **tiebreaker** and survives among equal rank/date only.
- Drag commit is **atomic**: column transition rules (priority clear, `completedAt` stamp/clear/preserve) apply before the committed board is saved. **No mid-drag persist** — save on commit / cancel restore / non-drag mutations only.
- Reserved droppable ids (column ids, `tab:…` phone chips) **must not** be used as card ids.
- `isIsoDate` must be **calendar-valid** (`YYYY-MM-DD` that is a real date), not format-only.
- **Never wipe** `localStorage` without migration or explicit approval.
- Corrupt load: backup to `focus.board.v1.bak` on hard failure; **block save** until the user changes the board (do not write `[]` over bad data); surface load-error banner; multi-tab `storage` notice without auto-overwrite; `ErrorBoundary` for render crashes.
- Title search: **disable drag** while filter active.
- Title empty or **>20 chars**: reject with red message + shake; form `n/20` + `maxLength={20}`; load/import **clamps** long titles.
- Destructive confirms: focus **Cancel** first (`btn--danger` primary). Priority prompt focuses select (**Use Medium** applies Medium).
- Form create/edit: **submit lock** after a successful submit (no double cards).
- Avoid `onDragOver` setState loops (blank screen risk). Skip no-op previews; no reshuffle on same-column chrome only.
- Pure board logic has unit tests under `src/lib/*.test.ts`. CI (`.github/workflows/ci.yml`) runs lint + test + build on `main` / `dlcnokc`.
- No secrets in the repo.

---

## Git & risk

- No force-push or history rewrite without asking.
- Prefer small commits when the owner wants version control.
- **Docs-only** commits: put **`[skip ci]`** in the message so Netlify does not rebuild.
- Netlify deploys **`main` only**.

---

## Workflows

**Design change:** tokens in `index.css` → layout only if needed → describe how to preview.

**Ambiguity:** smaller interpretation matching `PRODUCT.md`; ask **one** focused question; document lasting decisions in `PRODUCT.md`.

**Done when:** behavior works on a manual check; scope stayed asked; theme/modal/drag conventions hold; user knows what to click and see.

---

## Commands

```powershell
pnpm install
pnpm run dev
pnpm run test
pnpm run lint
pnpm run build
```
