import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const SUPABASE_DIR = join(ROOT, 'supabase', 'migrations');
const DRIZZLE_JOURNAL = join(ROOT, 'src', 'db', 'migrations', 'meta', '_journal.json');
const HEADER_PATTERN = /^-- drizzle:\s*(.+)$/gm;
const RANGE_PATTERN = /^(\d{4})\.\.(\d{4})$/;

function drizzleTags(): string[] {
  const journal = JSON.parse(readFileSync(DRIZZLE_JOURNAL, 'utf8')) as { entries: { tag: string }[] };
  return journal.entries.map((entry) => entry.tag);
}

function expandToken(token: string, tags: string[]): string[] {
  const range = token.match(RANGE_PATTERN);
  if (!range) return [token];
  const [, from, to] = range;
  return tags.filter((tag) => tag.slice(0, 4) >= from && tag.slice(0, 4) <= to);
}

function coveredTags(tags: string[]): Set<string> {
  const covered = new Set<string>();
  for (const file of readdirSync(SUPABASE_DIR).filter((name) => name.endsWith('.sql'))) {
    const content = readFileSync(join(SUPABASE_DIR, file), 'utf8').replace(/^﻿/, '');
    for (const match of content.matchAll(HEADER_PATTERN)) {
      match[1].split(',').map((token) => token.trim()).forEach((token) => {
        expandToken(token, tags).forEach((tag) => covered.add(tag));
      });
    }
  }
  return covered;
}

describe('drizzle and supabase migrations', () => {
  it('has a supabase migration declaring every drizzle migration', () => {
    const tags = drizzleTags();
    const covered = coveredTags(tags);

    const missing = tags.filter((tag) => !covered.has(tag));

    expect(missing).toEqual([]);
  });

  it('never repeats a supabase migration version', () => {
    const versions = readdirSync(SUPABASE_DIR)
      .filter((name) => name.endsWith('.sql'))
      .map((name) => name.split('_')[0]);

    const duplicated = versions.filter((version, index) => versions.indexOf(version) !== index);

    expect(duplicated).toEqual([]);
  });
});
