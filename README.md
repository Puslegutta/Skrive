# Skrive

Visual editor for writing and editing Iddiotquiz rounds — no markdown, no VS Code. Built for mobile-first use with a warm, book-like aesthetic. Uses [Sanity CMS](https://www.sanity.io/) as backend — reads and writes quiz data directly via the Sanity API, so all content stays in the existing Sanity dataset used by the quiz app.

**Live:** https://skrive-cms.pages.dev

## Features

- Inline-editable quiz rounds: questions, answers, options, extra info
- Transition word annotations with sub-word selection (TipTap/ProseMirror)
- Visual transition chain between questions
- Idea bank sidebar for storing question ideas and transitions
- Auto-numbering: drafts get a round number when marked as done
- Merge-patch saves that never overwrite unmanaged Sanity fields
- Dark mode, responsive design, PWA-installable

## Tech Stack

Vue 3, Vite, TipTap 3, Sanity CMS (`@sanity/client`), Cloudflare Pages

## Getting Started

```bash
npm install
cp .env.example .env  # Fill in Sanity token and passcode
npm run dev
```

## Deploy

```bash
npm run build
wrangler pages deploy dist --project-name skrive-cms
```

## Related

- [Iddiotquiz](https://github.com/Puslegutta/Iddiotquiz) — The quiz app that uses these rounds
- [PusleguttaCMS](https://github.com/Puslegutta/PusleguttaCMS) — Sanity CMS schemas
