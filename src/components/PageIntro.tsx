import { AnimatedHeading } from './WordMotion';
import { useLanguage } from '../i18n';

type Props = { page: string; kicker: string; title: string; italic: string; description: string };

/** A quiet introduction that leads directly into the page's purpose. */
export function PageIntro({ page, kicker, title, italic, description }: Props) {
  const { language } = useLanguage();
  const names: Record<string, string> = { Websites: 'Webwerwe', Stationery: 'Drukwerk', Designs: 'Ontwerpe', Pricing: 'Pryse', Contact: 'Kontak', Photographers: 'Fotograwe', 'What we offer': 'Wat ons bied' };
  return <section className="page-intro" data-watermark={language === 'af' ? names[page] || page : page}>
    <span className="eyebrow">{kicker}</span>
    <AnimatedHeading as="h1" effect="drift">{title}<br/><em>{italic}</em></AnimatedHeading>
    <p>{description}</p>
    <span className="intro-rule" aria-hidden="true"/>
  </section>;
}
