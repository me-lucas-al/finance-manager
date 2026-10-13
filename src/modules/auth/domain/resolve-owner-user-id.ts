export type OwnerResolutionFailure = 'unauthenticated' | 'owner_mismatch';

export class OwnerResolutionError extends Error {
  constructor(readonly failure: OwnerResolutionFailure) {
    super(
      failure === 'unauthenticated'
        ? 'No authenticated session'
        : 'Session user differs from FINANCE_OWNER_USER_ID'
    );
    this.name = 'OwnerResolutionError';
  }
}

export function resolveOwnerUserId(sessionUserId: string | null | undefined, ownerUserId: string | undefined): string {
  if (!sessionUserId) throw new OwnerResolutionError('unauthenticated');
  if (ownerUserId && ownerUserId !== sessionUserId) throw new OwnerResolutionError('owner_mismatch');
  return sessionUserId;
}
