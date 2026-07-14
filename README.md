# Focus

A calm personal board: **Ideas → Ready → Priority → Completed**. Solo-only for now (no multi-user).

| | |
|--|--|
| **Live** | https://coruscating-travesseiro-be1b90.netlify.app/ |
| **Code** | https://github.com/Dlcnokc/Focus (private) |
| **Data** | This browser only (`localStorage`) — live site and `localhost` are different boards |

Product decisions: **`PRODUCT.md`**. Agent rules: **`AGENTS.md`**.

---

## Resume work

Use **this git clone only** (not a second folder or ZIP).

```powershell
cd <your local clone>
git checkout ui-polish    # active work branch — confirm with: git branch
git pull origin ui-polish
git status
```

- Stay on **`ui-polish`** until you intentionally merge to **`main`**.
- **Netlify** deploys **`main` only**. Do not force-checkout `main` if unmerged work is on `ui-polish`.
- What’s unmerged: `git log main..HEAD --oneline`

When you want the **live site** updated: merge `ui-polish` → `main`, push `main`.

---

## Run locally

Package manager: **pnpm** (see `package.json` `packageManager`).

```powershell
pnpm install
pnpm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

| Command | What |
|---------|------|
| `pnpm run dev` | Dev server (this PC) |
| `pnpm run dev --host` | Reachable from phone on same Wi‑Fi |
| `pnpm run build` | Production build → `dist/` |
| `pnpm run preview` | Preview that build |

---

## Deploy

1. Commit your changes  
2. Push **`main`** on GitHub  
3. Netlify builds and publishes `dist` (uses pnpm from the lockfile)

**Docs-only commits:** add **`[skip ci]`** to the commit message so Netlify does not rebuild.

---

## How the board works (short)

| | |
|--|--|
| **Add** | Header **Add card** → Ideas; column **+** (not on Completed — drag cards there) |
| **Edit / delete** | Icons (phone: card **···**); themed modals, not browser alerts |
| **Title** | Required, max **20** characters (`n/20` in the form) |
| **Priority** | Low → Immediate; badge; Ideas/Ready/Priority sort by rank; drop into Priority prompts if unranked |
| **Completed** | Date stamped on entry; sorts newest first; **Archive** only from here |
| **Notes** | Long notes collapse after ~2 lines; Expand / Collapse; copy |
| **Drag** | Drag the whole card; live preview; long-press on phone |
| **Phone** | Column **selector** at top (one column); drop chips while dragging across columns |
| **Search** | Filters by title; drag off while searching |
| **Export / Import** | JSON backup; import Replace or Merge |

**Limits:** clearing site data wipes the board — use **Export**. No accounts or sync. Title max 20 is intentional. No keyboard shortcuts by default.

---

## Quick smoke test

1. Add a card (title counter `n/20`); empty title should error + shake  
2. Edit notes; Expand if notes wrap past ~2 lines  
3. Drag across columns; refresh — order and column still correct  
4. Search on → drag disabled; clear search → drag works  
5. Priority: badge + sort; unranked into Priority → prompt  
6. Into Completed → date shows; archive → Archive list → restore  
7. Export JSON; import Merge or Replace  
8. Phone width: selector switches columns; long-press drag  

---

## Where things live

```
Focus/
├── PRODUCT.md · AGENTS.md · README.md
├── package.json · pnpm-lock.yaml · netlify.toml
├── index.html · public/favicon.svg
└── src/
    ├── App.tsx · main.tsx · index.css · types.ts
    ├── hooks/     useBoard, useModalChrome
    ├── lib/       storage, cardTitle, boardFile, dnd, boardMove, dates
    ├── data/      placeholderBoard (columns + flags), priorities
    └── components/ Board, Column, Card, CardFormPanel, modals…
```

| Want to change… | Look in… |
|-----------------|----------|
| Colors, fonts, spacing | `src/index.css` (`:root` tokens) |
| Column names / rules | `src/data/placeholderBoard.ts` |
| Priority levels | `src/data/priorities.ts` |
| Title max length | `src/lib/cardTitle.ts` |
| Card fields | `src/types.ts` |

---

## Habits

- Weekly **Export** backup  
- Prefer small daily-use fixes over large redesigns without deciding first  
- Multi-user / cloud only if you still want them after solo use feels right  
