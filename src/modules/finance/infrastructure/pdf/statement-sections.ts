import type { jsPDF } from 'jspdf';
import { autoTable, type RowInput } from 'jspdf-autotable';
import type { StatementDocument, StatementLabeledValue } from '../../domain/models/statement-document';

const MARGIN = 14;
const HEAD_FILL: [number, number, number] = [30, 41, 59];
const GROUP_FILL: [number, number, number] = [226, 232, 240];
const EMPTY_MESSAGE = 'Nenhum lançamento encontrado para os filtros selecionados.';

type PdfWithLastTable = jsPDF & { lastAutoTable: { finalY: number } };

function finalY(doc: jsPDF): number {
  return (doc as PdfWithLastTable).lastAutoTable.finalY;
}

function labeledRows(items: StatementLabeledValue[]): RowInput[] {
  return items.map((item) => [item.label, { content: item.value, styles: { halign: 'right' } }]);
}

function entryRows(document: StatementDocument): RowInput[] {
  const columnCount = document.columns.length;
  if (document.groups.length === 0) return [[{ content: EMPTY_MESSAGE, colSpan: columnCount }]];
  return document.groups.flatMap((group) => [
    [{ content: group.date, colSpan: columnCount, styles: { fontStyle: 'bold', fillColor: GROUP_FILL } }],
    ...group.rows,
  ]);
}

export function drawHeader(doc: jsPDF, document: StatementDocument): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(document.appName, MARGIN, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Extrato - ${document.monthLabel}`, MARGIN, 26);
  doc.text(`Usuário: ${document.userLabel}`, MARGIN, 32);
  doc.text(`Gerado em: ${document.generatedAt} (horário de Brasília)`, MARGIN, 38);
  if (!document.filtersLabel) return 44;
  doc.text(`Filtros: ${document.filtersLabel}`, MARGIN, 44);
  return 50;
}

export function drawLabeledTable(doc: jsPDF, items: StatementLabeledValue[], startY: number): number {
  autoTable(doc, {
    startY,
    body: labeledRows(items),
    theme: 'plain',
    styles: { fontSize: 10 },
    margin: { left: MARGIN, right: MARGIN },
    columnStyles: { 0: { fontStyle: 'bold' } },
  });
  return finalY(doc) + 8;
}

export function drawEntries(doc: jsPDF, document: StatementDocument, startY: number): number {
  const alignment = Object.fromEntries(document.columns.map((column, index) => [index, { halign: column.align }]));
  autoTable(doc, {
    startY,
    head: [document.columns.map((column) => ({ content: column.header, styles: { halign: column.align } }))],
    body: entryRows(document),
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: HEAD_FILL },
    columnStyles: alignment,
    margin: { left: MARGIN, right: MARGIN },
  });
  return finalY(doc) + 8;
}

export function drawPageNumbers(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages();
  const { width, height } = doc.internal.pageSize;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.text(`Página ${page} de ${pageCount}`, width - MARGIN, height - 8, { align: 'right' });
  }
}
