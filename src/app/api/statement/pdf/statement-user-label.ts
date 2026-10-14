type SessionUser = { name?: string | null; email?: string | null } | undefined;

const FALLBACK_LABEL = 'Usuário';

export function statementUserLabel(user: SessionUser): string {
  return user?.name?.trim() || user?.email?.trim() || FALLBACK_LABEL;
}
