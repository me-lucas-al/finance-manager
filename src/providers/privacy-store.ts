const STORAGE_KEY = 'finance_manager_privacy_mode';
const listeners = new Set<() => void>();

export function subscribePrivacy(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

export function readPrivacy(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function readServerPrivacy(): boolean {
  return false;
}

export function writePrivacy(isPrivate: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(isPrivate));
  } catch {
    return;
  }
  listeners.forEach((listener) => listener());
}
