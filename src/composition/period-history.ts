import { PeriodHistoryService } from '@/modules/periods/application/services/period-history-service';
import { DrizzlePeriodHistorySource } from '@/modules/periods/infrastructure/drizzle-period-history-source';
import { loadLedger } from './finance-loaders';

export const periodHistoryService = new PeriodHistoryService(new DrizzlePeriodHistorySource(), loadLedger);
