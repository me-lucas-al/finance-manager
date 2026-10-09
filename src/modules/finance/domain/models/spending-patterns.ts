export type SpendingAlertType =
  | 'repeated_small'
  | 'spike_above_average'
  | 'subscription_like'
  | 'near_category_limit';

export type SpendingAlert = {
  type: SpendingAlertType;
  category: string;
  message: string;
  totalSpent?: number;
};

export type SpendingPatternReport = {
  alerts: SpendingAlert[];
  hasAlerts: boolean;
};
