import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CameraLimitError, MAX_CAMERA_GUESTS, SHOTS_PER_GUEST, photoServiceFor, type GuestPhoto } from './service';
import { toWebP } from './convert';
import './camera.css';

type Lang = 'en' | 'af';
type Guest = { id: string; name: string };
type Props = { weddingId: string; language: Lang; names: string; guests: Guest[]; addOn?: boolean };

function usePhotos(weddingId: string, includeRemoved: boolean) {
  const service = photoServiceFor(weddingId);
  const snapshot = useRef<GuestPhoto[]>(service.list({ includeRemoved }));
  return useSyncExternalStore(listener => service.subscribe(() => { snapshot.current = service.list({ includeRemoved }); listener(); }), () => snapshot.current);
}

/** Guest view (camera + live gallery) and couple view (remove, restore, add). */
export function GuestCameraView({ weddingId, language, names, guests, addOn = false }: Props) {
  const t = (en: string, af: string) => language === 'af' ? af : en;
  const [mode, setMode] = useState<'guest' | 'couple'>('guest');
  return <section className="cam-view" aria-labelledby="cam-title" data-no-translate>
    <header className="cam-head"><p className="cam-kicker">{t('DISPOSABLE CAMERA', 'WEGGOOIKAMERA')} · {names}{addOn ? ` · ${t('add-on', 'byvoeging')}` : ''}</p>
      <h1 id="cam-title">{t('One roll each. Make it count.', 'Een rolletjie elk. Maak dit tel.')}</h1>
      <p>{t(`Every guest gets ${SHOTS_PER_GUEST} shots, for up to ${MAX_CAMERA_GUESTS} guests. Photos appear in the gallery straight away; the couple can remove or add photos afterwards.`, `Elke gas kry ${SHOTS_PER_GUEST} foto’s, vir tot ${MAX_CAMERA_GUESTS} gaste. Foto’s verskyn dadelik in die galery; die paartjie kan foto’s later verwyder of byvoeg.`)}</p>
      <div className="cam-mode" role="group" aria-label={t('Preview as', 'Voorskou as')}>{(['guest', 'couple'] as const).map(m => <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>{m === 'guest' ? t('Guest view', 'Gasaansig') : t('Couple view', 'Paartjie-aansig')}</button>)}</div>
    </header>
    {mode === 'guest' ? <GuestCamera weddingId={weddingId} language={language} guests={guests}/> : <CoupleModeration weddingId={weddingId} language={language}/>}
    <p className="cam-note">{t('Demonstration: photos stay in this browser tab and disappear on reload. Live, each guest’s invitation link identifies them, and the gallery backend stores the photos and enforces the limits.', 'Demonstrasie: foto’s bly in hierdie oortjie en verdwyn ná herlaai. Regstreeks identifiseer elke gas se uitnodigingskakel hulle, en die galerybediener stoor die foto’s en dwing die perke af.')}</p>
  </section>;
}

function GuestCamera({ weddingId, language, guests }: { weddingId: string; language: Lang; guests: Guest[] }) {
  const t = (en: string, af: string) => language === 'af' ? af : en;
  const service = photoServiceFor(weddingId);
  const [guestId, setGuestId] = useState(guests[0]?.id ?? 'guest');
  const guest = guests.find(g => g.id === guestId) ?? { id: guestId, name: 'Guest' };
  const photos = usePhotos(weddingId, false);
  const allowance = service.allowance(guestId);
  const [status, setStatus] = useState<{ kind: 'idle' | 'busy' | 'ok' | 'error'; text: string }>({ kind: 'idle', text: '' });
  const input = useRef<HTMLInputElement>(null);
  void photos.length; // re-render when the gallery changes so the counter stays exact
  async function take(file: File | undefined) {
    if (!file) return;
    setStatus({ kind: 'busy', text: t('Developing…', 'Ontwikkel…') });
    try {
      const converted = await toWebP(file);
      await service.upload({ guestId: guest.id, guestName: guest.name, ...converted });
      const left = service.allowance(guest.id).remaining;
      setStatus({ kind: 'ok', text: left ? t(`In the gallery. ${left} shots left.`, `In die galery. Nog ${left} foto’s oor.`) : t('That was your last shot — thank you!', 'Dit was jou laaste foto — dankie!') });
    } catch (e) {
      const code = e instanceof CameraLimitError ? e.code : (e as Error).message;
      setStatus({ kind: 'error', text: code === 'roll-finished' ? t('Your roll is finished.', 'Jou rolletjie is klaar.') : code === 'guest-limit' ? t(`The camera is full: ${MAX_CAMERA_GUESTS} guests are already using it.`, `Die kamera is vol: ${MAX_CAMERA_GUESTS} gaste gebruik dit reeds.`) : code === 'too-large' ? t('That photo is too large.', 'Daardie foto is te groot.') : t('That file is not a photo we can use.', 'Daardie lêer is nie ’n foto wat ons kan gebruik nie.') });
    }
  }
  return <div className="cam-guest">
    <div className="cam-body">
      <label className="cam-who">{t('You are (demo)', 'Jy is (demo)')}<select value={guestId} onChange={e => { setGuestId(e.target.value); setStatus({ kind: 'idle', text: '' }); }}>{guests.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
      <div className="cam-counter" aria-live="polite"><strong>{allowance.remaining}</strong><span>{t('shots left', 'foto’s oor')}</span></div>
      <div className="cam-film" aria-hidden="true">{Array.from({ length: SHOTS_PER_GUEST }, (_, i) => <i key={i} className={i < allowance.used ? 'used' : ''}/>)}</div>
      <input ref={input} className="cam-input" type="file" accept="image/*" capture="environment" onChange={e => { take(e.target.files?.[0]); e.target.value = ''; }} aria-hidden="true" tabIndex={-1}/>
      <button type="button" className="cam-shutter" disabled={!allowance.remaining || allowance.guestLimitReached || status.kind === 'busy'} onClick={() => input.current?.click()}>
        <span aria-hidden="true"/>{allowance.remaining ? t('Take a photo', 'Neem ’n foto') : t('Roll finished', 'Rolletjie klaar')}
      </button>
      {status.text && <p className={`cam-status cam-${status.kind}`} role={status.kind === 'error' ? 'alert' : 'status'}>{status.text}</p>}
      <small>{t('On a phone this opens the camera. Photos are converted to WebP on your phone before they are sent.', 'Op ’n foon maak dit die kamera oop. Foto’s word op jou foon na WebP omgeskakel voordat dit gestuur word.')}</small>
    </div>
    <Gallery photos={photos} language={language}/>
  </div>;
}

function Gallery({ photos, language, moderate }: { photos: GuestPhoto[]; language: Lang; moderate?: (p: GuestPhoto) => React.ReactNode }) {
  const t = (en: string, af: string) => language === 'af' ? af : en;
  if (!photos.length) return <p className="cam-empty">{t('No photos yet. The first shot appears here straight away.', 'Nog geen foto’s nie. Die eerste foto verskyn dadelik hier.')}</p>;
  return <ul className="cam-gallery" aria-label={t('Guest photos', 'Gasfoto’s')}>{photos.map(p => <li key={p.id} className={p.removed ? 'is-removed' : ''}>
    <img src={p.src} alt={`${t('Photo by', 'Foto deur')} ${p.guestName}`} loading="lazy" width={p.width} height={p.height}/>
    <span>{p.byCouple ? t('Added by the couple', 'Deur die paartjie bygevoeg') : p.guestName} · {p.format.toUpperCase()} · {Math.round(p.bytes / 1024)} KB</span>
    {moderate?.(p)}
  </li>)}</ul>;
}

function CoupleModeration({ weddingId, language }: { weddingId: string; language: Lang }) {
  const t = (en: string, af: string) => language === 'af' ? af : en;
  const service = photoServiceFor(weddingId);
  const photos = usePhotos(weddingId, true);
  const [note, setNote] = useState('');
  const visible = photos.filter(p => !p.removed).length;
  const guestsUsing = new Set(photos.filter(p => !p.byCouple).map(p => p.guestId)).size;
  useEffect(() => { setNote(''); }, [photos.length]);
  return <div className="cam-couple">
    <div className="cam-stats"><p><strong>{visible}</strong> {t('in the gallery', 'in die galery')}</p><p><strong>{guestsUsing}</strong>/{MAX_CAMERA_GUESTS} {t('guests have used the camera', 'gaste het die kamera gebruik')}</p>
      <label className="cam-add">{t('Add your own photos', 'Voeg julle eie foto’s by')}<input type="file" accept="image/*" multiple onChange={async e => { const files = [...(e.target.files ?? [])]; e.target.value = ''; let ok = 0; for (const f of files) { try { await service.addCouplePhoto(await toWebP(f)); ok++; } catch { /* skip unreadable files */ } } setNote(t(`${ok} photo(s) added.`, `${ok} foto(’s) bygevoeg.`)); }}/></label>
    </div>
    {note && <p role="status" className="cam-status cam-ok">{note}</p>}
    <Gallery photos={photos} language={language} moderate={p => <button type="button" onClick={() => service.setRemoved(p.id, !p.removed)} aria-label={`${p.removed ? t('Restore', 'Herstel') : t('Remove', 'Verwyder')}: ${p.guestName}`}>{p.removed ? t('Restore', 'Herstel') : t('Remove', 'Verwyder')}</button>}/>
  </div>;
}
