import { describe, it, expect } from 'vitest';
import { daysLeftLabel } from '@/app/profile/days-left-label';

describe('daysLeftLabel', () => {
  it('uses the plural for several days', () => {
    expect(daysLeftLabel(26)).toBe('faltam 26 dias');
    expect(daysLeftLabel(2)).toBe('faltam 2 dias');
  });

  it('calls the last day by its name', () => {
    expect(daysLeftLabel(1)).toBe('último dia');
  });

  it('says the period ended when nothing is left', () => {
    expect(daysLeftLabel(0)).toBe('período encerrado');
  });
});
