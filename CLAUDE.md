# Puslegutta Skrive — Workflow Instructions

## Repos

All repos live under `/Users/nicolay/Puslegutta/`:

| Repo | GitHub | URL | Description |
|------|--------|-----|-------------|
| Skrive | Puslegutta/Skrive | https://skrive-cms.pages.dev | Vue 3 skriveapp for quizrunder |
| Iddiotquiz | Puslegutta/Iddiotquiz | — | Vue 3 quiz app (frontend + Cloud Functions) |
| PusleguttaCMS | Puslegutta/PusleguttaCMS | — | Sanity CMS schemas and studio |

## What This App Does

Mobilvennlig web-app for å skrive og redigere Iddiotquiz-runder visuelt — uten markdown, uten VS Code. Hele runden vises som et inline-redigerbart dokument med spørsmål, svar, alternativer og overgangsord. Skriver direkte til Sanity via API.

## Tech Stack

- **Framework:** Vue 3 + Vite
- **Editor:** TipTap 3 (ProseMirror-basert) for Portable Text-redigering
- **Backend:** Ingen — direkte Sanity API via `@sanity/client`
- **Auth:** Enkel passcode-gate med sessionStorage
- **Hosting:** Cloudflare Pages (`skrive-cms.pages.dev`)
- **Language:** JavaScript (no TypeScript)
- **Styling:** Plain CSS with CSS custom properties (warm book-like theme)

## Architecture

### Data Flow

```
Sanity (zlkgs6oe/production)
  ↕ @sanity/client (read/write)
Skriveappen (Vue 3 SPA)
  → Portable Text ↔ TipTap JSON (bidirectional serialization)
  → localStorage (draft backup, dark mode pref)
```

### Key Directories

```
src/
  composables/     # Shared logic (Sanity client, rounds CRUD, ideas, auth)
  editor/          # TipTap setup + Portable Text serialization
  components/      # Reusable UI (QuestionBlock, IdeaBankPanel, etc.)
  views/           # Route-level pages
  styles/          # CSS custom properties + theme
  config/          # Sanity client config
  router/          # Vue Router with auth guard
```

### Composables

| File | Purpose |
|------|---------|
| `useSanityClient.js` | Singleton `@sanity/client` instance |
| `useRounds.js` | CRUD for `iddiotRound` docs, merge-patch save strategy |
| `useIdeas.js` | CRUD for `iddiotIdea` docs (idea bank) |
| `useAutoNumber.js` | Assigns next `roundNumber` when marking round as done |
| `useAuth.js` | Passcode login with sessionStorage |

### Editor (Portable Text ↔ TipTap)

| File | Purpose |
|------|---------|
| `portableTextToTiptap.js` | Converts Sanity PT block → TipTap JSON doc |
| `tiptapToPortableText.js` | Converts TipTap JSON → Sanity PT block |
| `TransitionInMark.js` | TipTap Mark extension for `transitionIn` annotations |
| `TransitionOutMark.js` | TipTap Mark extension for `transitionOut` annotations |
| `QuestionEditor.vue` | Reusable TipTap editor for a single PT block |

### Views

| View | Route | Purpose |
|------|-------|---------|
| `RoundListView` | `/` | Alle runder med filtrering (alle/utkast/ferdige) |
| `RoundEditorView` | `/round/:id` | Inline-redigering av en hel runde |
| `ImageTasksView` | `/image-tasks` | Spørsmål med bildenotat men uten bilde |
| `LoginView` | `/login` | Passcode-innlogging |

## Key Patterns

- **Composition API** with `<script setup>` throughout
- **Portable Text:** Spørsmål og svar er Sanity Portable Text (arrays av blocks). Serialiseres til/fra TipTap JSON ved lesing/skriving
- **Options are plain strings** (not Portable Text)
- **Transition word marks:** `transitionIn`/`transitionOut` annotations med sub-word selection support
- **Unknown marks preserved:** `helpText` og andre ukjente annotations bevares gjennom round-trips via `preservedMarkDefs` sidecar
- **Merge-patch saves:** Henter eksisterende doc fra Sanity, sammenligner, og skriver kun endrede felter. Bevarer `extraImage` og andre felt appen ikke redigerer
- **Auto-numbering:** Runder uten `roundNumber` er utkast. Nummer tildeles automatisk ved status `done`
- **Dark mode:** `.dark-mode` class on `<html>` + `<body>`, tokens in `variables.css`
- **localStorage draft backup:** Ulagrede endringer caches i localStorage og gjenopprettes ved reload
- **Responsive:** Hamburger-meny på mobil, sidebar overlay for idebank, sticky top bar

## Sanity CMS

- **Project:** `zlkgs6oe`, dataset: `production`
- **Schema types:** Definert i `PusleguttaCMS/schemaTypes/`
- **Relevant types:** `iddiotRound` (runder med spørsmål), `iddiotIdea` (idébank)
- **CORS origins:** `https://skrive-cms.pages.dev` og `http://localhost:5173`

## Deployment

```bash
# Local development
npm run dev

# Build and deploy to Cloudflare Pages
npm run build
CLOUDFLARE_ACCOUNT_ID=78091b104d93212d9139295aafdd94c8 wrangler pages deploy dist --project-name skrive-cms

# Environment variables (in .env, baked into build)
VITE_SANITY_PROJECT_ID=zlkgs6oe
VITE_SANITY_DATASET=production
VITE_SANITY_TOKEN=<editor token from sanity.io/manage>
VITE_APP_PASSCODE=<chosen passcode>
```

## Commit Message Rules

- No `Co-Authored-By` lines
- Imperative mood, capitalize first word
- Short (under 72 chars), descriptive

## Code Style

- Follow existing patterns in the codebase
- Don't add unnecessary abstractions
- All color values must use CSS custom properties — no hardcoded rgba/hex
- Norwegian for user-facing text, English for code identifiers
