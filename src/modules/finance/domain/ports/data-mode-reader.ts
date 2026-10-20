export interface DataModeReader {
  isManualMode(userId: string): Promise<boolean>;
}
