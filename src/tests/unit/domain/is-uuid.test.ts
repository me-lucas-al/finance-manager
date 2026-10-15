import { describe, it, expect } from 'vitest';
import { isUuid } from '@/lib/is-uuid';

describe('isUuid', () => {
  it('accepts canonical uuids in any case', () => {
    expect(isUuid('0b9f8a3e-5c1d-4e7a-9f2b-1c3d5e7f9a0b')).toBe(true);
    expect(isUuid('0B9F8A3E-5C1D-4E7A-9F2B-1C3D5E7F9A0B')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isUuid('card-1')).toBe(false);
    expect(isUuid('')).toBe(false);
    expect(isUuid('0b9f8a3e5c1d4e7a9f2b1c3d5e7f9a0b')).toBe(false);
    expect(isUuid('0b9f8a3e-5c1d-4e7a-9f2b-1c3d5e7f9a0b; drop')).toBe(false);
  });
});
