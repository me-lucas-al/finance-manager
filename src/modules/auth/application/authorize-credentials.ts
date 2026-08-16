import { verifyPassword } from '../domain/password';
import { UserRepository } from '../../users/domain/repositories/user-repository';

export interface AuthorizedUser {
  id: string;
  email: string;
  name: string;
}

export async function authorizeCredentials(
  userRepo: UserRepository,
  email: string,
  password: string
): Promise<AuthorizedUser | null> {
  const user = await userRepo.findByEmail(email);
  if (!user) return null;

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) return null;

  return { id: user.id, email: user.email, name: user.name };
}
