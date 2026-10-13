import { NextResponse } from 'next/server';
import { getEffectiveUserId } from '@/app/actions/require-session';
import { OwnerResolutionError } from '@/modules/auth/domain/resolve-owner-user-id';
import { loadLedger } from '@/modules/finance/application/services/load-ledger';
import { computeLedgerVersion } from '@/modules/finance/domain/services/ledger-version';

const NO_STORE = { 'Cache-Control': 'no-store' };

export async function GET() {
  try {
    const userId = await getEffectiveUserId();
    const version = computeLedgerVersion(await loadLedger(userId));
    return NextResponse.json({ version }, { headers: NO_STORE });
  } catch (error) {
    if (!(error instanceof OwnerResolutionError)) throw error;
    const status = error.failure === 'unauthenticated' ? 401 : 403;
    return NextResponse.json({ error: error.message }, { status, headers: NO_STORE });
  }
}
