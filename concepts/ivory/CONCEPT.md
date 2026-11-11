# The Ivory Collection

Ewig & Eie flagship. Fictional demonstration concept: Amélie, James, Maison Aveline and every guest are invented. Not a client, not a commission, not a real wedding.

## Positioning

| | Garden | Midnight | **Ivory** |
|---|---|---|---|
| Feeling | Botanical warmth | Cinematic evening | Editorial, paper-led, near-still |
| Price | R2,000 | R5,600 | **R8,000** (planned partner price R6,000 — inactive) |
| Events | One day | Welcome + wedding | Three-day weekend |
| Guests | RSVP | Two-event replies, meals | Households, per-event access, catering, seating, planner exports |
| Revisions | — | Two consolidated rounds | Consultation, assisted content setup, three consolidated rounds |

Not included at any tier: photography, physical printing, unlimited bespoke development.

## Couple bible

**Amélie Botha**, paper conservator at a Cape Town archive. Precise, calm, quietly funny; repairs things other people would throw away. Afrikaans at home, English at work.

**James van der Merwe**, architect who restores old Winelands farm buildings. Early for everything, sketches on napkins, keeps every receipt.

2023: James brings a water-damaged 1890s site plan of a Winelands homestead to the archive. Amélie quotes six weeks. He visits every Thursday "to check on its progress". The plan is finished in five; the Thursdays continue. 2027: in a reading room he restored, he gives her a hand-bound book with one blank page and a question on the last line.

## Wedding facts

Friday 9 – Sunday 11 March 2029 (10 March is a Saturday). Africa/Johannesburg. RSVP 31 January 2029.

- Welcome evening — Fri 18:30, Olive Terrace (selected households only)
- The wedding — Sat 15:30 ceremony in the old chapel, dinner in the Long Barn, carriages 23:30
- Farewell brunch — Sun 10:30, Orchard Room

Maison Aveline is an explicitly fictional farmhouse estate in the Cape Winelands: whitewashed chapel, long barn, olive grove, orchard room. No address, coordinates, bookings, phone numbers or contact links exist. Adults only.

## Palette and type

| Token | Default | Role |
|---|---|---|
| paper | #F6F1E7 | Page background |
| stone | #E4DCCD | Panels, envelope, alternate sections |
| ink | #383D2C | All text and buttons (10.0:1 on paper, 8.2:1 on stone) |
| accent | #B8975F | Champagne hairlines, monogram rings — **never text** |

Cormorant Garamond for display; Manrope for body and labels (both already loaded in `index.html`). Muted text is 78 % ink mixed into the background and still passes AA; the editor reports contrast live when colours change.

## Motion

Exceptionally restrained: a single opacity settle on the cover photograph, a slow card reveal after the shared Eternal Ribbon opening, and nothing on scroll. `prefers-reduced-motion` removes all transitions and skips the opening entirely.

## Photographic identity

See `IMAGE-PROMPTS.json` for the exact generation brief. The site currently ships six **placeholder plates** (soft-focus art-directed abstractions, ~20–30 KB each) in `src/assets/ivory/`. They are labelled as placeholders in the persistent fiction strip, in alt text and in the editor. Replace them by generating the set below and dropping the files in with the same names, or through the editor at any time.

### Identity lock

- **Amélie**: late twenties, light olive skin, grey-green eyes, straight dark-blonde hair worn low in a soft chignon with loose strands, fine brows, no heavy makeup. Wedding look: ivory silk crepe column dress, bateau neckline, long sleeves, no veil at the hero; single pearl drop earrings.
- **James**: early thirties, fair skin with light stubble, brown eyes, short dark-brown hair with a side part, rimless round glasses. Wedding look: soft stone (greige) wool-linen suit, ivory shirt, no tie, small olive-sprig boutonnière.
- Generate the portrait (shot 2) first and use it as the reference for every later couple image. Compare faces, hair, glasses and wardrobe side by side before accepting.

### Shot list

| ID | Placement | Ratio | Brief |
|---|---|---|---|
| hero | Cover (desktop left, mobile top crop) | 3:2 | Couple walking slowly past the limewashed chapel wall in morning light; couple right of centre, calm wall left; long soft shadows |
| portrait | Story spread, gallery | 4:5 | Close waist-up portrait in the reading room by a sheer-curtained window; both faces clear; quiet half-smiles |
| venue | Venue section | 3:2 | Empty estate: whitewashed gabled farmhouse and chapel among vines and olive trees, mountains in haze; always captioned fictional |
| ceremony | Gallery | 4:5 | Gravel aisle between old olive trees leading to the small chapel; no guests |
| detail | RSVP, gallery, collections listing | 4:5 | Overhead flat lay: ivory cotton stationery suite, champagne silk ribbon, pale wax seal, linen, olive sprig; **no legible text** |
| table | Gallery | 3:2 | Long barn table at dusk: linen, beeswax candles, olive branches, clear glassware; no people |

Natural light, neutral skin tones, lifted shadows, warm ivory grade, fine grain. Never burn text into photographs. Export WebP at 1600 px (landscape) / 1100 px (portrait), quality ~72, target ≤ 180 KB.
