import type { StatementDocument } from '../models/statement-document';

export interface StatementRenderer {
  render(document: StatementDocument): Uint8Array;
}
