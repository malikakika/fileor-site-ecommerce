import { httpPostSecure } from './httpClient';

export type UploadResult = { path: string };
export type SignResult = { url: string };

export async function uploadProductImage(file: File): Promise<UploadResult> {
  const fd = new FormData();
  fd.append('file', file);
  return httpPostSecure<UploadResult>('/files/upload', fd);
}

export async function signImage(path: string): Promise<string> {
  const { url } = await httpPostSecure<SignResult>('/files/sign', { path });
  return url;
}

const isHttp = (s?: string) => !!s && /^https?:\/\//i.test(s);

export async function ensureDisplayUrl(src?: string): Promise<string> {
  if (!src) return '';
  if (isHttp(src)) return src;

  if (src.startsWith('/uploads/')) {
    const api = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '/');
    try {
      return new URL(src, api).toString();
    } catch {
      return src;
    }
  }

  return signImage(src);
}
