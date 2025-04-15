// src/stores/currency/types.ts - обновленная версия
export interface Currency {
    code: string;         // ISO код валюты (USD, RUB)
    name: string;         // Полное название
    symbol: string;       // Символ (₽, $, €)
    decimalPlaces: number; // Количество знаков после запятой
    groupSeparator?: string; // Разделитель тысяч (по умолчанию: ',')
    decimalSeparator?: string; // Разделитель десятичных (по умолчанию: '.')
  }
  
  export interface ExchangeRate {
    fromCurrency: string; // Код исходной валюты
    toCurrency: string;   // Код целевой валюты
    rate: number;         // Курс обмена
    timestamp: number;    // Время последнего обновления
    source?: string;      // Источник курса (API, manual)
  }
  
  export interface ConversionResult {
    convertedAmount: number;  // Сконвертированная сумма
    appliedRate: number;      // Примененный курс
    feeAmount: number;        // Сумма комиссии (если есть)
  }
  
  export interface CurrencyState {
    currencies: Currency[];   // Список всех валют
    exchangeRates: ExchangeRate[]; // Список курсов обмена
    appBaseCurrency: string;  // Базовая валюта приложения (для кросс-курсов)
  }