import { createHmac, timingSafeEqual } from 'node:crypto';

export type DeletionTarget = { userId: string; kind: string; id: string };

const TOKEN_TTL_MS = 10 * 60 * 1000;

export class DeletionConfirmationService {
  constructor(
    private readonly secret: string,
    private readonly now: () => number = Date.now
  ) {}

  issue(target: DeletionTarget, turnId: string): string {
    const expiresAt = this.now() + TOKEN_TTL_MS;
    return `${expiresAt}.${turnId}.${this.sign(target, expiresAt, turnId)}`;
  }

  isConfirmed(token: string, target: DeletionTarget, currentTurnId: string): boolean {
    const [expiresAt, issuedTurnId, signature] = token.split('.');
    if (!expiresAt || !issuedTurnId || !signature) return false;
    if (Number(expiresAt) < this.now()) return false;
    if (issuedTurnId === currentTurnId) return false;
    const expected = Buffer.from(this.sign(target, Number(expiresAt), issuedTurnId));
    const received = Buffer.from(signature);
    return expected.length === received.length && timingSafeEqual(expected, received);
  }

  private sign(target: DeletionTarget, expiresAt: number, turnId: string): string {
    return createHmac('sha256', this.secret)
      .update([target.userId, target.kind, target.id, expiresAt, turnId].join('|'))
      .digest('hex');
  }
}
