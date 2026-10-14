import { StatementPdfService } from '@/modules/finance/application/services/statement-pdf-service';
import { JsPdfStatementRenderer } from '@/modules/finance/infrastructure/pdf/jspdf-statement-renderer';
import { loadLedger } from './finance-loaders';

export const statementPdfService = new StatementPdfService(loadLedger, new JsPdfStatementRenderer(), () => new Date());
