export function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    console.warn(`[storage] corrupt key: ${key}`);
    localStorage.removeItem(key);
    return fallback;
  }
}

export function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e: any) {
    if (e.name === 'QuotaExceededError') {
      console.warn('[storage] quota exceeded:', key);
      window.dispatchEvent(new CustomEvent('storage:quotaExceeded', { detail: key }));
    }
  }
}
