import { jsPDF } from 'jspdf';
import type { StatementDocument } from '../../domain/models/statement-document';
import type { StatementRenderer } from '../../domain/ports/statement-renderer';
import { toPdfSafeDocument } from './pdf-text';
import { drawEntries, drawHeader, drawLabeledTable, drawPageNumbers } from './statement-sections';

export class JsPdfStatementRenderer implements StatementRenderer {
  render(document: StatementDocument): Uint8Array {
    const safeDocument = toPdfSafeDocument(document);
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    pdf.setProperties({ title: `Extrato - ${safeDocument.monthLabel}`, creator: safeDocument.appName });

    const afterHeader = drawHeader(pdf, safeDocument);
    const afterSummary = drawLabeledTable(pdf, safeDocument.summary, afterHeader);
    const afterEntries = drawEntries(pdf, safeDocument, afterSummary);
    drawLabeledTable(pdf, safeDocument.totals, afterEntries);
    drawPageNumbers(pdf);

    return new Uint8Array(pdf.output('arraybuffer'));
  }
}
