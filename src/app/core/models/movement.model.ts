export interface Movement {
  id?: string;
  sourceCardId: string;
  sourceLast4: string;
  storeName: string;
  chargedAmount: number;
  timestamp: number;
  reaction?: string;
}
