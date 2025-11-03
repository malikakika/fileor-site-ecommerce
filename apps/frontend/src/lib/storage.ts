export function getJSON<T = unknown>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === 'undefined' || raw === 'null' || raw.trim() === '') {
      localStorage.removeItem(key);
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function setJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error (setJSON)', e);
  }
}

export function removeKey(key: string) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Storage error (removeKey)', e);
  }
}

export function migrateBadKeys() {
  const KEYS = ['auth_token','auth_user','cart','cart_v2','guest_cart','currency'];
  for (const k of KEYS) {
    const raw = localStorage.getItem(k);
    if (!raw) continue;
    if (raw === 'undefined' || raw === 'null' || raw.trim() === '') {
      localStorage.removeItem(k);
      continue;
    }
    try {
      JSON.parse(raw);
    } catch {
      localStorage.removeItem(k);
    }
  }
}
