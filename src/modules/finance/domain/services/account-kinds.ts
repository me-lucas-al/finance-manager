import type { AccountBalance } from '../models/portfolio';

const CARD_TYPES = ['CREDIT_CARD'];

export const isCardAccount = (account: AccountBalance): boolean => CARD_TYPES.includes(account.accountType);

export const bankAccountsOf = (accounts: AccountBalance[]): AccountBalance[] =>
  accounts.filter((account) => !isCardAccount(account));

export const cardAccountsOf = (accounts: AccountBalance[]): AccountBalance[] => accounts.filter(isCardAccount);
