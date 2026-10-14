export interface PasswordResetTokenRecord {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface PasswordResetTokenRepository {
  create(data: { id: string; userId: string; token: string; expiresAt: Date }): Promise<PasswordResetTokenRecord>;
  findByToken(token: string): Promise<PasswordResetTokenRecord | null>;
  markAsUsed(id: string): Promise<void>;
}
