import { useId } from 'react';

/** A flowing satin ribbon, drawn in SVG: the brand's background ornament (replaces the large star). */
export function Ribbon({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  const path = 'M-40 250 C 120 60, 300 70, 420 210 S 700 420, 860 250 S 1120 40, 1260 170';
  return <svg className={`ribbon-ornament ${className}`} viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      {/* Light and shade bands along the ribbon read as satin folds. */}
      <linearGradient id={`rb-satin-${id}`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="currentColor" stopOpacity=".15"/>
        <stop offset=".18" stopColor="currentColor" stopOpacity=".55"/>
        <stop offset=".32" stopColor="currentColor" stopOpacity=".22"/>
        <stop offset=".5" stopColor="currentColor" stopOpacity=".6"/>
        <stop offset=".68" stopColor="currentColor" stopOpacity=".2"/>
        <stop offset=".84" stopColor="currentColor" stopOpacity=".5"/>
        <stop offset="1" stopColor="currentColor" stopOpacity=".12"/>
      </linearGradient>
    </defs>
    <path className="ribbon-body" d={path} fill="none" stroke={`url(#rb-satin-${id})`} strokeWidth="46" strokeLinecap="round"/>
    <path className="ribbon-edge" d={path} fill="none" stroke="currentColor" strokeOpacity=".5" strokeWidth="1.2" transform="translate(0 -22)"/>
    <path className="ribbon-edge" d={path} fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="1" transform="translate(0 22)"/>
    <path className="ribbon-shine" d={path} fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="3" transform="translate(0 -9)"/>
    <path className="ribbon-tail" d="M860 250 C 900 330, 880 400, 830 440" fill="none" stroke={`url(#rb-satin-${id})`} strokeWidth="30" strokeLinecap="round"/>
  </svg>;
}
