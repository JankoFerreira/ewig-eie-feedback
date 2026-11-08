# Garden Collection — handoff to the main chat

## Status and scope

The user approved Clara September, Ruben de Villiers and the Garden Collection direction on 26 October 2026. The bilingual content pack and five generated PNG assets are ready for integration. This is a fictional demonstration concept, never a real client testimonial, completed commission, or record of an actual wedding. The images illustrate the future wedding in the story.

All work from this chat is inside concepts/garden/. No application, shared components, routing, dependencies, invitation logic, or dashboard implementation was changed. Nothing was committed, pushed or deployed. Integration belongs to the main chat.

## Files

| File | Contents |
|---|---|
| CONCEPT.md | Couple bible, milestones, wedding facts, palette, typography, identity lock and photography plan |
| CONTENT.en.md | English website, invitation, personal note, FAQ and RSVP copy |
| CONTENT.af.md | Matching natural Afrikaans copy |
| assets.json | Portable palette, font suggestions, wedding metadata, filenames, dimensions, placements and bilingual alt text |
| guests.demo.json | Eight invented adult guests in four households, attendance and dietary examples |
| IMAGE-PROMPTS.json | Exact final prompts, generation tool and reference dependencies |
| images/ | Five original PNG assets |

## Canonical facts

Display names: Clara & Ruben. Full names: Clara September and Ruben de Villiers. Home: Cape Town. Wedding: Saturday, 16 October 2027 at fictional Die Varinghuis, Elgin Valley. RSVP: 16 September 2027. Arrival 15:00; ceremony 15:30; end 23:00; timezone Africa/Johannesburg. No street address or map URL exists.

Keep the EN and AF practical details synchronised. English date: 16 October 2027. Afrikaans date: 16 Oktober 2027. Do not translate proper names or the collection brand. The markdown section headings serve as content slots, not text to paste indiscriminately into the website. Internal document introductions are handoff context; use the short persistent demo label on the public concept and the fictional-venue caption beside the venue.

## Suggested placement

| Image | Placement | Notes |
|---|---|---|
| garden-hero.png | Desktop welcome | 1536 × 1024; couple to right; use adjacent or opaque-backed text |
| garden-couple-reference.png | Story / mobile welcome / invitation | 1122 × 1402; canonical appearance reference |
| garden-candid-table.png | Gallery / personal note | 1536 × 1024; relaxed moment at the table |
| garden-venue.png | Venue | 1536 × 1024; always caption as fictional |
| garden-botanical-detail.png | RSVP / invitation supporting detail | 1122 × 1402; no text baked into image |

Paths above are within images/. Focal positions and alt text are in assets.json. Inspect the resulting crop in the consuming layout; object positions are starting suggestions. Keep both faces visible. The images are PNG masters, approximately 2.4–3.5 MB each: create appropriately sized web derivatives in the main project's established asset workflow before production delivery. Retain these originals. No responsive derivatives or font binaries are included.

## Palette and typography

Ivory #F7F3EA; sage #A8B5A0; olive #344638; flax #E7DFD0; rose #C69C91. Olive is the principal text/button colour; ivory is the principal background. Sage and rose are accents, not small text on ivory. Cormorant Garamond for headings, Source Sans 3 for body; map to existing font loading and controls. No dependency changes are required by this pack.

## Content mapping

Welcome → names, date, location, headline, short introduction, primary RSVP action.
Story → four short narrative paragraphs plus optional five-point timeline.
The day → seven time-labelled schedule items.
Venue → description, fictional label, access/weather notes; map link remains absent.
Dress, travel, gifts → separate compact cards or sections.
Questions → nine FAQ items, suitable for the existing accordion.
RSVP → field labels, accepted/declined choices, helper, validation, saving/error and confirmation copy. Render only messages matching actual system behaviour. Invitation-based identity resolution, response saving and editing are responsibilities of the shared system.
Invitation → names, date, arrival/ceremony, venue, dress, deadline and invitation button.
Personal note → optional invitation reveal or final page section.

Demo-specific travel wording is intentionally explicit. Replace it with verified couple-supplied information when adapting this template for a real wedding. Do not create hotel listings, route links, bank details, messaging actions, or booking claims from fictional details.

## Dashboard seed behaviour

Use guests.demo.json as fixture data, adapting its fields to the shared dashboard schema. It is not a proposed database schema. All names are invented; all email values use the non-deliverable example.invalid domain. Phone fields are null. Do not send invitations or notifications to these records.

Expected totals: 8 invited, 5 accepted, 1 declined, 2 pending. Among accepted guests: 3 have dietary requirements, 1 has an allergy note. Dietary/allergy categories can overlap and must not be added to estimate guest counts. A null field means unanswered; [] means explicitly none. Only accepted guests enter the confirmed catering total. Mixed household responses are intentional. The fixture's 20 August 2027 snapshot is a simulated future dashboard state, not today's date. These eight guests are a subset, not the narrative wedding total of approximately 64.

## Verification and limits

The wedding date was checked to fall on a Saturday. Both languages carry matching times and deadlines. JSON files parse, fixture totals have been checked, and all five PNGs were opened by the image pipeline and their dimensions verified. Couple images were visually reviewed against the reference for face, hair, skin tone, moustache and wardrobe consistency; small natural pose/expression variations remain. The photographs are generated concepts, not exact architectural plans. Actual page layout, responsive crops, font loading, contrast in composed UI, and RSVP behaviour must be checked during integration.
