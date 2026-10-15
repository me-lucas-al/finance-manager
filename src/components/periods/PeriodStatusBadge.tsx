import { Badge } from '@/components/ui/badge';

export function PeriodStatusBadge({ closed }: { closed: boolean }) {
  if (closed) return <Badge variant="secondary">Fechado</Badge>;
  return <Badge variant="default">Em andamento</Badge>;
}
