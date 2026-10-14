const MAX_INITIALS = 2;

export function toInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, MAX_INITIALS)
    .join('')
    .toUpperCase();
}

export function formatMemberSince(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}
