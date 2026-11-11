# Guest features: Today mode, day-of roster, disposable camera

Shared modules in `src/features/today/` and `src/features/camera/`. Garden, Midnight and Ivory all use them through `?view=today`, `?view=roster` and `?view=camera`. The front end is complete; the parts marked **Backend** are what the gallery/roster service must provide.

## Today mode + roster

- The schedule comes from the couple's own site content; nothing is re-entered.
  - Ivory: visible itinerary moments.
  - Midnight: welcome event plus the wedding-day schedule.
  - Garden: the day's timeline.
- Guests see three things:
  - now: the moment in progress
  - next: the coming moment, with a countdown
  - the rest of the day, with live times; a "running X min behind" note appears when anything is late.
- Before the wedding there is a preview slider. On the day, Today mode follows the real clock (Africa/Johannesburg).
- The roster is a private link for the MC or planner:
  - `−5`, `+5` and `+15` move that moment **and every later moment on the same day**.
  - Each moment can be marked "Done".
  - "Undo last change" and "Reset to planned times" are available.
- Data: `Roster = { version: 1, delays: { [slotId]: minutes }, done: { [slotId]: boolean }, updatedAt }`, where delays are -180…600. See `model.ts`.

**Backend (roster):**
- `GET /weddings/:id/roster` is public read for guests.
- `PUT /weddings/:id/roster` needs the private roster token. The client should send `updatedAt` for conflict detection.
- Push to guests with SSE or WebSocket.
- Implement the `RosterSync` interface (`load`, `save`, `subscribe`). The demo `localRosterSync` only syncs tabs in one browser.

## Disposable camera

- Limits:
  - **20 shots per guest**, for at most **60 guests** per wedding, which makes 1,200 photos.
  - A guest who has already started can always finish their roll.
  - A removed photo still uses up its shot.
- Photos appear in the gallery straight away. In the couple view they can remove and restore any photo and add their own (no limit).
- Each photo is resized to a 2,048 px long edge and encoded as WebP in the browser (`convert.ts`).
  - Browsers that cannot encode WebP send JPEG; **the backend converts it to WebP**.
  - Uploads over 6 MB are refused.
- Guests reach the camera from Today mode. It is included in Ivory and shown as a paid add-on in Garden and Midnight; the add-on price is still to be set.

**Backend (gallery service):** implement `GuestPhotoService` in `service.ts` and register it with `photoServiceFor(weddingId, factory)`.
1. Identify the guest from their private invitation token, never from a name chosen in the browser.
2. **Enforce 20 per guest and 60 guests server-side**, atomically, so two quick uploads cannot both take the last shot.
3. Validate image type and size. Convert JPEG to WebP and strip location metadata (EXIF GPS).
4. Store the photos and return URLs (signed URLs for a private gallery).
5. Soft-delete for remove and restore. Retention and deletion follow POPIA.
6. Show a short consent line before the first shot.

The demo keeps photos only in the open tab, and they are gone after a reload.
