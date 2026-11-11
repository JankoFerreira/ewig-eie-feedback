import { useEffect, useRef, useState } from 'react';
import type { Language, Media } from './content';
// Media is passed in, never fetched here. A future API can supply the same stable IDs.
export function CinematicGallery({ media, language }: { media: Media[]; language: Language }) {
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const af = language === 'af';
  useEffect(() => { if (selected !== null && !dialog.current?.open) dialog.current?.showModal(); if (selected === null) { dialog.current?.close(); trigger.current?.focus(); } }, [selected]);
  const step = (by: number) => setSelected(i => i === null ? null : (i + by + media.length) % media.length);
  const image = selected === null ? null : media[selected];
  return <><div className="mid-gallery">{media.map((item, index) => <button key={item.id} onClick={e => { trigger.current = e.currentTarget; setSelected(index); }} aria-label={`${af ? 'Vergroot' : 'Enlarge'}: ${item.alt[language]}`}><img src={item.src} alt={item.alt[language]} style={{ objectPosition: item.focal }} loading="lazy"/><span><i>{String(index + 1).padStart(2, '0')}</i>{item.caption[language]} ↗</span></button>)}</div>
    <dialog ref={dialog} className="mid-lightbox" aria-label={af ? 'Fotogalery' : 'Photo gallery'} onCancel={() => setSelected(null)} onClose={() => setSelected(null)} onKeyDown={e => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); }}><button autoFocus onClick={() => setSelected(null)}>{af ? 'Sluit' : 'Close'} ×</button>{image && <figure><img src={image.src} alt={image.alt[language]}/><figcaption aria-live="polite">{(selected ?? 0) + 1} / {media.length} · {image.caption[language]}</figcaption></figure>}<div><button onClick={() => step(-1)}>← {af ? 'Vorige' : 'Previous'}</button><button onClick={() => step(1)}>{af ? 'Volgende' : 'Next'} →</button></div></dialog>
  </>;
}
