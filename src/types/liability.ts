import { type BaseEntity } from './base';

/**
 * Интерфейс для пользовательских типов пассивов
 */
export interface LiabilityTypeEntity extends BaseEntity {
  name: string;
  icon: string;
  description?: string;
}

/**
 * Предустановленные типы пассивов
 */
export enum DefaultLiabilityType {
  PROPERTY = 'property',
  VEHICLE = 'vehicle',
  ELECTRONICS = 'electronics',
  FURNITURE = 'furniture',
  OTHER = 'other'
}

/**
 * Интерфейс пассива
 */
export interface Liability extends BaseEntity {
  name: string;
  type: DefaultLiabilityType | string; // Строка для ID пользовательского типа
  icon: string;
  initialValue: number;
  currentValue: number;
  currency: string;
  description: string;
  purchaseDate: Date;
  ownerId: string;
  ownershipShares?: Record<string, number>;
}
