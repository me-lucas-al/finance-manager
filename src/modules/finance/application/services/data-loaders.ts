import type { LedgerEntry } from '../../domain/models/ledger-entry';
import type { Portfolio } from '../../domain/models/portfolio';

export type LedgerLoader = (userId: string) => Promise<LedgerEntry[]>;
export type PortfolioLoader = (userId: string) => Promise<Portfolio>;
