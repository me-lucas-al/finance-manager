import type {
  PasswordResetTokenRepository,
  PasswordResetTokenRecord,
} from '../../modules/auth/application/password-reset';

export class FakePasswordResetTokenRepository implements PasswordResetTokenRepository {
  private tokens: PasswordResetTokenRecord[] = [];

  async create(data: { id: string; userId: string; token: string; expiresAt: Date }): Promise<PasswordResetTokenRecord> {
    const record: PasswordResetTokenRecord = {
      id: data.id,
      userId: data.userId,
      token: data.token,
      expiresAt: data.expiresAt,
      usedAt: null,
      createdAt: new Date(),
    };
    this.tokens.push(record);
    return record;
  }

  async findByToken(token: string): Promise<PasswordResetTokenRecord | null> {
    return this.tokens.find((t) => t.token === token) ?? null;
  }

  async markAsUsed(id: string): Promise<void> {
    const record = this.tokens.find((t) => t.id === id);
    if (record) {
      record.usedAt = new Date();
    }
  }
}
