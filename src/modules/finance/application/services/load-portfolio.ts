import { getEffectiveUserId } from '@/app/actions/require-session';
import { createPortfolioService } from '../../infrastructure/portfolio-factory';
import type { Portfolio } from '../../domain/models/portfolio';

export async function loadPortfolio(overrideUserId?: string): Promise<Portfolio> {
  const userId = overrideUserId ?? (await getEffectiveUserId());
  return createPortfolioService().load(userId);
}
