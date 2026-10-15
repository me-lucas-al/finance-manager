const GENERIC_CARD_PATTERNS = [
  /\b(?:no|pelo|em)\s+(?:cartao|credito)\b/,
  /\bcartao\s+de\s+credito\b/,
  /\bfatura\b(?!\s+(?:do|da|de|dos|das)\s+(?!cartao|credito)\w)/,
];

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function namedCardPattern(cardName: string): RegExp {
  const name = escapeRegExp(normalize(cardName));
  return new RegExp(`\\b(?:no|na|pelo|pela|cartao|fatura\\s+(?:do|da|de)(?:\\s+cartao)?)\\s+${name}\\b`);
}

export function mentionsCreditCard(text: string, cardNames: string[]): boolean {
  if (cardNames.length === 0) return false;
  const normalized = normalize(text);
  if (GENERIC_CARD_PATTERNS.some((pattern) => pattern.test(normalized))) return true;
  return cardNames.some((name) => namedCardPattern(name).test(normalized));
}
