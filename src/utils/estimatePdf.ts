type EstimateItem = { label: string; amount: number };

type Estimate = {
  language: 'en' | 'af';
  packageName: string;
  items: EstimateItem[];
  total: number;
};

const ascii = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[’‘]/g, "'").replace(/[–—]/g, '-').replace(/[^\x20-\x7E]/g, '');
const escapePdf = (value: string) => ascii(value).replace(/[\\()]/g, character => `\\${character}`);
const money = (value: number) => `R ${value.toLocaleString('en-ZA')}`;

export function makeEstimatePdf(estimate: Estimate): Blob {
  const af = estimate.language === 'af';
  const commands: string[] = [];
  const text = (value: string, x: number, y: number, size: number, font = 'F1', color = '0.18 0.27 0.20') => {
    commands.push(`${color} rg BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdf(value)}) Tj ET`);
  };
  const line = (y: number) => commands.push(`0.80 0.84 0.79 RG 0.8 w 48 ${y} m 547 ${y} l S`);
  const rect = (x: number, y: number, w: number, h: number, color: string) => commands.push(`${color} rg ${x} ${y} ${w} ${h} re f`);

  rect(0, 0, 595, 842, '0.975 0.973 0.951');
  rect(0, 677, 595, 165, '0.17 0.27 0.20');
  text('EWIG & EIE', 48, 790, 17, 'F2', '0.97 0.96 0.91');
  text(af ? 'KONSEPBERAMING' : 'DRAFT ESTIMATE', 48, 733, 30, 'F2', '0.97 0.96 0.91');
  text(af ? 'Julle storie, pragtig vertel.' : 'Your story, beautifully told.', 48, 704, 11, 'F1', '0.81 0.88 0.78');
  text(af ? 'VERSAMELING' : 'COLLECTION', 48, 631, 9, 'F2');
  text(estimate.packageName, 48, 607, 21, 'F2');
  text(af ? 'JULLE KEUSES' : 'YOUR SELECTIONS', 48, 562, 9, 'F2');
  line(550);

  let y = 526;
  for (const item of estimate.items) {
    const label = ascii(item.label);
    const chunks = label.match(/.{1,58}(?:\s|$)|.{1,58}/g) ?? [label];
    for (let i = 0; i < chunks.length; i++) {
      text(chunks[i].trim(), 48, y, 11);
      if (i === 0) text(money(item.amount), 470, y, 11, 'F2');
      y -= 18;
    }
    y -= 5;
  }
  line(y - 4);
  text(af ? 'GESKATTE TOTAAL' : 'INDICATIVE TOTAL', 48, y - 40, 10, 'F2');
  text(money(estimate.total), 388, y - 47, 25, 'F2');

  const caveat = af
    ? ['Slegs konsepbedrae vir beplanning. Drukspesifikasies, aflewering,', 'fotograafbeskikbaarheid, finale omvang en pryse word in ’n skriftelike', 'kwotasie bevestig. Die RSVP-paneel is tans ’n ontwerpvoorskou.']
    : ['Planning figures only. Print specifications, delivery, photographer', 'availability, final scope and pricing are confirmed in a written quote.', 'The RSVP dashboard is currently a design preview.'];
  caveat.forEach((sentence, index) => text(sentence, 48, 156 - index * 16, 9, 'F1', '0.42 0.49 0.43'));
  line(89);
  text(af ? 'Geskep vir julle beplanning - geen bespreking of betaling vereis nie.' : 'Made for your planning - no booking or payment required.', 48, 68, 9);
  text('EWIG & EIE  /  SOUTH AFRICA', 48, 44, 8, 'F2', '0.43 0.53 0.44');

  const stream = commands.join('\n') + '\n';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}endstream`,
  ];
  let source = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(source.length); source += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = source.length;
  source += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(offset => { source += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  source += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([source], { type: 'application/pdf' });
}

export function downloadEstimatePdf(estimate: Estimate) {
  const url = URL.createObjectURL(makeEstimatePdf(estimate));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ewig-eie-draft-estimate.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
