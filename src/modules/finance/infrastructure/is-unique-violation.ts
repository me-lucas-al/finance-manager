const UNIQUE_VIOLATION_CODE = '23505';

function readCode(value: unknown): unknown {
  return typeof value === 'object' && value !== null ? (value as { code?: unknown }).code : undefined;
}

export function isUniqueViolation(error: unknown): boolean {
  if (readCode(error) === UNIQUE_VIOLATION_CODE) return true;
  const cause = typeof error === 'object' && error !== null ? (error as { cause?: unknown }).cause : undefined;
  return readCode(cause) === UNIQUE_VIOLATION_CODE;
}
