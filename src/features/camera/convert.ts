// Shrinks a phone photo and converts it to WebP in the browser before upload (less data on venue Wi-Fi).
// Browsers that cannot encode WebP fall back to JPEG; the backend then converts to WebP.
export const MAX_EDGE = 2048;

export async function toWebP(file: Blob, quality = .82): Promise<{ blob: Blob; width: number; height: number; format: 'webp' | 'jpeg' }> {
  if (!file.type.startsWith('image/')) throw new Error('not-an-image');
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => { throw new Error('not-an-image'); });
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale), height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('not-an-image');
  ctx.drawImage(bitmap, 0, 0, width, height); bitmap.close?.();
  const encode = (type: string, q: number) => new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, q));
  const webp = await encode('image/webp', quality);
  if (webp && webp.type === 'image/webp') return { blob: webp, width, height, format: 'webp' };
  const jpeg = await encode('image/jpeg', .85);
  if (!jpeg) throw new Error('not-an-image');
  return { blob: jpeg, width, height, format: 'jpeg' };
}
