type Party = { name?: string; documentNumber?: { value?: string } };

const MIN_NAME_LENGTH = 5;
const digitsOf = (value: string): string => value.replace(/\D/g, '');

function sameDocument(payer?: Party, receiver?: Party): boolean {
  const payerDocument = digitsOf(payer?.documentNumber?.value ?? '');
  const receiverDocument = digitsOf(receiver?.documentNumber?.value ?? '');
  return payerDocument !== '' && payerDocument === receiverDocument;
}

function sameName(payer?: Party, receiver?: Party): boolean {
  if (!payer?.name || !receiver?.name) return false;
  const payerName = payer.name.trim().toLowerCase();
  return payerName.length > MIN_NAME_LENGTH && payerName === receiver.name.trim().toLowerCase();
}

export const areSamePerson = (payer?: Party, receiver?: Party): boolean =>
  sameDocument(payer, receiver) || sameName(payer, receiver);
