import fs from 'fs';
import path from 'path';

const testUserFile = path.join(process.cwd(), 'playwright/.auth/test-user.json');

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

// auth.setup.ts and auth.spec.ts run as separate Playwright projects (separate
// worker processes), so a module-level constant computed with Date.now() would
// resolve to two different values instead of one shared user. Persisting the
// registered user to disk after setup keeps every project reading the same one.
export function saveTestUser(user: TestUser): void {
  fs.mkdirSync(path.dirname(testUserFile), { recursive: true });
  fs.writeFileSync(testUserFile, JSON.stringify(user));
}

export function loadTestUser(): TestUser {
  return JSON.parse(fs.readFileSync(testUserFile, 'utf-8'));
}
