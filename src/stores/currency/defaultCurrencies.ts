// src/stores/currency/defaultCurrencies.ts
import type { Currency, ExchangeRate } from './types';

export const defaultCurrencies: Currency[] = [
  {
    code: 'RUB',
    name: 'Russian Ruble',
    symbol: '₽',
    decimalPlaces: 2,
    groupSeparator: ' ',
    decimalSeparator: ','
  },
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    decimalPlaces: 2,
    groupSeparator: ',',
    decimalSeparator: '.'
  },
  {
    code: 'IDR',
    name: 'Indonesian Rupiah',
    symbol: 'Rp',
    decimalPlaces: 0,
    groupSeparator: '.',
    decimalSeparator: ','
  }
];

// Начальные курсы обмена (можно будет заменить на реальные данные из API)
export const defaultExchangeRates: ExchangeRate[] = [
  {
    fromCurrency: 'USD',
    toCurrency: 'RUB',
    rate: 75.5,
    timestamp: Date.now(),
    source: 'default'
  },
  {
    fromCurrency: 'USD',
    toCurrency: 'IDR',
    rate: 16500,
    timestamp: Date.now(),
    source: 'default'
  },
  {
    fromCurrency: 'RUB',
    toCurrency: 'IDR',
    rate: 202.05,
    timestamp: Date.now(),
    source: 'default'
  }
];