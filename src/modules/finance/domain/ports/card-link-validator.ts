export interface CardLinkValidator {
  assertUsable(userId: string, creditCardId: string): Promise<void>;
}
