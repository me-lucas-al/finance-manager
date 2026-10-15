export interface CardLinkValidator {
  assertUsable(userId: string, creditCardId: string): Promise<void>;
}

export const noopCardLinkValidator: CardLinkValidator = {
  async assertUsable() {},
};
