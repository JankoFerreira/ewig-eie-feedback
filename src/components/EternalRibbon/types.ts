export type RibbonLanguage = 'en' | 'af';

export type EternalRibbonTheme = {
  envelopeColor?: string;
  ribbonColor?: string;
  sealColor?: string;
  textColor?: string;
  backgroundColor?: string;
  backgroundImage?: string;
};

export type EternalRibbonIntroProps = {
  coupleNames: string;
  initials: string;
  weddingDate: string;
  theme?: EternalRibbonTheme;
  invitationWording?: string;
  language?: RibbonLanguage;
  fontFamily?: string;
  animationSpeed?: number;
  showBotanicals?: boolean;
  skipForReturningGuests?: boolean;
  storageKey?: string;
  onComplete: () => void;
};
