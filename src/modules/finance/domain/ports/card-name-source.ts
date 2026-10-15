export interface CardNameSource {
  listCardNames(userId: string): Promise<string[]>;
}
