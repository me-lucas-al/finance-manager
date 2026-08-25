import { auth } from '@/auth';

export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  return session.user.id;
}

export async function requireOwnedEntity<T extends { userId: string }>(
  repo: { findById(id: string): Promise<T | null> },
  id: string,
  userId: string
): Promise<T> {
  const existing = await repo.findById(id);
  if (!existing || existing.userId !== userId) throw new Error('Not found or unauthorized');
  return existing;
}
