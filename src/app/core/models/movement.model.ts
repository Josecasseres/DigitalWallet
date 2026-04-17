export type MovementType = 'payment' | 'deposit';

export interface Movement {
  id?: string;
  sourceCardId: string;
  sourceLast4: string;
  storeName: string;
  chargedAmount: number;
  timestamp: number;
  type?: MovementType;
  reaction?: string;
}
