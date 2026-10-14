import { cache } from 'react';
import { ledgerService } from '@/composition/finance';

export const loadLedger = cache((userId: string) => ledgerService.load(userId));
