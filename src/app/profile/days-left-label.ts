export function daysLeftLabel(daysLeft: number): string {
  if (daysLeft <= 0) return 'período encerrado';
  if (daysLeft === 1) return 'último dia';
  return `faltam ${daysLeft} dias`;
}
