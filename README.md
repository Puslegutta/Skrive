# Skrive

Skreddersydd visuell editor for å skrive innhold til Puslegutta-appene — uten markdown, uten VS Code, rett fra mobilen.

**Live:** https://skrive-cms.pages.dev

## Hvorfor Skrive når vi har Sanity?

[Sanity Studio](https://github.com/Puslegutta/PusleguttaCMS) er bra som CMS og database, men er et generisk verktøy som ikke er designet for den kreative skriveprosessen. Å skrive quizrunder i Sanity Studio (eller i VS Code med markdown) krevde manuell nummerering, skjemafelt etter skjemafelt, og terminalen for å deploye. Det funket ikke på mobil, det var feilbarlig, og det var demotiverende — resultatet var at innholdsproduksjon stoppet opp.

Skrive er bygget for å løse dette: en mobilvennlig app der hele runden vises som et sammenhengende, redigerbart dokument — som å skrive i en bok, ikke fylle ut et skjema. Sanity lever videre som database og for bildehåndtering, mens Skrive er det daglige skriveverktøyet.

Appen er foreløpig bygget for [Iddiotquiz](https://github.com/Puslegutta/Iddiotquiz), men arkitekturen er laget for å enkelt legge til nye produkter (Wrd, fremtidige apper) som egne moduler med felles shell.

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
