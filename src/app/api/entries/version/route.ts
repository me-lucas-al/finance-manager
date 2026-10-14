import { NextResponse } from 'next/server';
import { authorizeUser } from '@/app/api/authorize-user';
import { loadLedger } from '@/modules/finance/application/services/load-ledger';
import { computeLedgerVersion } from '@/modules/finance/domain/services/ledger-version';

export async function GET() {
  const authorization = await authorizeUser();
  if (authorization.response) return authorization.response;

  const version = computeLedgerVersion(await loadLedger(authorization.userId));
  return NextResponse.json({ version }, { headers: { 'Cache-Control': 'no-store' } });
}
