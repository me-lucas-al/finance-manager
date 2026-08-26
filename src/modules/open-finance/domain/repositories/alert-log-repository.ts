export type AlertLog = {
  id: string;
  alertType: string;
  message: string;
  sentAt: string;
};

export type NewAlertLog = Omit<AlertLog, 'id' | 'sentAt'>;

export interface AlertLogRepository {
  findLatestByType(alertType: string): Promise<AlertLog | null>;
  hasSentSince(alertType: string, since: Date): Promise<boolean>;
  create(data: NewAlertLog): Promise<AlertLog>;
}
