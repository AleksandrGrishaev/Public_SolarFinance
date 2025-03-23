// src/types/asset.ts
import { type BaseEntity } from './base';

/**
 * Интерфейс для пользовательских типов активов
 */
export interface AssetTypeEntity extends BaseEntity {
  name: string;
  icon: string;
  description?: string;
}

/**
 * Предустановленные типы активов
 */
export enum DefaultAssetType {
  BUSINESS = 'business',
  PROJECT = 'project',
  REAL_ESTATE = 'realEstate'
}

/**
 * Интерфейс актива
 */
export interface Asset extends BaseEntity {
  name: string;
  type: DefaultAssetType | string; // Строка для ID пользовательского типа
  icon: string;
  initialValue: number;
  currentValue: number;
  currency: string;
  description: string;
  isManaged: boolean;
  ownerId: string;
  ownershipShares?: Record<string, number>;
}
