const TRANSFERS = 'Transferências';
const FOOD = 'Alimentação';
const TRANSPORT = 'Transporte';
const HEALTH = 'Saúde';
const LEISURE = 'Lazer';
const BILLS = 'Contas';
const FEES = 'Tarifas';
const OTHER = 'Outros';

const CATEGORY_TRANSLATIONS: Record<string, string> = {
  'transfer - pix': TRANSFERS,
  'transfer - ted': TRANSFERS,
  'transfer - doc': TRANSFERS,
  transfers: TRANSFERS,
  'same person transfer': 'Transferência própria',
  groceries: FOOD,
  'eating out': FOOD,
  restaurants: FOOD,
  'food delivery': FOOD,
  'taxi and ride-hailing': TRANSPORT,
  transportation: TRANSPORT,
  'public transportation': TRANSPORT,
  'gas stations': TRANSPORT,
  health: HEALTH,
  pharmacy: HEALTH,
  'gyms and fitness centers': HEALTH,
  entertainment: LEISURE,
  'video streaming': LEISURE,
  'music streaming': LEISURE,
  education: 'Educação',
  'mortgage and rent': 'Moradia',
  rent: 'Moradia',
  utilities: BILLS,
  telecommunications: BILLS,
  internet: BILLS,
  shopping: 'Compras',
  'online shopping': 'Compras',
  travel: 'Viagens',
  insurance: 'Seguros',
  taxes: 'Impostos',
  fees: FEES,
  'bank fees': FEES,
  'credit card payment': 'Cartão de Crédito',
  'automatic investment': 'Investimento automático',
  'proceeds interests and dividends': 'Rendimentos',
  'non-recurring income': OTHER,
  income: OTHER,
  salary: 'Salário',
  retirement: 'Aposentadoria',
};

export function translateCategory(category: string | null | undefined): string {
  const name = category?.trim().replace(/\s+/g, ' ');
  if (!name) return OTHER;
  const key = name.toLowerCase();
  return Object.hasOwn(CATEGORY_TRANSLATIONS, key) ? CATEGORY_TRANSLATIONS[key] : name;
}
