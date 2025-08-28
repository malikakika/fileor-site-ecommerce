export type NormalizedError =
  | 'EMAIL_IN_USE'
  | 'PASSWORD_TOO_SHORT'
  | 'VALIDATION'
  | 'GENERIC';

export function normalizeApiError(err: any): NormalizedError {
  const msg = typeof err?.message === 'string' ? err.message : '';

  try {
    const parsed = JSON.parse(msg);

    const pMsg = parsed?.message;
    const code = parsed?.statusCode;

    if (code === 409 && /email.*in use/i.test(pMsg)) return 'EMAIL_IN_USE';

    if (code === 400) {
      if (Array.isArray(pMsg)) {
        if (
          pMsg.some((m: string) =>
            /password.*longer.*6|password.*at least.*6/i.test(m)
          )
        )
          return 'PASSWORD_TOO_SHORT';
        return 'VALIDATION';
      }
      if (typeof pMsg === 'string') {
        if (/password.*longer.*6|password.*at least.*6/i.test(pMsg))
          return 'PASSWORD_TOO_SHORT';
        if (/validation|bad request/i.test(pMsg)) return 'VALIDATION';
      }
    }
  } catch {
    // not JSON – continue with string matching
  }

  if (/email.*in use/i.test(msg)) return 'EMAIL_IN_USE';
  if (/password.*6/i.test(msg)) return 'PASSWORD_TOO_SHORT';

  return 'GENERIC';
}
