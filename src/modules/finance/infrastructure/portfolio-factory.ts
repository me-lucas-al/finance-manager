import { SupabaseAccountRepository } from '@/modules/open-finance/infrastructure/supabase-repositories';
import { PortfolioService } from '../application/services/portfolio-service';
import { PersistencePortfolioSource } from './persistence-portfolio-source';

export function createPortfolioService(): PortfolioService {
  return new PortfolioService(new PersistencePortfolioSource(new SupabaseAccountRepository()));
}
