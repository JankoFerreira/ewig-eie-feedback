# Midnight Collection

Preview: `/collections/midnight` (GitHub Pages: `/#/collections/midnight`). Mila Jacobs, Luca Daniels and Maison Nocturne are a fictional design concept. Generated couple imagery is illustrative.

## Scope and pricing

The website package is R5,600, with two consolidated revision rounds in the proposed service scope. The planned R3,600 venue-partner price remains inactive until real agreements exist. These prices exclude photography and physical printing.

## Editing and persistence

The fixed editorial layout exposes bilingual copy, names, colours, photographs and focal points, dates, event details, schedule and meal choices. Undo/redo uses the shared history reducer. Named drafts use the shared IndexedDB adapter under `ewig-midnight-studio-v1`; Garden retains its own namespace and format. Saving is explicit and browser-local, not publishing.

JSON backups carry collection identity, version 1 and stable content IDs. Validation rejects malformed, incompatible and unsafe content before applying it. Bundled image references use portable asset tokens; uploaded images are embedded. Keep backups before clearing browser data. Both language versions can be edited independently.

## Demonstrations and backend handoff

Welcome-event and wedding attendance, wedding meals, dietary/accessibility notes and dashboard summaries work with fictional households in page memory. They reset on reload. No real guest response is submitted and no message is sent. Dashboard CSV export is local. Avoid real personal information in this demonstration.

Production requires authenticated couple access, secure household invitation links, server-side validation and authorization, persistent response storage and a defined privacy/retention policy. Replace the page-level response state with a repository/API adapter while keeping stable guest, household, event and meal IDs. The shared dashboard accepts optional event and meal definitions without changing Garden's defaults.

`CinematicGallery` receives media as props and owns only presentation and lightbox navigation. A future media service can supply the same records, with upload authorization, storage, image optimization and deletion handled outside the component.

## Verification

- `npm run build`
- `node tests/run-midnight.mjs`: six tests covering backup validation/round trips, history, household responses, attendance/meal totals, Garden baseline compatibility and server rendering.
- Live browser checks: desktop and 360px layout, English/Afrikaans, editing, undo/redo, named-draft save and restore after reload, two-event RSVP and dashboard totals, lightbox arrow keys/Escape/focus return, and invitation bypass.
- Backup serialization/import validation is covered by automated tests; a browser file-download/import round trip was not completed.

Native dialog semantics, visible focus, optional invitation opening and reduced-motion CSS are included. No audio autoplay or scroll hijacking is used.
