// src/stores/currency/currencyService.ts
import type { Currency, ExchangeRate, ConversionResult } from './types';

export class CurrencyService {
  // Форматирование суммы в соответствии с правилами валюты
  public static formatAmount(amount: number, currency: Currency): string {
    // Используем Intl.NumberFormat если доступно
    if (typeof Intl !== 'undefined') {
      return new Intl.NumberFormat('default', {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: currency.decimalPlaces,
        maximumFractionDigits: currency.decimalPlaces
      }).format(amount);
    } 
    
    // Ручное форматирование как запасной вариант
    const fixed = amount.toFixed(currency.decimalPlaces);
    const [whole, decimal] = fixed.split('.');
    
    // Форматирование целой части с разделителями групп
    const groupSeparator = currency.groupSeparator || ',';
    const decimalSeparator = currency.decimalSeparator || '.';
    
    const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
    
    return decimal 
      ? `${currency.symbol} ${formattedWhole}${decimalSeparator}${decimal}`
      : `${currency.symbol} ${formattedWhole}`;
  }

  // Получение кросс-курса через базовую валюту
  public static calculateCrossRate(
    rates: ExchangeRate[], 
    fromCurrency: string, 
    toCurrency: string, 
    baseCurrency: string
  ): number | null {
    // Если валюты совпадают
    if (fromCurrency === toCurrency) return 1;
    
    // Проверка на прямой курс
    const directRate = rates.find(
      rate => rate.fromCurrency === fromCurrency && rate.toCurrency === toCurrency
    );
    if (directRate) return directRate.rate;
    
    // Проверка на обратный курс
    const reverseRate = rates.find(
      rate => rate.fromCurrency === toCurrency && rate.toCurrency === fromCurrency
    );
    if (reverseRate) return 1 / reverseRate.rate;
    
    // Использование кросс-курса через базовую валюту
    const fromBase = this.getExchangeRateFromRates(rates, fromCurrency, baseCurrency);
    const toBase = this.getExchangeRateFromRates(rates, toCurrency, baseCurrency);
    
    if (fromBase && toBase) {
      return fromBase / toBase;
    }
    
    return null; // Невозможно вычислить курс
  }

  // Вспомогательный метод для получения курса обмена
  private static getExchangeRateFromRates(
    rates: ExchangeRate[], 
    fromCurrency: string, 
    toCurrency: string
  ): number | null {
    // Если валюты совпадают
    if (fromCurrency === toCurrency) return 1;
    
    // Поиск прямого курса
    const directRate = rates.find(
      rate => rate.fromCurrency === fromCurrency && rate.toCurrency === toCurrency
    );
    if (directRate) return directRate.rate;
    
    // Поиск обратного курса
    const reverseRate = rates.find(
      rate => rate.fromCurrency === toCurrency && rate.toCurrency === fromCurrency
    );
    if (reverseRate) return 1 / reverseRate.rate;
    
    return null; // Курс не найден
  }

  // Конвертация валюты с учетом комиссий
  public static convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    rate: number,
    options?: {
      feePercentage?: number;
      feeFixed?: number;
    }
  ): ConversionResult {
    const feePercentage = options?.feePercentage || 0;
    const feeFixed = options?.feeFixed || 0;
    
    // Базовая конвертация
    const basicConverted = amount * rate;
    
    // Расчет комиссии
    const percentageFee = basicConverted * (feePercentage / 100);
    const totalFee = percentageFee + feeFixed;
    
    // Итоговая сумма
    const finalAmount = basicConverted - totalFee;
    
    return {
      convertedAmount: finalAmount,
      appliedRate: rate,
      feeAmount: totalFee
    };
  }

  // Mock-функция для получения курсов обмена (будет заменена на API)
  public static async fetchExchangeRates(baseCurrency: string): Promise<ExchangeRate[]> {
    // В реальном приложении здесь будет запрос к API
    // Пример: const response = await fetch(`https://api.exchangerate.host/latest?base=${baseCurrency}`);
    
    // Заглушка для демонстрации
    const mockRates = {
      USD: { RUB: 75.5, IDR: 14500 },
      RUB: { USD: 0.0132, IDR: 192.05 },
      IDR: { USD: 0.000069, RUB: 0.0052 }
    };
    
    const results: ExchangeRate[] = [];
    
    // Конвертируем в структуру ExchangeRate
    if (baseCurrency in mockRates) {
      Object.entries(mockRates[baseCurrency]).forEach(([currency, rate]) => {
        results.push({
          fromCurrency: baseCurrency,
          toCurrency: currency,
          rate: rate as number,
          timestamp: Date.now(),
          source: 'api'
        });
      });
    }
    
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return results;
  }
}