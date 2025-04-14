// src/stores/system/types.ts

// Тип транзакции
export interface TransactionType {
    id: string;
    name: string;
    icon?: string;
  }
  
  // Валюта
  export interface Currency {
    code: string;
    name: string;
    symbol: string;
    decimals: number;
    isDefault?: boolean;
  }
  
  // Владелец (временно, пока не будет создано полное хранилище владельцев)
  export interface Owner {
    id: string;
    name: string;
    color?: string;
    avatar?: string;
  }
  
  // Иконка
  export interface Icon {
    id: string;
    name: string;
    svg: string;
    category?: string;
  }