import type { CardLinkValidator } from '@/modules/finance/domain/ports/card-link-validator';

export const noopCardLinkValidator: CardLinkValidator = {
  async assertUsable() {},
};
