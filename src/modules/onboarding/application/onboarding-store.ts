export interface OnboardingStore {
  isCompleted(userId: string): Promise<boolean>;
  complete(userId: string): Promise<void>;
}
