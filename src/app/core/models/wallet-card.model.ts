export type NetworkBrand = 'visa' | 'mastercard' | 'unknown';

export interface WalletCard {
  id?: string;
  cardHolder: string;
  cardNumber: string;
  lastDigits: string;
  network: NetworkBrand;
  expiryMonth: number;
  expiryYear: number;
  availableBalance: number;
  addedAt: number;
}
