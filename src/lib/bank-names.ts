// Single source of truth for the display name of the banks normalizeBankName
// recognizes. Kept dependency-free (no pluggy-sdk import) so client
// components can use it without pulling the Node-only Pluggy SDK into the
// browser bundle.
export const KNOWN_BANK_NAMES: Record<string, string> = {
  itau: 'Itaú',
  nubank: 'Nubank',
  inter: 'Inter',
};
