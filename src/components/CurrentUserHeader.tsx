import { auth } from '@/auth';
import { userRepository } from '@/composition/users';
import type { HeaderUser } from '@/types/user';
import { AppHeader } from './AppHeader';

async function resolveHeaderUser(): Promise<HeaderUser | null> {
  const session = await auth();
  const sessionUser = session?.user;
  if (!sessionUser?.id) return null;
  if (sessionUser.name && sessionUser.email) {
    return { name: sessionUser.name, email: sessionUser.email, image: sessionUser.image };
  }

  const storedUser = await userRepository.findById(sessionUser.id);
  if (!storedUser) return null;
  return { name: storedUser.name, email: storedUser.email, image: sessionUser.image };
}

export async function CurrentUserHeader() {
  return <AppHeader user={await resolveHeaderUser()} />;
}
