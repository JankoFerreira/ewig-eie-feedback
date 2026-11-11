export type NamedDraft<T> = { name: string; state: T };
// Collection-specific database names isolate drafts while sharing the storage implementation.
export function createNamedDraftStore<T>(databaseName: string) {
  const open = () => new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('drafts', { keyPath: 'name' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Draft storage is blocked'));
  });
  return {
    async list(): Promise<NamedDraft<T>[]> {
      const db = await open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('drafts', 'readonly');
        const request = tx.objectStore('drafts').getAll();
        tx.oncomplete = () => { db.close(); resolve(request.result); };
        tx.onerror = tx.onabort = () => { db.close(); reject(tx.error); };
      });
    },
    async save(name: string, state: T): Promise<void> {
      const db = await open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('drafts', 'readwrite');
        tx.objectStore('drafts').put({ name, state });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = tx.onabort = () => { db.close(); reject(tx.error); };
      });
    },
  };
}
