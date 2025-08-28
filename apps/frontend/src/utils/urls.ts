import { API_URL } from '../services/httpClient';

function backendOrigin(): string {
  try {
    return new URL(API_URL, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
}

export function absoluteUploadUrl(u?: string) {
  if (!u) return '';
  try {
    return new URL(u, backendOrigin() + '/').toString();
  } catch {
    return u;
  }
}
