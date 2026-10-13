export class DuplicateFixedLaunchError extends Error {
  constructor() {
    super('Lançamento fixo já registrado neste mês');
    this.name = 'DuplicateFixedLaunchError';
  }
}
