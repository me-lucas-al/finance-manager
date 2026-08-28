import { getSupabaseAdmin } from '@/lib/supabase';
import { AlertLog, NewAlertLog, AlertLogRepository } from '../domain/repositories/alert-log-repository';
import { unwrap } from './supabase-common';

type AlertLogRow = {
  id: string;
  alert_type: string;
  message: string;
  sent_at: string;
};

function toAlertLog(row: AlertLogRow): AlertLog {
  return { id: row.id, alertType: row.alert_type, message: row.message, sentAt: row.sent_at };
}

export class SupabaseAlertLogRepository implements AlertLogRepository {
  async findLatestByType(alertType: string): Promise<AlertLog | null> {
    const { data, error } = await getSupabaseAdmin()
      .from('alerts_log')
      .select()
      .eq('alert_type', alertType)
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toAlertLog(data as AlertLogRow) : null;
  }

  async hasSentSince(alertType: string, since: Date): Promise<boolean> {
    const { count, error } = await getSupabaseAdmin()
      .from('alerts_log')
      .select('id', { count: 'exact', head: true })
      .eq('alert_type', alertType)
      .gte('sent_at', since.toISOString());
    if (error) throw new Error(error.message);
    return (count ?? 0) > 0;
  }

  async create(data: NewAlertLog): Promise<AlertLog> {
    const result = await getSupabaseAdmin()
      .from('alerts_log')
      .insert({ alert_type: data.alertType, message: data.message })
      .select()
      .single();
    return toAlertLog(unwrap<AlertLogRow>(result));
  }
}
