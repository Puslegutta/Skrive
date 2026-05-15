# Coding Conventions

These rules apply to all code in Skrive. They reflect the existing patterns in the codebase.

## Language & Framework

- **JavaScript only** — no TypeScript, no type annotations
- **Vue 3 Composition API** with `<script setup>` exclusively — no Options API
- **Vue Router 4** with auth guard and lazy-loaded routes
- **TipTap 3** (ProseMirror-based) for rich text editing
- **@sanity/client** for direct CMS access — no Pinia, no Vuex
- ES modules throughout (`"type": "module"` in package.json)

## Components

- `<script setup>` on every component
- Props via `defineProps()` with type + required/default
- Emits via `defineEmits(['event-name'])`
- Event handler naming: `handleSave`, `handleDelete`, `toggleDarkMode`

### Component Naming

- **File names**: PascalCase — `QuestionBlock.vue`, `IdeaBankPanel.vue`
- **Views**: suffix `View` — `RoundListView.vue`, `RoundEditorView.vue`
- **Panels/sidebars**: suffix `Panel` — `IdeaBankPanel.vue`
- **Modals**: suffix `Modal` — `ConfirmModal.vue`
- **Popovers**: suffix `Popover` — `TransitionWordPopover.vue`

### Import Organization

1. Vue core (`ref`, `computed`, `watch`, `onMounted`, etc.)
2. Framework imports (`vue-router`)
3. Local composables (`../composables/`)
4. Local components (`../components/`)
5. Local utilities (`../editor/`)

All imports use explicit relative paths with `.js` extension for composables/utils.

## State Management

- **No centralized store** — composables + component refs
- **Sanity client**: singleton via `useSanityClient()` composable
- **Component state**: `ref()` for reactive data
- **localStorage** for draft backup and dark mode preference
- **sessionStorage** for auth state

### Change Detection (Snapshot Pattern)

```js
const savedSnapshot = ref(null)
const hasChanges = computed(() => JSON.stringify(round.value) !== savedSnapshot.value)
```
After save: `savedSnapshot.value = JSON.stringify(round.value)`

### Draft Backup

- Auto-save drafts to `localStorage['skrive-draft-${roundId}']` via deep watcher
- Recover on page reload — prompt user to restore or discard
- Clear draft on successful save

## Composables

- File naming: `useXxx.js` in `src/composables/`
- Singleton pattern for Sanity client:
  ```js
  let client = null
  export function useSanityClient() {
    if (!client) client = createClient(sanityConfig)
    return { client }
  }
  ```
- Composables: `useRounds`, `useIdeas`, `useAuth`, `useAutoNumber`, `useSanityClient`

## TipTap / Portable Text Integration

- Editor config in `src/editor/`
- Bidirectional conversion: `portableTextToTiptap()` ↔ `tiptapToPortableText()`
- Custom mark extensions: `TransitionInMark`, `TransitionOutMark`
- StarterKit with disabled features (no headings, bullet lists, etc. — quiz text only)
- Unknown annotations (e.g., `helpText`) preserved in sidecar through round-trips
- Emit Portable Text array on every editor `onUpdate`

## Sanity Integration

### GROQ Queries

- Always filter by `_type`: `*[_type == "iddiotRound"]`
- Always order explicitly: `| order(roundNumber asc)`
- Project only needed fields
- Use parameterized queries: `client.fetch(query, { id })`

### Merge-Patch Saves

**Critical pattern** — Skrive doesn't manage all fields (e.g., `extraImage`):
```js
// Only patch changed fields — never overwrite the entire document
const patchData = {}
for (const key of managedFields) {
  if (data[key] !== existing?.[key]) patchData[key] = data[key]
}
await client.patch(id).set(patchData).commit()
```
Never use `createOrReplace()` — it would wipe unmanaged fields.

### Document Types

- `iddiotRound`: main quiz round with nested questions array
- `iddiotIdea`: idea bank entries (`text`, `used` flag)

## CSS & Theming

- **All colors via CSS custom properties** — no hardcoded hex/rgba
- Variables defined in `src/styles/variables.css` (warm book theme)
- Global styles in `src/styles/theme.css`
- Scoped styles (`<style scoped>`) on all components
- Dark mode: `.dark-mode` class on `<html>` + `<body>`, persisted in localStorage
- Transition word colors: `--color-transition-in` (purple), `--color-transition-out` (orange)
- Chain validation colors: `--color-chain-ok` (green), `--color-chain-break` (red)

### Typography

- Body/content: Georgia, serif
- UI elements: system fonts (-apple-system, Segoe UI)
- Code: SF Mono, Fira Code

### Spacing

CSS custom properties: `--space-xs` (0.25rem) through `--space-2xl` (3rem)

### Responsive Design

- Mobile-first
- Hamburger menu at `max-width: 640px`
- Idea panel: overlays on mobile, pushes content on desktop (1100px+)
- `.mobile-only` / `.desktop-only` utility classes

## Router

- 4 routes: `/login`, `/` (rounds list), `/round/:id` (editor), `/image-tasks`
- Auth guard: redirects to `/login` if no sessionStorage auth
- Lazy-loaded views: `component: () => import('../views/RoundListView.vue')`

## Authentication

- Simple passcode gate — compared against `VITE_APP_PASSCODE` env var
- Auth state in sessionStorage (cleared on browser close)
- No user accounts — single shared editor access

## Keyboard Shortcuts

- `Cmd+S` / `Ctrl+S`: save current round (prevent default, trigger save)
- `Enter` in idea textarea: add idea
- `Escape` in edit mode: cancel

## Testing

- Vitest + Vue Test Utils
- Test files in `tests/` (not `src/__tests__/`)
- Unit tests for: editor serialization, composable logic
- Test edge cases: null input, empty arrays, unknown marks

## Environment Variables

```
VITE_SANITY_PROJECT_ID=zlkgs6oe
VITE_SANITY_DATASET=production
VITE_SANITY_TOKEN=<editor token>
VITE_APP_PASSCODE=<passcode>
```

## Error Handling

- Try-catch in async functions with `error.value` refs
- Loading states: `loading.value = true` / `false` in `finally`
- Success feedback: temporary status message with 2s timeout
- Confirmation modal before destructive actions (delete round)
- Console errors via `console.error()` — no logging library

## Never

- Add TypeScript or type annotations
- Use `createOrReplace()` for Sanity documents — always merge-patch
- Hardcode color values — use CSS custom properties from `variables.css`
- Use Options API or `export default {}`
- Add a centralized store (Pinia/Vuex) — use composables + component refs
- Overwrite unmanaged Sanity fields — only patch fields Skrive controls
- Skip confirmation for destructive actions

## Exceptions

- `BackspaceTextField`-style UIKit wrapping doesn't apply here (web-only app)
- Passcode auth is intentionally simple — no need for proper auth flow
- `preservedMarkDefs` sidecar is a workaround for annotations Skrive doesn't edit (helpText)
