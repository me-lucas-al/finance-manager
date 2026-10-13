export class EntryNotFoundError extends Error {
  constructor() {
    super('Lançamento não encontrado');
    this.name = 'EntryNotFoundError';
  }
}

export class EntryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EntryValidationError';
  }
}
