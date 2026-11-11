import { eventResponse, type DemoGuest } from '../../components/couple/guestModel';
import type { Household, IvoryData, Language } from './content';
import { analyseSeating, cateringSummary, isInvited, type Seating } from './model';

// Spreadsheet-safe CSV: quoted cells and neutralised formula prefixes.
export const csvCell = (value: string | number) => { const text = String(value); return `"${(/^[=+@\-\t\r]/.test(text) ? `'${text}` : text).replace(/"/g, '""')}"`; };
export const toCsv = (rows: (string | number)[][]) => '﻿' + rows.map(r => r.map(csvCell).join(',')).join('\r\n');
const label = (language: Language, en: string, af: string) => language === 'af' ? af : en;

export function householdCsv(guests: DemoGuest[], households: Household[], data: IvoryData, language: Language) {
  const head = [label(language, 'Household', 'Huishouding'), label(language, 'Guest', 'Gas'), ...data.events.map(e => e.name[language]), label(language, 'Meal', 'Ete'), label(language, 'Replied', 'Geantwoord')];
  const rows = guests.map(g => [households.find(h => h.id === g.householdId)?.name ?? g.householdId, g.name, ...data.events.map(e => isInvited(households, g, e.id) ? eventResponse(g, e.id) : label(language, 'not invited', 'nie genooi nie')), g.attendance === 'accepted' ? data.meals.find(m => m.id === g.meal)?.name[language] ?? label(language, 'not chosen', 'nie gekies nie') : '', g.respondedOn?.slice(0, 10) ?? '']);
  return toCsv([head, ...rows]);
}

export function cateringCsv(guests: DemoGuest[], households: Household[], data: IvoryData, seating: Seating, language: Language) {
  const c = cateringSummary(guests, data, language);
  const table = (name: string) => data.tables.find(t => t.id === seating[guests.find(g => g.name === name)?.id ?? ''])?.name ?? '';
  const rows: (string | number)[][] = [[label(language, 'Section', 'Afdeling'), label(language, 'Item', 'Item'), label(language, 'Count', 'Aantal'), label(language, 'Guests', 'Gaste'), label(language, 'Table', 'Tafel')]];
  for (const e of data.events) { const n = guests.filter(g => isInvited(households, g, e.id) && eventResponse(g, e.id) === 'accepted').length; rows.push([label(language, 'Headcount', 'Koppetal'), `${e.name[language]} · ${e.date} ${e.time}`, n, '', '']); }
  for (const m of c.meals) rows.push([label(language, 'Wedding dinner', 'Trouete'), m.label, m.count, m.guests.join('; '), '']);
  if (c.unselected.length) rows.push([label(language, 'Wedding dinner', 'Trouete'), label(language, 'Meal not chosen', 'Ete nie gekies nie'), c.unselected.length, c.unselected.join('; '), '']);
  for (const d of c.dietary) rows.push([label(language, 'Dietary', 'Dieet'), d.label, d.count, d.guests.join('; '), d.guests.map(table).join('; ')]);
  for (const a of c.allergies) rows.push([label(language, 'Allergy', 'Allergie'), a.detail, 1, a.guest, table(a.guest)]);
  for (const a of c.access) rows.push([label(language, 'Access', 'Toegang'), a.detail, 1, a.guest, table(a.guest)]);
  return toCsv(rows);
}

export function seatingCsv(guests: DemoGuest[], data: IvoryData, seating: Seating, language: Language) {
  const report = analyseSeating(guests, data, seating);
  const rows: (string | number)[][] = [[label(language, 'Table', 'Tafel'), label(language, 'Seat', 'Sitplek'), label(language, 'Guest', 'Gas'), 'RSVP', label(language, 'Meal', 'Ete'), label(language, 'Dietary / allergy', 'Dieet / allergie')]];
  for (const t of report.tables) t.seated.forEach((g, i) => rows.push([t.name, i + 1, g.name, g.attendance, data.meals.find(m => m.id === g.meal)?.name[language] ?? '', [...(g.dietaryRequirements ?? []), ...(g.allergies ?? []).map(a => a.ingredient)].join('; ')]));
  for (const g of report.unseated) rows.push([label(language, 'Unseated', 'Nie geplaas nie'), '', g.name, g.attendance, data.meals.find(m => m.id === g.meal)?.name[language] ?? '', '']);
  return toCsv(rows);
}

export function runSheetCsv(data: IvoryData, language: Language) {
  const rows: (string | number)[][] = [[label(language, 'Date', 'Datum'), label(language, 'Time', 'Tyd'), label(language, 'Gathering', 'Geleentheid'), label(language, 'Moment', 'Oomblik'), label(language, 'Location / note', 'Ligging / nota')]];
  for (const e of data.events) {
    rows.push([e.date, '', e.name[language], `${label(language, 'Gathering starts', 'Geleentheid begin')} ${e.time}`, e.location]);
    for (const item of data.itinerary.filter(i => i.eventId === e.id && !i.hidden).sort((a, b) => a.time.localeCompare(b.time))) rows.push([e.date, item.time, e.name[language], item.name[language], item.note[language]]);
  }
  return toCsv(rows);
}

export function download(filename: string, text: string, type = 'text/csv;charset=utf-8;') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
