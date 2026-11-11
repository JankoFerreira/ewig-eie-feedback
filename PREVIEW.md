# Invitation and Garden previews

Run `npm run dev -- --host 127.0.0.1 --port 5175`.

- `/collections/garden`: editable Garden website, matching invitation, reusable dashboard demo.
- `/collections/midnight`: cinematic bilingual website, optional invitation, editor and two-event dashboard demo. See `concepts/midnight/INTEGRATION.md`.
- `/invitation-preview`: standalone Eternal Ribbon preview.
- `/collections/ivory`: flagship Ivory weekend — website, `?view=invitation&household=iv-h05`, `?view=stationery`, `?view=dashboard`.

The invitation uses generated photographic cotton paper, translucent silk and champagne wax assets. A textured fabric mesh provides the pull-through effect; a raster fallback supports devices without WebGL. Skip, Escape and reduced motion bypass the opening. The green heart pointer stays visible above the invitation and in the details editor.

See `concepts/garden/INTEGRATION.md` for draft storage behaviour and backend handoff. Pushes to main deploy to the GitHub Pages feedback site.

## Wedding and honeymoon budget

Open `/budget` locally (GitHub Pages uses `/#/budget`). The site footer links to the planner.

1. In Settings enter names, dates, opening savings and an optional safety buffer.
2. Opening savings means total funds before any payments recorded in this app. To record historical payments, add those payments back to the current cash balance first.
3. Add full expense allocations for Wedding or Honeymoon, suppliers, due dates and notes.
4. Record deposits and subsequent payments. These reduce cash and outstanding costs, but do not increase the full allocation.
5. Add each planned savings contribution with a date. Mark received when the money arrives; do not duplicate opening savings.
6. Overview projects the balance after all allocations and the buffer. The Savings cash-flow view flags timing gaps, excluding undated bills and events beyond the deadline.
7. Download JSON backups regularly. Restore replaces the entire local budget. CSV exports expense summaries only.

Persistence is browser-local and not encrypted. No login, shared-device synchronization or backend is included. Do not clear browser data without a backup. Real couple collaboration requires authenticated shared storage and server-side access controls before launch as a shared product.

Verification: `npm run build`; `node src/features/budget/model.test.mjs`.
