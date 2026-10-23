import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { translate } from './translations';

type Language = 'en' | 'af';
const LanguageContext = createContext<{ language: Language; setLanguage: (value: Language) => void }>({ language: 'en', setLanguage: () => {} });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem('ewig-eie-language') === 'af' ? 'af' : 'en');
  useEffect(() => { localStorage.setItem('ewig-eie-language', language); document.documentElement.lang = language; }, [language]);
  const value = useMemo(() => ({ language, setLanguage }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
const textCache = new WeakMap<Text, { original: string; translated: string }>();
const attributeCache = new WeakMap<Element, Map<string, { original: string; translated: string }>>();
const attributes = ['alt', 'aria-label', 'placeholder', 'title'];

function preserveSpacing(value: string, language: Language) {
  const trimmed = value.trim();
  if (!trimmed) return value;
  const translated = translate(trimmed, language);
  if (translated === trimmed) return value;
  return value.replace(trimmed, translated);
}

function localizeText(node: Text, language: Language) {
  const current = node.nodeValue ?? '';
  const cached = textCache.get(node);
  const original = cached && (current === cached.original || current === cached.translated) ? cached.original : current;
  const translated = preserveSpacing(original, language);
  textCache.set(node, { original, translated });
  if (current !== translated) node.nodeValue = translated;
}

function localizeAttributes(element: Element, language: Language) {
  let cached = attributeCache.get(element);
  if (!cached) { cached = new Map(); attributeCache.set(element, cached); }
  for (const attribute of attributes) {
    const current = element.getAttribute(attribute);
    if (current === null) continue;
    const previous = cached.get(attribute);
    const original = previous && (current === previous.original || current === previous.translated) ? previous.original : current;
    const translated = translate(original, language);
    cached.set(attribute, { original, translated });
    if (current !== translated) element.setAttribute(attribute, translated);
  }
}

function localizeTree(root: Node, language: Language) {
  if (root.nodeType === Node.TEXT_NODE) { localizeText(root as Text, language); return; }
  if (!(root instanceof Element)) return;
  if (root.closest('[data-no-translate],svg,script,style,textarea,[contenteditable="true"]')) return;
  localizeAttributes(root, language);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeType === Node.TEXT_NODE) {
      if (!(node.parentElement?.closest('[data-no-translate],svg,script,style,textarea,[contenteditable="true"]'))) localizeText(node as Text, language);
    } else if (node instanceof Element && !node.closest('[data-no-translate],svg,script,style,textarea,[contenteditable="true"]')) localizeAttributes(node, language);
  }
}

export function SiteTranslator() {
  const { language } = useLanguage();
  const location = useLocation();
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    localizeTree(root, language);
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'characterData') localizeTree(record.target, language);
        else if (record.type === 'childList') record.addedNodes.forEach(node => localizeTree(node, language));
        else if (record.type === 'attributes' && record.target instanceof Element) localizeAttributes(record.target, language);
      }
    });
    observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attributes });
    return () => observer.disconnect();
  }, [language, location.pathname]);
  return null;
}
