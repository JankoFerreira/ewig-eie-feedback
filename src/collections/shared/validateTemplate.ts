// Strict shape validation for fixed-layout collection data.
// The default content acts as the schema: same keys, same array lengths, same stable IDs.
// A rule may accept/reject a value by key; returning undefined falls back to the default check.
export type TemplateRule = (key: string, input: unknown, template: unknown) => boolean | undefined;

export function matchesTemplate(template: unknown, input: unknown, rule: TemplateRule = () => undefined, key = ''): boolean {
  const decided = rule(key, input, template);
  if (decided !== undefined) return decided;
  if (typeof template === 'string') return typeof input === 'string' && input.length <= 4000;
  if (typeof template === 'number') return input === template;
  if (typeof template === 'boolean') return typeof input === 'boolean';
  if (Array.isArray(template)) {
    // Arrays of primitives (e.g. invited event IDs) may vary in length; arrays of objects are fixed slots.
    if (!Array.isArray(input)) return false;
    if (template.length && typeof template[0] !== 'object') return input.length <= 50 && input.every(v => typeof v === typeof template[0] && matchesTemplate(template[0], v, rule, key));
    return input.length === template.length && template.every((v, i) => matchesTemplate(v, input[i], rule));
  }
  if (template && typeof template === 'object') {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return false;
    const entries = Object.entries(template);
    return Object.keys(input).length === entries.length && entries.every(([k, v]) => Object.hasOwn(input, k) && matchesTemplate(v, (input as Record<string, unknown>)[k], rule, k));
  }
  return false;
}

export const isHexColour = (value: unknown) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
export const isTime = (value: unknown) => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
export const isFocal = (value: unknown) => typeof value === 'string' && /^\d{1,3}% \d{1,3}%$/.test(value) && value.split(' ').every(n => parseInt(n) <= 100);
// Uploaded photographs are embedded data URLs until a media service exists. SVG is refused (script risk).
export const isSafeImageSource = (value: unknown) => typeof value === 'string' && value.length <= 12 * 1024 * 1024 && /^(data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=\s]+|https:\/\/[^\s"'<>]+|\/?[^:"'<>\s]*\.(webp|png|jpe?g))$/i.test(value);

// WCAG relative-luminance contrast ratio for two #rrggbb colours.
export function contrastRatio(a: string, b: string) {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
    return .2126 * r + .7152 * g + .0722 * bl;
  };
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + .05) / (y + .05);
}
