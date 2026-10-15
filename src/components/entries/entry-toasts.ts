import { toast } from '@/components/ui/toast';
import type { SpendingAlert } from '@/modules/finance/domain/models/spending-patterns';

export function notifyEntrySaved(title: string, alerts: SpendingAlert[]): void {
  toast.add({ title, type: 'success' });
  for (const alert of alerts) {
    toast.add({ title: 'Atenção aos seus gastos', description: alert.message, type: 'warning' });
  }
}
