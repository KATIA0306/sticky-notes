# Sticky Notes

A single-page sticky notes application built with **React 18 + TypeScript + Vite**.

## Getting Started

```bash
cd sticky-notes
npm install
npm run dev
```

Open `http://localhost:5173` in Chrome, Firefox, or Edge (minimum 1024×768).

## Build for production

```bash
npm run build   # type-checks then bundles to dist/
npm run preview # serve the production build locally
```

## Features

| # | Feature | Notes |
|---|---------|-------|
| 1 | **Create note at specified position & size** | Click anywhere on the board to open the note creator. Set width, height, and color, then click *Create*. The note appears at the click position. The *+ New Note* toolbar button opens the creator at a random central position. |
| 2 | **Resize by dragging** | Drag the striped handle in the bottom-right corner of any note. |
| 3 | **Move by dragging** | Drag the colored header bar of any note to reposition it. |
| 4 | **Delete by dragging to trash** | A trash zone appears at the bottom of the screen while you drag. Drop a note onto it to delete. |
| I | **Text editing** | Click the body of any note and type. |
| II | **Bring to front** | Clicking or dragging any note raises it to the top. |
| III | **Local storage** | Notes persist across page reloads automatically. |
| IV | **Note colors** | Six color options: yellow, pink, blue, green, orange, lavender. |
| V | **Mock REST API** | Every create/update/delete is mirrored to an async mock API (`src/services/api.ts`) with simulated network latency. |

## Tips

- **Quick delete**: click the `×` button in a note's header.
- **Keyboard**: press `Escape` to dismiss the note creator without creating a note.

## Project structure

```
src/
  components/
    Board.tsx        # Root canvas — state, event routing, optimistic mutations
    Note.tsx         # Individual note — display, edit, drag/resize surface
    NoteCreator.tsx  # Popover for configuring and placing a new note
    TrashZone.tsx    # Drop target shown during drag
  hooks/
    useDragManager.ts  # Document-level mouse handling, CSS-transform drag engine
  services/
    api.ts           # Mock async REST API (swap for real fetch calls to go live)
    storage.ts       # localStorage persistence
  store/
    reducer.ts       # Pure reducer — all note state transitions
  types/
    index.ts         # Note, NoteColor, NoteAction types
```

## Architecture

State lives in a single `useReducer` in `Board`. All mutations follow an **optimistic update + rollback** pattern: the UI updates immediately, the API call runs async, and a failure reverts the change. Text edits are debounced 500 ms before hitting the API to avoid per-keystroke requests.

The drag engine (`useDragManager`) applies `transform: translate()` directly to the DOM during a move — zero React re-renders until mouse-up. `React.memo` on `Note` combined with stable ref callbacks per note ID keeps idle notes from re-rendering when anything else on the board changes.
