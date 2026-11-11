# Ivory Collection — integration and backend handoff

Route: `/collections/ivory` (GitHub Pages: `/#/collections/ivory`). Views via `?view=invitation|stationery|dashboard`; a household preview via `&household=iv-h05`.

## Files

| Path | Purpose |
|---|---|
| `src/pages/IvoryCollection.tsx` | Page: cover, letter, story, weekend, venue, notes, gallery, FAQ, RSVP, invitation, stationery, dashboard, scope |
| `src/collections/ivory/content.ts` | `IvoryData` v1 schema + defaults (stable IDs), package facts, fictional households/guests/seating |
| `src/collections/ivory/storage.ts` | Validation, weekend date shift, isolated IndexedDB drafts (`ewig-ivory-studio-v1`), versioned backups |
| `src/collections/ivory/model.ts` | Invited-only event totals, household status, catering summary, seating analysis, auto-seat |
| `src/collections/ivory/exports.ts` | CSV exports (households, catering, seating, run sheet), formula-injection safe |
| `src/collections/ivory/IvoryEditor.tsx` | Fixed-layout editor: couple, monogram, dates, venue, colours + contrast, weekend, meals, tables, all wording (EN/AF), photos, drafts, backups |
| `src/collections/ivory/IvoryDashboard.tsx` | Capability-driven tabs (Guests, Catering, Seating, Planner exports, Budget) wrapping the shared `CoupleDashboard` + print planner pack. Households have no tab: they show in the guest list and still drive invitations, auto-seating and exports |
| `src/collections/ivory/DepthHero.tsx` | Full-bleed cover in CSS 3D: photo (far), centred details (middle), transparent foreground (near); pointer tilt ≤ 2°, scroll separation, still under reduced motion |
| `src/collections/ivory/{Monogram,Stationery,EditorialGallery,IvoryRSVP}.tsx` | Monogram (3 styles), stationery suite (7 pieces), modular gallery, household RSVP |
| `src/collections/shared/{validateTemplate,capabilities,dates}.ts` | New shared helpers (schema validation, contrast, per-collection capabilities, strict dates) |
| `tests/ivory.test.tsx` · `node tests/run-ivory.mjs` | 14 tests: pricing, schema, backups, households, catering, seating, exports, rendering |

## Reused, not duplicated

`useHistory` (undo/redo, 60 steps), `createNamedDraftStore` (separate database), `CoupleDashboard` + `guestModel` (household commit, event responses, meal counts), the Eternal Ribbon opening (lazy-loaded, ivory theme, monogram initials), `validDate`, i18n language switch.

Shared changes, all backward compatible: `CoupleDashboard` gained optional `isInvited` and `demoNote` props, and its mis-encoded Afrikaans characters (`â€™`) were fixed — this also corrects Garden and Midnight. `validDate` moved to `shared/dates.ts` and is re-exported from Garden content so Ivory does not load Garden's copy and photos. Midnight still uses its own validator; it can move to `matchesTemplate` later.

## Budget

The shared `BudgetPlanner` now takes optional `storageKey` and `embedded` props. Ivory embeds it under `ewig-ivory-budget-v1`, separate from the standalone `/budget` planner (`ewig-eie-budget-v1`). Unlike the demo guests it is real, browser-only data; production needs authenticated shared storage before couples rely on it across devices. The planner UI is English-only for now.

## Data contract

`IvoryData` is a fixed-slot schema: the defaults are the template, so keys, array lengths and IDs must match exactly. Version is `1`; any other version is rejected (add a `migrateIvory` step for v2). `heroDepth` toggles the foreground layer; `heroForeground` is a transparent PNG/WebP slot excluded from the gallery. Bundled photos are exported as `ivory-asset:<id>` references; uploads are embedded data URLs (JPG/PNG/WebP ≤ 8 MB; SVG refused). Wedding date changes shift the whole weekend and the reply deadline.

## What needs a production backend

1. Couple and planner accounts with role-based access; agency editors.
2. Draft API replacing IndexedDB, with revision numbers and conflict detection; publish separately from save; rollback.
3. Media service: uploads, resizing, focal points, signed URLs. Replace embedded data URLs with media IDs. The gallery already accepts `{ id, src, alt, caption, focal }`.
4. Households and private invitation tokens; server-side enforcement that a household only sees and answers its invited events.
5. Reply storage with validation, edit deadlines, restricted access and retention controls for dietary, allergy and access data (POPIA).
6. Invitation delivery and reminders (email/WhatsApp) — nothing is sent today.
7. Shared seating and planner access, scheduled exports.
8. Venue-partner eligibility: keep `partnerEligibilityActive: false` until signed agreements exist; then verify partner status server-side, never from a client flag.

## Verification done

`npm run build`; `node tests/run-ivory.mjs` (14/14); `node tests/run-midnight.mjs` (6/6); budget checks. Browser journey at 1280 px and 390 px: edit → undo/redo → photo upload → palette/contrast → Afrikaans wording → named draft → backup download → reload → restore → import → reject foreign backup → household RSVP (validation + save) → dashboard totals → keyboard tabs → catering → auto-seat → capacity warning → four CSV exports → print pack → household invitation → ribbon opening/skip/focus return → reduced-motion bypass. No horizontal overflow on any view at either width; no console errors.
