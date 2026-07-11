# AGENTS.md — Focus

Instructions for any coding agent working in this repository. Follow these every session. Prefer this file + `PRODUCT.md` + `README.md` over assumptions.

---

## Session start (do this first)

1. Read **`PRODUCT.md`** — especially current status, shipped checklist, non-goals.  
2. Read **`README.md`** — run commands, folder map, drag/storage notes, “resume tomorrow”.  
3. Skim this file.  
4. Run the app if changing code: `npm run dev` from `Focus/`.  
5. Implement the **smallest** requested slice; do not invent multi-user or backend work.

---

## What this project is

**Focus** is a solo-first personal kanban board:

- Columns: **Ideas → Ready → Focus → Done**  
- Cards: title + notes  
- Drag to move/reorder with **live preview**  
- Persist in **`localStorage`** key `focus.board.v1`  

If `PRODUCT.md` and a user request conflict, **ask the user** before implementing the conflict.

---

## Who the owner is

- Learning real application development (basic web design background).  
- Values **clean, simple UI** and will often want **theme / design** tweaks.  
- Targets **only themselves** for v1.  
- Prefers working software + plain-English explanations over jargon and over-architecture.

### How to communicate

- Explain *what* changed and *how to try it* after meaningful steps.  
- Gloss jargon in one line when needed.  
- Prefer small, reviewable diffs.  
- Teach with product language (“your board,” “a card”) when helpful.

---

## Product constraints (do not violate without asking)

1. **v1 scope** — four fixed columns, title + notes, DnD, browser persistence, calm dark greyscale + white accent, Source Code Pro.  
2. **No multi-user / cooperative** features until explicitly requested.  
3. **No feature bloat** — tags, due dates, assignees, attachments, charts, notifications stay out unless asked.  
4. **One board only** in v1.  
5. **Browser-only persistence** — do not add backend, auth, or cloud sync unless asked.  
6. **Theme tokens** — colors/fonts/spacing via CSS variables in `src/index.css`; avoid scattered hard-coded colors.  
7. **Modals** — add/edit/delete use **centered** themed modals with blurred backdrop (not browser `alert`/`confirm`, not a side drawer).  
8. **No keyboard shortcuts** unless the user asks for them.

---

## Design & theme rules

- Mood: **calm dark greyscale**; **white/off-white accent**.  
- Font: **Source Code Pro** — titles/labels **700**, body/notes **400** (avoid ultra-thin weights).  
- Header shows **Focus** only (no marketing subtitle).  
- Columns quieter than cards; cards use subtle fill + box-shadow.  
- Whole **card** is draggable; action icons (copy/edit/delete) and notes Expand/Collapse must remain clickable (`pointerdown` stop on those controls).  
- Long notes: collapse by default (~3 lines); bold Expand/Collapse under notes; copy notes via top-right icon.  
- While dragging: live insert preview; column under cursor highlights (including source column); overlay snaps to cursor center.  
- Design changes: update tokens first, then layout if needed.

---

## Engineering principles

### Keep it simple

- Stack is already chosen: **Vite + React + TypeScript + @dnd-kit + localStorage**.  
- Do not add dependencies without a clear need.  
- Prefer readable code over clever code.  
- No microservices, no heavy state libraries unless complexity forces it.

### Where logic lives

| Concern | Location |
|---------|----------|
| Card CRUD + persist hooks | `src/hooks/useBoard.ts` |
| localStorage load/save | `src/lib/storage.ts` |
| Export/import JSON | `src/lib/boardFile.ts` + header + import modals |
| Drag collision helpers | `src/lib/dnd.ts` |
| Pure move/reorder | `src/lib/boardMove.ts` |
| DnD UI / overlay / highlight | `src/components/Board.tsx` |
| Theme / layout CSS | `src/index.css` |
| Column definitions | `src/data/placeholderBoard.ts` |

### Quality bar

- After meaningful changes: app must **run**; say exactly how to open/test.  
- Prefer `npm run build` when touching types or drag logic.  
- Drag order and column placement must **survive refresh**.  
- **Never wipe** `localStorage` user data without migration or explicit approval.  
- Avoid `onDragOver` setState loops (blank screen risk). Skip no-op previews; do not reshuffle when hovering same-column chrome only.  
- No secrets in the repo.

### Git & risk

- Do not force-push or rewrite published history without asking.  
- Prefer small commits when the user wants version control.  
- Docs-only pushes: include **`[skip ci]`** in the commit message so Netlify does not rebuild (see README → Deploy).

---

## Build order / phase status

| Phase | Status |
|-------|--------|
| 1 Shell + design tokens | **Done** |
| 2 / 2.1 CRUD + centered modals + empty board | **Done** |
| 3 Persist + drag + live preview | **Done** |
| Deploy (Netlify + GitHub) | **Done** |
| Export / import JSON | **Done** |
| Title search | **Done** |
| v1.1 Mobile polish, archive | **Not started** |
| Cooperative / multi-user | **Not started** — ask first |

---

## When the user asks to change design

1. Update tokens / theme definitions first.  
2. Touch layout components only if needed.  
3. Describe how to preview.  
4. Do not refactor unrelated logic while theming.

---

## When requirements are ambiguous

- Prefer the smaller interpretation that matches `PRODUCT.md`.  
- Ask **one** focused question rather than a long questionnaire.  
- Document product decisions in `PRODUCT.md` when they stick.

---

## Definition of done (per task)

1. Described behavior works on a manual check.  
2. Scope stayed inside what was asked.  
3. Theme/token and modal/drag conventions still hold.  
4. User is told what to click and what they should see.

---

## Out of scope unless requested

- Team boards, invites, roles  
- Cloud sync, accounts, OAuth  
- Backend/database  
- Mobile native apps  
- Analytics, ads, telemetry  
- Heavy PM features (sprints, points, burndown)  
- Seed/sample cards on first load (owner wants empty board)

---

## Useful commands

```powershell
cd C:\Users\accou\Desktop\Projects\Grok_Projects\Focus
npm install
npm run dev
npm run build
```
