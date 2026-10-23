# Ewig & Eie — React + TypeScript website

An original, multi-page wedding design studio website built with React 19, TypeScript, Vite, CSS, Motion and Lucide icons.

The header includes an English/Afrikaans switch. Afrikaans copy lives in `src/translations.ts`; the selected language is saved in the browser. The shorter homepage leads from an interactive website concept through process, studio, offerings and design previews. Section headings, images and cards use varied motion with reduced-motion support.

## Start locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

The feedback preview is configured for GitHub Pages at `https://jankoferreira.github.io/ewig-eie-feedback/`. Pushes to `main` build and deploy automatically through `.github/workflows/deploy.yml`. GitHub Pages uses hash-based links, such as `/#/invitation-preview`, so each page can be opened directly. Local and Netlify builds retain normal URLs; `netlify.toml` includes the SPA routing fallback.

## Routes

- `/` — Studio home
- `/websites` — Wedding websites + interactive RSVP and dashboard previews
- `/stationery` — Stationery design offerings
- `/collections` — Concept collections
- `/pricing` — Four-step interactive quote builder with a live draft total
- `/invitation-preview` — Personalized sample wedding website with the reusable Eternal Ribbon opening
- `/contact` — Enquiry form (opens user's email client)
- `/expo` — Focused wedding-expo QR landing page

## Important before launching

1. Edit `src/config.ts`: set the correct email, WhatsApp number (international digits only), social URLs, prices and policies.
2. **Ewig & Eie is a draft Afrikaans rebrand.** Confirm the name through formal trademark and domain checks before public launch. No domain or new email account is included in this project.
3. Replace stock images with properly licensed brand/client photography. The current image URLs are illustrative remote Unsplash images and require an internet connection.
   The home hero uses the wedding photo configured as `images.hero` in `src/config.ts`; confirm its license and replace it with original brand photography before launch.
4. The header uses the vector concept mark in `public/ewig-eie-mark.svg` with a typographic wordmark; the footer uses the same new name. Older EverAfter logo files remain in `public/` as an archive and are not displayed.
5. The RSVP form and dashboard are **interactive previews only**. They do not save real guests, send emails or authenticate users. The dashboard CSV export contains only fictional sample records.
6. The contact form opens an email client and **does not submit to a backend**. Integrate a transactional email provider or a secure backend before production use.
7. Add real terms, privacy policy, domain/hosting renewal conditions, and POPIA-compliant data practices before processing guest information.
8. Review pricing and verify that all advertised features can be delivered before accepting paid bookings.
9. The print/photography packages in the quote builder are draft concepts. Confirm print specifications, supplier agreements, photographer availability, coverage and delivery terms before selling them.
10. The homepage work gallery shows clearly labelled design concepts, not completed client projects. Replace them with real project images and links when available.
11. The quote builder uses R2,000 for the website starting price and clearly labelled **draft planning prices** for print, photography and add-ons. Review `draftQuotePrices` in `src/config.ts` before launch. Its PDF, text download, and copy actions run in the browser; the enquiry link prefills the contact form. No automatic quote email or server storage is included.
12. The homepage personalization preview changes names, date and palette in the browser only. The Eternal Ribbon page is a design demonstration. See `src/components/EternalRibbon/README.md` for reuse in a real couple's React site.

## Technical direction for future RSVP platform

Keep the marketing website independent. Build the RSVP backend later as a separate service (FastAPI + PostgreSQL) with per-wedding data isolation, access controls, email delivery and secure dashboard authentication. Extract reusable UI components into a shared TypeScript package when proven.

## Notes

The GitHub Pages version is a public design preview for feedback. Its package prices, gallery projects, invitation flow, and RSVP experience remain draft demonstrations until real content and backend services are added.
