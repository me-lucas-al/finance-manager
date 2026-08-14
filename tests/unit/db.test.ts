import { describe, it, expect } from 'vitest';
import * as schema from '@/db/schema';

describe('Database Schema', () => {
  it('should have all required tables defined', () => {
    expect(schema.users).toBeDefined();
    expect(schema.userSettings).toBeDefined();
    expect(schema.financialPeriods).toBeDefined();
    expect(schema.incomes).toBeDefined();
    expect(schema.expenses).toBeDefined();
    expect(schema.investments).toBeDefined();
    expect(schema.notificationPreferences).toBeDefined();
    expect(schema.pushSubscriptions).toBeDefined();
    expect(schema.notifications).toBeDefined();
  });
});
