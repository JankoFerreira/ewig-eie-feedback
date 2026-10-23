import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, ArrowUp, Menu, X } from 'lucide-react';
import { business } from '../config';
import { useLanguage } from '../i18n';

function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 .8A15.1 15.1 0 0 0 2.9 23.5L.8 31.2l7.9-2.1A15.2 15.2 0 1 0 16 .8Zm0 27.6a12.4 12.4 0 0 1-6.3-1.7l-.5-.3-4.6 1.2 1.2-4.4-.3-.5A12.4 12.4 0 1 1 16 28.4Zm6.8-9.3c-.4-.2-2.2-1.1-2.6-1.2-.3-.1-.6-.2-.9.2-.3.4-1 1.2-1.2 1.4-.2.2-.4.3-.8.1-.4-.2-1.6-.6-3-1.9-1.1-1-1.9-2.3-2.1-2.7-.2-.4 0-.6.2-.8l.6-.7.4-.7c.1-.2 0-.5 0-.7l-1.2-2.9c-.3-.7-.6-.6-.9-.6h-.8c-.3 0-.7.1-1.1.5-.4.4-1.4 1.4-1.4 3.3 0 2 1.5 3.9 1.7 4.2.2.3 2.9 4.4 7.1 6.1 1 .4 1.8.6 2.4.8 1 .3 1.9.2 2.6.1.8-.1 2.2-.9 2.5-1.8.3-.9.3-1.7.2-1.8-.1-.2-.3-.3-.7-.5Z"/></svg>;
}

export function Brand() {
  const location = useLocation();
  return <Link className="brand brand-artwork" to="/" aria-label="Ewig & Eie — back to home" onClick={() => { if (location.pathname === '/') window.scrollTo({ top: 0, behavior: 'smooth' }); }}><img className="brand-mark" src={`${import.meta.env.BASE_URL}ewig-eie-mark.svg`} alt="" width="42" height="42"/><span className="brand-wordmark">Ewig <i>&</i> Eie<small>WEDDING STORIES & DESIGN</small></span></Link>;
}

export function Header() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 30);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return <header className={`site-header ${scrolled || location.pathname !== '/' || open ? 'header-solid' : ''}`}><div className="header-inner">
    <nav className="header-nav header-nav-left" aria-label="Primary navigation"><Link to="/#experience">Experience</Link><Link to="/#process">Process</Link></nav>
    <Brand />
    <nav className="header-nav header-nav-right" aria-label="More navigation"><NavLink to="/pricing">Pricing</NavLink><Link to="/#work">Our work</Link><button className="language-switch language-switch-desktop" type="button" onClick={() => setLanguage(language === 'en' ? 'af' : 'en')} aria-label={language === 'en' ? 'Switch to Afrikaans' : 'Switch to English'} aria-pressed={language === 'af'}><span className={language === 'en' ? 'active' : ''}>EN</span><span className={language === 'af' ? 'active' : ''}>AF</span></button><Link className="header-cta" to="/pricing#instant-estimate">{language === 'af' ? 'Bou ’n kwotasie' : 'Build a quote'} <ArrowUpRight size={15} /></Link></nav>
    <button className="language-switch language-switch-mobile" type="button" onClick={() => setLanguage(language === 'en' ? 'af' : 'en')} aria-label={language === 'en' ? 'Switch to Afrikaans' : 'Switch to English'} aria-pressed={language === 'af'}><span className={language === 'en' ? 'active' : ''}>EN</span><span className={language === 'af' ? 'active' : ''}>AF</span></button>
    <button className="menu-toggle" type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
  </div><nav id="mobile-navigation" className={`mobile-navigation ${open ? 'is-open' : ''}`} aria-label="Mobile navigation"><Link to="/#experience" onClick={() => setOpen(false)}>Experience</Link><Link to="/#process" onClick={() => setOpen(false)}>Process</Link><Link to="/#studio" onClick={() => setOpen(false)}>Studio</Link><Link to="/pricing" onClick={() => setOpen(false)}>Pricing</Link><Link to="/#work" onClick={() => setOpen(false)}>Our work</Link><Link to="/contact" onClick={() => setOpen(false)}>Get a quote</Link></nav></header>;
}

export function Footer() {
  return <footer className="footer footer-rebuild"><div className="footer-rebuild-inner"><div className="footer-grid"><div className="footer-identity"><p className="footer-kicker">EWIG & EIE</p><h2>Ewig & Eie</h2><p className="footer-tagline">Your story, <em>beautifully told.</em></p><p className="footer-description">Wedding websites and thoughtful details, made in South Africa by NexWeb Studios.</p></div><div className="footer-column"><h3>Explore</h3><Link to="/#experience">Experience</Link><Link to="/#process">Process</Link><Link to="/#studio">Studio</Link><Link to="/pricing">Pricing</Link><Link to="/#work">Design previews</Link></div><div className="footer-column"><h3>Begin</h3><Link to="/contact">Tell us your story <ArrowUpRight size={15}/></Link>{business.instagram && <a href={business.instagram} target="_blank" rel="noreferrer">Instagram</a>}<p>One beautiful story starts with a hello.</p></div></div><button className="footer-backtop" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top"><ArrowUp size={19}/></button><div className="footer-ghost" aria-hidden="true">Ewig & Eie</div><div className="footer-meta"><span>© {new Date().getFullYear()} EWIG & EIE</span><span>WEDDING WEBSITES / CREATIVE DESIGN / SOUTH AFRICA</span><span>BY NEXWEB STUDIOS</span></div></div></footer>;
}

export function FloatingTools() {
  const [scrolled, setScrolled] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [chat, setChat] = useState(false);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 450); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll); }, []);
  useEffect(() => { const footer = document.querySelector('.footer-rebuild'); if (!footer) return; const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting)); observer.observe(footer); return () => observer.disconnect(); }, []);
  const whatsapp = business.whatsapp ? `https://wa.me/${business.whatsapp}?text=${encodeURIComponent("Hi Ewig & Eie! I'd love to enquire about a wedding website.")}` : '';
  return <div className="floating-tools">{scrolled && !footerVisible && <button className="float-button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp size={20} /></button>}<div className="whatsapp-wrap">{chat && <div className="chat-card" role="dialog" aria-label="Ewig & Eie chat preview"><div className="chat-card-head"><span className="chat-avatar"><WhatsAppIcon size={20} /></span><div><strong>Ewig & Eie</strong><small>Wedding websites & design</small></div><button className="chat-close" onClick={() => setChat(false)} aria-label="Close chat preview"><X size={17} /></button></div><div className="chat-card-body"><span className="chat-bubble">Hello and welcome! Tell us your wedding date and what you're dreaming of. We'd love to help. ✨</span><span className="chat-time">Share your details to begin</span></div><div className="chat-card-foot">{whatsapp ? <a href={whatsapp} target="_blank" rel="noreferrer">Continue on WhatsApp <ArrowUpRight size={16} /></a> : <Link to="/contact" onClick={() => setChat(false)}>Send an enquiry <ArrowUpRight size={16} /></Link>}</div></div>}<button className="float-button whatsapp-button" onClick={() => setChat(!chat)} aria-label={chat ? 'Close WhatsApp chat preview' : 'Open WhatsApp chat preview'} aria-expanded={chat}><WhatsAppIcon /></button></div></div>;
}

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; document.body.classList.add('is-loading'); const timer = window.setTimeout(() => setVisible(false), reduce ? 250 : 2300); return () => { window.clearTimeout(timer); document.body.classList.remove('is-loading'); }; }, []);
  useEffect(() => { if (!visible) document.body.classList.remove('is-loading'); }, [visible]);
  if (!visible) return null;
  return <div className="loading-screen" role="status" aria-live="polite" aria-label="Ewig & Eie is loading"><div className="loader-orbit loader-orbit-one"/><div className="loader-orbit loader-orbit-two"/><div className="loader-monogram"><span>E</span><span className="loader-amp">&</span><span>A</span></div><div className="loader-copy"><span>EWIG & EIE</span><p>Every beautiful story begins somewhere.</p><div className="loader-progress"/></div></div>;
}

export function Cursor() { useEffect(() => { if (window.matchMedia('(pointer: coarse)').matches) return; const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; const dot = document.getElementById('cursor-dot'); const ring = document.getElementById('cursor-ring'); if (!dot || !ring) return; let x = -100, y = -100, rx = -100, ry = -100, frame = 0; const move = (e: MouseEvent) => { x = e.clientX; y = e.clientY; dot.style.transform = `translate3d(${x}px,${y}px,0)`; if (reducedMotion) ring.style.transform = `translate3d(${x}px,${y}px,0)`; dot.style.opacity = '1'; ring.style.opacity = '1'; }; const leave = () => { dot.style.opacity = '0'; ring.style.opacity = '0'; }; const animate = () => { rx += (x - rx) * .16; ry += (y - ry) * .16; ring.style.transform = `translate3d(${rx}px,${ry}px,0)`; frame = requestAnimationFrame(animate); }; window.addEventListener('mousemove', move); document.addEventListener('mouseleave', leave); if (!reducedMotion) animate(); return () => { window.removeEventListener('mousemove', move); document.removeEventListener('mouseleave', leave); cancelAnimationFrame(frame); }; }, []); return <><div id="cursor-dot" /><div id="cursor-ring" /></>; }
export function ScrollProgress() { const [progress, setProgress] = useState(0); useEffect(() => { const update = () => { const max = document.documentElement.scrollHeight - innerHeight; setProgress(max > 0 ? window.scrollY / max * 100 : 0); }; window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update); update(); return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); }; }, []); return <div className="scroll-progress" style={{ width: `${progress}%` }} />; }
