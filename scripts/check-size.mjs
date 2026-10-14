import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const LIMIT = 100;
const IGNORED = [join('src', 'components', 'ui'), join('src', 'db', 'migrations')];

function sourceFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (IGNORED.includes(path)) return [];
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

const offenders = sourceFiles('src')
  .map((path) => ({ path, lines: readFileSync(path, 'utf8').split('\n').filter((line) => line.trim()).length }))
  .filter(({ lines }) => lines > LIMIT)
  .sort((a, b) => b.lines - a.lines);

offenders.forEach(({ path, lines }) => console.log(`${lines}\t${path}`));
process.exit(offenders.length > 0 ? 1 : 0);
