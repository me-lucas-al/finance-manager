import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function UnavailableCard({ title }: { title: string }) {
  return (
    <Card className="bg-[#111216] border-zinc-800/80 rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p role="alert" className="text-xs text-red-400">
          Não foi possível carregar esta seção agora. Atualize a página para tentar de novo.
        </p>
      </CardContent>
    </Card>
  );
}
