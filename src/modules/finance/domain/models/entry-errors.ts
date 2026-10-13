export class EntryNotFoundError extends Error {
  constructor(message = 'Lançamento não encontrado') {
    super(message);
    this.name = 'EntryNotFoundError';
  }
}

export class EntryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EntryValidationError';
  }
}
