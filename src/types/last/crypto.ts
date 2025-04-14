import { type BaseEntity } from './base';


export interface Cryptocurrency extends BaseEntity {
  symbol: string;
  name: string;
  amount: number;
  initialValueUSD: number;
  currentValueUSD: number;
  walletAddress?: string;
  ownerId: string;
  ownershipShares?: Record<string, number>;
}

