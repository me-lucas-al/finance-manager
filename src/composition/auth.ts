import { authorizeCredentials } from '@/modules/auth/application/authorize-credentials';
import { DrizzlePasswordResetTokenRepository } from '@/modules/auth/infrastructure/password-reset-repository';
import { emailService } from '@/modules/notifications/email/EmailService';
import { userRepository } from './users';

export const passwordResetTokenRepository = new DrizzlePasswordResetTokenRepository();

export { emailService };

export function authorizeUserCredentials(email: string, password: string) {
  return authorizeCredentials(userRepository, email, password);
}
