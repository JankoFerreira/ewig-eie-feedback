# Garden Collection integration and backend handoff

## Working preview

The Garden Collection is available at `/collections/garden` (GitHub Pages: `/#/collections/garden`). The preview toolbar switches between the website, invitation and reusable couple dashboard. English and Afrikaans use the approved content pack in `concepts/garden/`.

Make it yours enables click-to-edit wording and photographs across the website, including RSVP copy. Names, wedding date, venue, story and palette have dedicated controls. Layout remains fixed to the Garden template. Undo/redo covers text, image and detail changes. Named drafts are stored in IndexedDB on the current browser, including uploaded images. JSON backups can be downloaded and imported. Saved drafts must be reopened explicitly after a reload; basic couple details also retain the earlier localStorage behaviour. Uploaded preview images never leave the browser. No account, collaboration or server publishing exists yet.

RSVP and dashboard use eight fictional guests. Replies, dietary details and attendance edits are shared while this page stays open and reset on reload. CSV export is available. These demo responses are not sent anywhere. The dashboard component takes guest data and theme variables and can be reused by another collection.

## Backend discussion

1. Couple accounts and role-based access: couples, invited guests, agency editors. The public demo must remain isolated from real guest data.
2. Draft API: stable template version, bilingual content overrides, theme, couple details and media IDs; revision numbers for conflict detection. The prototype's positional content keys should become explicit stable field IDs before long-term production migrations.
3. Media storage: authenticated uploads, size/type validation, image resizing, focal points and signed URLs for private galleries. Replace embedded draft image data with durable media IDs.
4. Gallery block contract: a media list (ID, URL, alt text, aspect ratio, focal point), a layout enum (editorial, masonry, slideshow, photo rain), and motion preferences. Photo-rain effects need a static reduced-motion version and mobile performance limits.
5. Guests and RSVP: private invitation tokens, household membership, per-person responses, edit deadlines and server validation. Dietary/allergy/access information needs restricted access and retention controls.
6. Publishing: preview URL separate from the published wedding site, explicit publish action and rollback to a saved revision. Draft saving alone must never publish.

## Validation

Production TypeScript/Vite build. Desktop and 390px mobile visual checks, EN/AF copy, personalisation, photo upload, draft save/reopen, undo/redo, invitation opening/replay and skip, dashboard filters, CSV export, and RSVP-to-dashboard counts. Seed totals are 8 invited / 5 accepted / 1 declined / 2 pending, with 3 accepted dietary requirements and 1 allergy note.
