# AGENTS.md — Focus

Instructions for coding agents. Prefer this file + `PRODUCT.md` + `README.md` over assumptions. **Code wins** for shapes, flags, and styles — docs state intent and invariants.

---

## Session start

1. **One clone only** (this repo folder). Do not edit a ZIP or second copy.
2. **Sync the active branch** (default **`ui-polish`** unless the owner says otherwise):
   ```powershell
   git checkout ui-polish
   git pull origin ui-polish
   git status
   ```
   Confirm branch + clean/expected dirty state. Do **not** force-checkout `main` while unmerged work lives on a feature branch.
3. Read **`PRODUCT.md`** (model, non-goals). Skim this file.
4. For run/deploy/smoke: **`README.md`**.
5. If changing code: `pnpm run dev` from repo root.
6. Implement the **smallest** requested slice. No multi-user or backend unless asked.

If `PRODUCT.md` conflicts with a user request, **ask once** before implementing the conflict.

---

## Product snapshot

Solo kanban: **Ideas → Ready → Priority → Completed** (ids `ideas/ready/focus/done`).

- Cards: title (**max 20**), notes, priority, `completedAt`, `archived`
- Sort: priority on Ideas/Ready/Priority; date newest-first on Completed
- Drag + live preview; persist `localStorage` key `focus.board.v1`
- Full product rules: **`PRODUCT.md`**

---

## Owner & communication

- Learning real app development; values clean, simple UI; often wants theme tweaks.
- Targets **only themselves** for v1.
- After meaningful work: say **what** changed and **how to try it**.
- Plain English; small reviewable diffs; product language (“your board,” “a card”).

---

## Constraints (do not violate without asking)

1. **v1 scope** — four fixed columns; title + notes + priority; DnD; browser persistence; calm dark greyscale + white accent; Source Code Pro.
2. **No multi-user** / cooperative features until requested.
3. **No feature bloat** — tags, due dates, assignees, attachments, charts, notifications stay out unless asked.
4. **One board only.**
5. **Browser-only persistence** — no backend, auth, or cloud sync unless asked.
6. **Theme tokens** — colors/fonts/spacing via CSS variables in `src/index.css`; no scattered hard-coded colors.
7. **Modals** — themed + blurred backdrop (not `alert`/`confirm`, not a drawer). Desktop: centered. Phone: bottom sheet; add/edit tall + **×** + Cancel.
8. **No keyboard shortcuts** unless asked.

---

## Design & UX rules

- Mood: calm dark greyscale; white accent. Semantic color only for muted danger/edit/archive, priority ramp, required asterisk.
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
| Priority rank / sort | `src/data/priorities.ts` + `PriorityBadge` / `PriorityPromptModal` |
| completedAt / date sort | `src/lib/dates.ts` |
| Drag collision / phone drop ids | `src/lib/dnd.ts` |
| Pure move / reorder | `src/lib/boardMove.ts` |
| DnD UI / selector / overlay | `src/components/Board.tsx` |
| Notes measure / Expand | `src/components/Card.tsx` |
| Theme / layout CSS | `src/index.css` |
| Column defs + flags | `src/data/placeholderBoard.ts` |
| Modal Escape / scroll lock | `src/hooks/useModalChrome.ts` |

Card shape: **`src/types.ts`**.

---

## Quality bar

- After meaningful changes: app must **run**; say how to open/test. Prefer `pnpm run build` when touching types or drag.
- Drag order and column placement must **survive refresh**.
- **Never wipe** `localStorage` without migration or explicit approval.
- Corrupt load: backup to `focus.board.v1.bak` on hard failure; **block save** until the user changes the board (do not write `[]` over bad data).
- **No mid-drag persist** — save on commit / cancel restore / non-drag mutations only.
- Title search: **disable drag** while filter active.
- Title empty or **>20 chars**: reject with red message + shake; form `n/20` + `maxLength={20}`; load/import **clamps** long titles.
- Destructive confirms: focus **Cancel** first. Priority prompt focuses select (Cancel → Medium).
- Avoid `onDragOver` setState loops (blank screen risk). Skip no-op previews; no reshuffle on same-column chrome only.
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

## Out of scope unless requested

Team boards, invites, roles · Cloud sync, accounts, OAuth · Backend · Native apps · Analytics · Heavy PM (sprints, points) · Seed/sample cards · Other products (tax/tools hub) in this repo

---

## Commands

```powershell
pnpm install
pnpm run dev
pnpm run build
```
