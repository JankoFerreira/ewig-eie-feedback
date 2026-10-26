import { Flourish } from './Flourish';
import { useEffect, useRef, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowUpRight, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { images } from '../config';

type Palette = 'sage' | 'rose' | 'midnight';

const palettes: { id: Palette; en: string; af: string; color: string }[] = [
  { id: 'sage', en: 'Sage', af: 'Salie', color: '#758c74' },
  { id: 'rose', en: 'Rose', af: 'Roos', color: '#b88983' },
  { id: 'midnight', en: 'Midnight', af: 'Middernag', color: '#526278' },
];

type StoryPortalProps = {
  open: boolean;
  onClose: () => void;
  firstName: string;
  onFirstNameChange: (value: string) => void;
  secondName: string;
  onSecondNameChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  palette: Palette;
  onPaletteChange: (value: Palette) => void;
  invitationUrl: string;
  af: boolean;
};

export function StoryPortal({ open, onClose, firstName, onFirstNameChange, secondName, onSecondNameChange, date, onDateChange, palette, onPaletteChange, invitationUrl, af }: StoryPortalProps) {
  const reduced = useReducedMotion();
  const dialog = useRef<HTMLDivElement>(null);
  const t = (en: string, afrikaans: string) => af ? afrikaans : en;
  const displayFirst = firstName.trim() || t('Your name', 'Jou naam');
  const displaySecond = secondName.trim() || t('Their name', 'Hul naam');
  const parsedDate = new Date(`${date}T12:00:00`);
  const displayDate = Number.isNaN(parsedDate.getTime()) ? '' : new Intl.DateTimeFormat(af ? 'af-ZA' : 'en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }).format(parsedDate);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const page = document.getElementById('root');
    const previousInert = page?.inert;
    document.body.style.overflow = 'hidden';
    if (page) page.inert = true;
    dialog.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      if (page) page.inert = previousInert ?? false;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return createPortal(<AnimatePresence>{open && <motion.div
    className="story-portal"
    initial={reduced ? { opacity: 0 } : { opacity: 0, clipPath: 'circle(0% at 50% 55%)' }}
    animate={{ opacity: 1, clipPath: 'circle(150% at 50% 55%)' }}
    exit={reduced ? { opacity: 0 } : { opacity: 0, clipPath: 'circle(0% at 50% 55%)' }}
    transition={{ duration: reduced ? .2 : .85, ease: [.2, .8, .2, 1] }}
    role="dialog"
    aria-modal="true"
    aria-label={t('Make your wedding preview yours', 'Maak julle trouvoorskou julle eie')}
    tabIndex={-1}
    ref={dialog}
  >
    <button type="button" className="story-portal-close" onClick={onClose} aria-label={t('Close preview', 'Maak voorskou toe')}><X size={20}/></button>
    <div className="story-portal-visual" style={{ backgroundImage: `url('${images.couple}')`, '--portal-accent': palettes.find(item => item.id === palette)?.color } as CSSProperties}>
      <div className="story-portal-photo-shade"/>
      <div className="story-portal-visual-copy">
        <span>{t('A GLIMPSE INTO YOUR DAY', '’N VOORSMAAK VAN JULLE DAG')}</span>
        <motion.strong key={`${displayFirst}-${displaySecond}`} initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}>{displayFirst} <i>&</i> {displaySecond}</motion.strong>
        <small>{displayDate} <b><Flourish/></b> {t('FOREVER YOURS', 'EWIG JULLE EIE')}</small>
      </div>
      <span className="story-portal-photo-caption">EWIG & EIE / {t('MADE FOR YOUR STORY', 'GEMAAK VIR JULLE STORIE')}</span>
    </div>
    <div className="story-portal-controls">
      <span className="story-portal-index">01 / 01 &nbsp; <Flourish/> &nbsp; {t('LIVE PREVIEW', 'REGSTREEKSE VOORSKOU')}</span>
      <h2>{t('The magic is', 'Die magie is')}<br/><em>{t('in your story.', 'in julle storie.')}</em></h2>
      <p>{t('Add your names, choose a feeling, and watch your invitation become yours.', 'Voeg julle name by, kies ’n gevoel en sien hoe die uitnodiging julle eie word.')}</p>
      <div className="story-portal-fields">
        <label>{t('Your name', 'Jou naam')}<input type="text" maxLength={24} value={firstName} onChange={event => onFirstNameChange(event.target.value)} autoComplete="given-name"/></label>
        <label>{t('Partner’s name', 'Maat se naam')}<input type="text" maxLength={24} value={secondName} onChange={event => onSecondNameChange(event.target.value)}/></label>
        <label>{t('Wedding date', 'Troudatum')}<input type="date" value={date} onChange={event => onDateChange(event.target.value)}/></label>
      </div>
      <fieldset className="story-portal-palettes"><legend>{t('Choose a feeling', 'Kies ’n gevoel')}</legend><div>{palettes.map(item => <button type="button" key={item.id} aria-label={af ? item.af : item.en} aria-pressed={palette === item.id} onClick={() => onPaletteChange(item.id)} style={{ '--swatch': item.color } as CSSProperties}><i/>{af ? item.af : item.en}</button>)}</div></fieldset>
      <Link className="story-portal-open" to={invitationUrl} onClick={onClose}>{t('Open your invitation', 'Maak julle uitnodiging oop')} <ArrowUpRight size={18}/></Link>
      <small className="story-portal-privacy">{t('Just a design preview. Your details stay on this page.', 'Slegs ’n ontwerpvoorskou. Julle besonderhede bly op hierdie blad.')}</small>
    </div>
  </motion.div>}</AnimatePresence>, document.body);
}
