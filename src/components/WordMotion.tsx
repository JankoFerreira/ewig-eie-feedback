import { Children, cloneElement, isValidElement, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '../i18n';
import { translate } from '../translations';

export type HeadingEffect = 'scatter' | 'wave' | 'bloom' | 'drift';

export function RotatingWord({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || paused) return;
    const timer = window.setInterval(() => setIndex(previous => (previous + 1) % words.length), 3000);
    return () => window.clearInterval(timer);
  }, [reduced, paused, words.length]);
  return <span className="rotating-word" role="text" aria-label={words[index]} onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}><AnimatePresence mode="wait" initial={false}><motion.em key={index} aria-hidden="true" initial={reduced ? false : { opacity: 0, y: 22, rotate: -3 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={reduced ? undefined : { opacity: 0, y: -20, rotate: 3 }} transition={{ duration: .42, ease: 'easeOut' }}><KineticWords text={words[index]} className="hero-kinetic rotating-kinetic"/></motion.em></AnimatePresence></span>;
}

function MotionWord({ word, index, effect, reduced }: { word: string; index: number; effect: HeadingEffect; reduced: boolean | null }) {
  const [active, setActive] = useState(false);
  const entrance = effect === 'bloom' ? { opacity: 0, scale: .82, y: 13 } : effect === 'drift' ? { opacity: 0, x: 24, rotate: 3 } : effect === 'wave' ? { opacity: 0, y: index % 2 ? -22 : 22 } : { opacity: 0, y: 20, rotate: index % 2 ? 4 : -4 };
  return <span className={`kinetic-word-shell effect-${effect} ${active ? 'is-burst' : ''}`} onPointerEnter={() => setActive(true)} onPointerLeave={() => setActive(false)}><motion.span className="kinetic-word" aria-hidden="true" initial={reduced ? false : entrance} whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }} viewport={{ once: true, amount: .8 }} transition={{ duration: .62, delay: Math.min(index * .065, .4), ease: [.2,.8,.2,1] }}>{Array.from(word).map((letter, letterIndex) => <span className="kinetic-letter" key={`${letter}-${letterIndex}`} style={{ '--letter-index': letterIndex } as CSSProperties}>{letter}</span>)}</motion.span><span className="word-sparks" aria-hidden="true">{Array.from({ length: 7 }, (_, i) => <i key={i}/>)}</span></span>;
}

export function KineticWords({ text, className = '', effect = 'scatter' }: { text: string; className?: string; effect?: HeadingEffect }) {
  const reduced = useReducedMotion();
  return <span className={`kinetic-words ${className}`} role="text" aria-label={text}>{text.split(/(\s+)/).map((piece, index) => /^\s+$/.test(piece) ? piece : <MotionWord word={piece} index={index} effect={effect} reduced={reduced} key={`${piece}-${index}`}/>)}</span>;
}

function animatedChildren(children: ReactNode, effect: HeadingEffect, language: 'en' | 'af'): ReactNode {
  return Children.map(children, (child, index) => {
    if (typeof child === 'string' || typeof child === 'number') {
      const original = String(child);
      const trimmed = original.trim();
      if (!trimmed) return original;
      const localized = translate(trimmed, language);
      const value = original.replace(trimmed, localized);
      const leading = value.match(/^\s*/)?.[0] || '';
      const trailing = value.match(/\s*$/)?.[0] || '';
      return <>{leading}<KineticWords text={value.trim()} effect={effect}/>{trailing}</>;
    }
    if (isValidElement<{ children?: ReactNode }>(child) && child.type !== KineticWords && child.props.children !== undefined) {
      return cloneElement(child, { ...child.props, children: animatedChildren(child.props.children, effect, language), key: child.key ?? index });
    }
    return child;
  });
}

export function AnimatedHeading({ as: Tag = 'h2', effect = 'scatter', className = '', children }: { as?: 'h1' | 'h2'; effect?: HeadingEffect; className?: string; children: ReactNode }) {
  const { language } = useLanguage();
  return <Tag className={`animated-heading ${className}`} data-heading-effect={effect}>{animatedChildren(children, effect, language)}</Tag>;
}
