export function formatMemberSince(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}
