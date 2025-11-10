# Gluely Copilot — Desktop MVP

This repository contains a working desktop prototype of the Gluely meeting copilot. It includes:

- **Electron overlay app** (`apps/desktop`) with hotkeys, realtime hint stream, note pad, and follow-up draft button.
- **Express-based BFF** (`services/bff`) that simulates meeting lifecycle APIs and pushes live suggestions over WebSockets.
- **Shared utilities** (`packages/shared`) with canonical realtime data helpers.
- **Prompt profiles** (`packages/prompts`) ready to plug into a production LLM workflow.

The goal is to ship a buildable application (including Windows `.exe` packaging via Electron Builder) that demonstrates the end-to-end meeting flow: start a meeting, receive realtime suggestions, collect notes, and draft a follow-up.

## Quick Start

> **Prerequisites**
> - Node.js 18+
> - npm 9+

Install all workspace dependencies:

```bash
npm install
```

Start the backend service (port `8787`):

```bash
npm run bff:start
```

In a new terminal, launch the desktop overlay:

```bash
npm run desktop:start
```

The panel appears as an always-on-top frameless window. Use the tray icon to show/hide or quit the app.

### Demo Hotkeys

| Shortcut | Action |
| --- | --- |
| `Alt+Space` | Toggle overlay visibility |
| `Alt+Shift+A` | Inject a sample AI answer suggestion |
| `Alt+Shift+N` | Append a timestamped note |

The BFF sends a fresh suggestion every five seconds to showcase the realtime experience. Copy the latest suggestion with **Copy answer**, or build a follow-up email via **Generate follow-up**.

## Packaging a Windows `.exe`

Electron Builder is configured for a portable Windows build. After installing dependencies, run:

```bash
npm run desktop:package:win
```

The portable executable will be available at `apps/desktop/dist/Gluely Copilot.exe`. macOS and Linux targets remain accessible through `npm run desktop:package` when executed on their respective platforms.

> **Tip**: The repository ships with a GitHub Actions workflow (`Build Windows desktop package`) that runs the same command on every push and uploads the `.exe` as a downloadable artifact.

## Project Structure

```
apps/desktop        # Electron overlay UI
  └─ src
      ├─ main.js    # main process
      ├─ preload.js # secure IPC bridge
      └─ renderer   # HTML/CSS/JS panel
services/bff        # Express + WebSocket BFF mock
packages/shared     # Shared helper utilities
packages/prompts    # Prompt profiles for LLM workflows
```

## Backend API Overview

| Endpoint | Description |
| --- | --- |
| `POST /api/meetings/start` | Create a meeting session and return `{ meeting_id }`. |
| `WS /api/meetings/stream` | Subscribe to suggestion events using `{ type: "subscribe", meetingId }`. |
| `POST /api/meetings/:id/notes` | Build structured notes from stored transcript chunks. |
| `POST /api/meetings/:id/followup` | Draft a follow-up email based on collected hints. |
| `GET /api/meetings/:id/export?fmt=md` | Return a Markdown snapshot of the meeting. |

These endpoints currently serve deterministic demo data. Swap in production integrations for real ASR, OCR, and LLM workflows.

## Shared Utilities

The `@gluely/shared` package exports helpers used across the app and backend:

```js
import { SuggestionKind, createSuggestion, createRealtimeFrame, formatTimestamp } from '@gluely/shared';
```

- `SuggestionKind` — canonical suggestion type enum.
- `createSuggestion()` — validates and normalizes suggestion payloads.
- `createRealtimeFrame()` — shapes transcript/OCR/context events.
- `formatTimestamp()` — formats millisecond offsets into `mm:ss` strings.

## Prompt Profiles

Prompt templates live in `packages/prompts` and can be loaded directly by the BFF once LLM access is wired:

- `realtime.json` — streaming hints using transcript + OCR context.
- `notes.json` — post-meeting summary generator.
- `followup.json` — friendly follow-up email composer.

## Next Steps

- Replace mock suggestion ticker with actual ASR/OCR feeds and OpenAI responses.
- Persist meeting artifacts in Postgres + object storage.
- Harden the overlay for production (auto-launch, OS-specific permissions, idle suspend, etc.).
- Add cross-platform installers (NSIS, DMG, AppImage) and automatic updates.

With the provided scaffolding you can iterate rapidly towards a production-ready meeting copilot experience.

## Publishing to Your GitHub Repository

Once you are satisfied with local changes or packaged builds, push them to your own GitHub repository:

1. Create a new repository on GitHub (or reuse an existing private repo).
2. Add it as a remote:
   ```bash
   git remote add origin https://github.com/<your-account>/<your-repo>.git
   ```
3. Commit your work locally (see commit history in this repo for guidance) and push:
   ```bash
   git push -u origin work
   ```

Replace `work` with whichever branch you want to publish. If you already have a remote configured, run `git remote -v` to confirm and adjust the push command accordingly.
