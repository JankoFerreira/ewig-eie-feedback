import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Language, Media } from './content';

export type GalleryLayout = 'editorial' | 'grid';
// renderItem lets a host (e.g. the on-page editor) replace the lightbox button around each image.
type Props = { media: Media[]; language: Language; layout?: GalleryLayout; label?: string; renderItem?: (media: Media, image: ReactNode) => ReactNode };

// Modular gallery block: receives media with stable IDs and never fetches.
// A future media API can supply the same shape ({ id, src, alt, caption, focal }).
export function EditorialGallery({ media, language, layout = 'editorial', label, renderItem }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const af = language === 'af';
  useEffect(() => {
    if (index !== null && !dialog.current?.open) dialog.current?.showModal();
    if (index === null && dialog.current?.open) { dialog.current.close(); opener.current?.focus(); }
  }, [index]);
  const step = (by: number) => setIndex(i => i === null ? null : (i + by + media.length) % media.length);
  const current = index === null ? null : media[index];
  return <>
    <ul className={`iv-gallery iv-gallery-${layout}`} aria-label={label}>
      {media.map((m, i) => <li key={m.id} className={`iv-gallery-item iv-gallery-${m.id}`}>
        {renderItem ? renderItem(m, <img src={m.src} alt={m.alt[language]} style={{ objectPosition: m.focal }} loading="lazy" decoding="async"/>) : <button type="button" onClick={e => { opener.current = e.currentTarget; setIndex(i); }} aria-label={`${af ? 'Vergroot' : 'View larger'}: ${m.caption[language] || m.alt[language]}`}>
          <img src={m.src} alt={m.alt[language]} style={{ objectPosition: m.focal }} loading="lazy" decoding="async"/>
        </button>}
        <p><span>{String(i + 1).padStart(2, '0')}</span>{m.caption[language]}</p>
      </li>)}
    </ul>
    <dialog ref={dialog} className="iv-lightbox" aria-label={af ? 'Fotogalery' : 'Photo gallery'} onClose={() => setIndex(null)} onCancel={() => setIndex(null)} onKeyDown={e => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); }}>
      {current && <figure><img src={current.src} alt={current.alt[language]}/><figcaption aria-live="polite">{(index ?? 0) + 1} / {media.length} · {current.caption[language]}</figcaption></figure>}
      <div><button type="button" onClick={() => step(-1)}>← {af ? 'Vorige' : 'Previous'}</button><button type="button" autoFocus onClick={() => setIndex(null)}>{af ? 'Sluit' : 'Close'}</button><button type="button" onClick={() => step(1)}>{af ? 'Volgende' : 'Next'} →</button></div>
    </dialog>
  </>;
}
