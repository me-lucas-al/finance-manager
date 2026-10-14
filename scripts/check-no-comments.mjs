import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

const IGNORED = [join('src', 'components', 'ui'), join('src', 'tests', 'e2e')];

function sourceFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (IGNORED.includes(path)) return [];
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

function commentsOf(path) {
  const text = readFileSync(path, 'utf8');
  const kind = path.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, kind);
  const found = new Map();
  const collect = (ranges = []) => ranges.forEach((range) => found.set(range.pos, range));
  const visit = (node) => {
    collect(ts.getLeadingCommentRanges(text, node.getFullStart()));
    collect(ts.getTrailingCommentRanges(text, node.getEnd()));
    node.getChildren(source).forEach(visit);
  };
  visit(source);
  return [...found.values()].map((range) => ({
    line: source.getLineAndCharacterOfPosition(range.pos).line + 1,
    text: text.slice(range.pos, range.end),
  }));
}

let total = 0;
for (const path of sourceFiles('src')) {
  for (const comment of commentsOf(path)) {
    total++;
    console.log(`${path}:${comment.line}\t${comment.text.split('\n')[0].slice(0, 80)}`);
  }
}
process.exit(total > 0 ? 1 : 0);
