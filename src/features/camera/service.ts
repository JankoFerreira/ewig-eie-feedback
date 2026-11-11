// Disposable camera: every guest gets one "roll" of 20 shots; at most 60 guests per wedding use it (1,200 photos).
// Photos appear in the gallery immediately; the couple can remove (and restore) any photo or add their own.
//
// The real service comes from the gallery backend (another developer). It must implement GuestPhotoService and
// enforce the same limits SERVER-SIDE per guest token — the browser counter alone can be bypassed.

export const SHOTS_PER_GUEST = 20;
export const MAX_CAMERA_GUESTS = 60;

export type GuestPhoto = {
  id: string; weddingId: string; guestId: string; guestName: string; src: string;
  takenAt: string; width: number; height: number; bytes: number; format: 'webp' | 'jpeg';
  removed: boolean; byCouple: boolean;
};
export type Allowance = { used: number; remaining: number; cameraGuests: number; guestLimitReached: boolean };
export type CameraError = 'roll-finished' | 'guest-limit' | 'too-large' | 'not-an-image' | 'upload-failed';

export interface GuestPhotoService {
  allowance(guestId: string): Allowance;
  upload(input: { guestId: string; guestName: string; blob: Blob; width: number; height: number; format: 'webp' | 'jpeg' }): Promise<GuestPhoto>;
  addCouplePhoto(input: { blob: Blob; width: number; height: number; format: 'webp' | 'jpeg' }): Promise<GuestPhoto>;
  list(options?: { includeRemoved?: boolean }): GuestPhoto[];
  setRemoved(photoId: string, removed: boolean): void;
  subscribe(listener: () => void): () => void;
}

export class CameraLimitError extends Error { constructor(public code: CameraError) { super(code); } }

/** In-memory demo service: same rules as production, resets on reload, nothing leaves the browser. */
export function createMockPhotoService(weddingId: string): GuestPhotoService {
  let photos: GuestPhoto[] = [];
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach(l => l());
  const usedBy = (guestId: string) => photos.filter(p => p.guestId === guestId && !p.byCouple).length; // removed photos still count: a roll is a roll
  const guests = () => new Set(photos.filter(p => !p.byCouple).map(p => p.guestId));
  const make = (input: { blob: Blob; width: number; height: number; format: 'webp' | 'jpeg' }, guestId: string, guestName: string, byCouple: boolean): GuestPhoto => {
    if (input.blob.size > 6 * 1024 * 1024) throw new CameraLimitError('too-large');
    return { id: crypto.randomUUID(), weddingId, guestId, guestName, src: URL.createObjectURL(input.blob), takenAt: new Date().toISOString(), width: input.width, height: input.height, bytes: input.blob.size, format: input.format, removed: false, byCouple };
  };
  const service: GuestPhotoService = {
    allowance(guestId) {
      const used = usedBy(guestId); const g = guests();
      return { used, remaining: Math.max(0, SHOTS_PER_GUEST - used), cameraGuests: g.size, guestLimitReached: !g.has(guestId) && g.size >= MAX_CAMERA_GUESTS };
    },
    async upload(input) {
      const a = service.allowance(input.guestId);
      if (a.guestLimitReached) throw new CameraLimitError('guest-limit');
      if (a.remaining <= 0) throw new CameraLimitError('roll-finished');
      const photo = make(input, input.guestId, input.guestName, false);
      photos = [photo, ...photos]; emit(); return photo;
    },
    async addCouplePhoto(input) { const photo = make(input, 'couple', 'Couple', true); photos = [photo, ...photos]; emit(); return photo; },
    list(options) { return photos.filter(p => options?.includeRemoved || !p.removed); },
    setRemoved(id, removed) { photos = photos.map(p => p.id === id ? { ...p, removed } : p); emit(); },
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  };
  return service;
}

const registry = new Map<string, GuestPhotoService>();
/** One service per wedding so the camera and the gallery share photos. Swap the factory for the real backend. */
export function photoServiceFor(weddingId: string, factory: (id: string) => GuestPhotoService = createMockPhotoService) {
  if (!registry.has(weddingId)) registry.set(weddingId, factory(weddingId));
  return registry.get(weddingId)!;
}
