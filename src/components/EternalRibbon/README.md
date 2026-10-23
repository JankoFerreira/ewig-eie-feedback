# Eternal Ribbon

`EternalRibbonIntro` is a reusable React + TypeScript invitation opening. It uses GSAP for the 4–5 second timeline, CSS for paper depth and 3D folding, a photographed satin bow asset, and inline SVG for subtle botanical details.

## Add it to another React wedding site

1. Install GSAP: `npm install gsap`.
2. Copy this entire `EternalRibbon` folder into that project's `src/components/` folder.
3. Render the component above your wedding page. Hide the page with `inert` while the intro is visible and restore normal page interaction in `onComplete`.

```tsx
import { useState } from 'react';
import { EternalRibbonIntro } from './components/EternalRibbon';

function WeddingSite() {
  const [open, setOpen] = useState(false);
  return <>
    <main inert={!open}>{/* Wedding website */}</main>
    {!open && <EternalRibbonIntro
      coupleNames="Janko & Lise-Marie"
      initials="J & L"
      weddingDate="24 Maart 2027"
      language="af"
      theme={{ envelopeColor: '#F7F3EA', ribbonColor: '#89917A', sealColor: '#C6A66B', textColor: '#414735' }}
      onComplete={() => setOpen(true)}
    />}
  </>;
}
```

Optional props include `backgroundImage` (inside `theme`), `backgroundColor`, `fontFamily`, `showBotanicals`, `animationSpeed`, `invitationWording`, `skipForReturningGuests`, and `storageKey`. Returning-guest skip uses session storage by default; pass `skipForReturningGuests={false}` for a replay. Keep the component's CSS alongside its TSX files.

The photographed bow is recoloured to match the selected ribbon colour. Keep `silk-bow.png` and `wax-seal.png` with the component when copying it to another project. The seal's initials remain editable text over the wax image. The demo at `/invitation-preview` shows the complete transition into a sample wedding page and a replay control.
