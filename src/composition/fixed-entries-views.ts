import { createFixedEntriesDataService } from '@/modules/finance/application/services/fixed-entries-data-service';
import { generateDueFixedEntries, listFixedEntries } from './fixed-entries';

export const fixedEntriesData = createFixedEntriesDataService(generateDueFixedEntries, listFixedEntries);
