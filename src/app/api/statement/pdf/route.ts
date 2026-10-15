import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { statementPdfService } from '@/composition/statement';
import { getCurrentMonth, isValidMonthKey } from '@/lib/month';
import { authorizeUser } from '@/modules/auth/infrastructure/authorize-user';
import { parseStatementFilters } from '@/modules/finance/domain/services/statement-filter-params';
import { statementUserLabel } from './statement-user-label';

const NO_STORE = { 'Cache-Control': 'no-store' };

export async function GET(request: Request) {
  const authorization = await authorizeUser();
  if (authorization.response) return authorization.response;

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const month = params.month ?? getCurrentMonth();
  if (!isValidMonthKey(month)) {
    return NextResponse.json({ error: 'Mês inválido. Use YYYY-MM.' }, { status: 400, headers: NO_STORE });
  }

  const session = await auth();
  const pdf = await statementPdfService
    .generate({
      userId: authorization.userId,
      userLabel: statementUserLabel(session?.user),
      month,
      filters: parseStatementFilters(params),
    })
    .catch(() => null);
  if (!pdf) return NextResponse.json({ error: 'Falha ao gerar o PDF.' }, { status: 500, headers: NO_STORE });

  return new Response(new Blob([pdf as BlobPart], { type: 'application/pdf' }), {
    headers: {
      ...NO_STORE,
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=extrato-${month}.pdf`,
    },
  });
}
