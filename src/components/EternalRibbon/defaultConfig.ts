import type { EternalRibbonTheme } from './types';

export const defaultRibbonTheme: Required<Pick<EternalRibbonTheme, 'envelopeColor' | 'ribbonColor' | 'sealColor' | 'textColor' | 'backgroundColor'>> = {
  envelopeColor: '#F7F3EA',
  ribbonColor: '#89917A',
  sealColor: '#C6A66B',
  textColor: '#414735',
  backgroundColor: '#DED0BD',
};
