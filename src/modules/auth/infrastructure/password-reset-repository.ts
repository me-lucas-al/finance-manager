import { eq } from 'drizzle-orm';
import { db } from '../../../db';
import { passwordResetTokens } from '../../../db/schema';
import {
  PasswordResetTokenRepository,
  PasswordResetTokenRecord,
} from '../application/password-reset';

export class DrizzlePasswordResetTokenRepository implements PasswordResetTokenRepository {
  async create(data: { id: string; userId: string; token: string; expiresAt: Date }): Promise<PasswordResetTokenRecord> {
    const [result] = await db
      .insert(passwordResetTokens)
      .values({
        id: data.id,
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
      })
      .returning();

    return result as PasswordResetTokenRecord;
  }

  async findByToken(token: string): Promise<PasswordResetTokenRecord | null> {
    const [result] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));

    return (result as PasswordResetTokenRecord) ?? null;
  }

  async markAsUsed(id: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, id));
  }
}
