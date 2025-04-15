// src/stores/currency/currencyStore.ts - обновленная версия
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Currency, ExchangeRate, ConversionResult } from './types';
import { defaultCurrencies, defaultExchangeRates } from './defaultCurrencies';
import { CurrencyService } from './currencyService';
import { useUserStore } from '../user'; // Импортируем хранилище пользователей

export const useCurrencyStore = defineStore('currency', () => {
  // Состояние
  const currencies = ref<Currency[]>(defaultCurrencies);
  const exchangeRates = ref<ExchangeRate[]>(defaultExchangeRates);
  const appBaseCurrency = ref<string>('USD');  // Валюта приложения по умолчанию - для кросс-курсов
  
  // Используем базовую валюту из профиля текущего пользователя
  const userBaseCurrency = computed(() => {
    const userStore = useUserStore();
    return userStore.currentUser?.settings?.baseCurrency || appBaseCurrency.value;
  });
  
  // Геттеры
  const getCurrency = computed(() => {
    return (code: string): Currency | undefined => {
      return currencies.value.find(c => c.code === code);
    };
  });
  
  const getExchangeRate = computed(() => {
    return (fromCurrency: string, toCurrency: string): number => {
      // Если валюты одинаковые, курс всегда 1
      if (fromCurrency === toCurrency) return 1;
      
      // Поиск прямого курса
      const directRate = exchangeRates.value.find(
        rate => rate.fromCurrency === fromCurrency && rate.toCurrency === toCurrency
      );
      if (directRate) return directRate.rate;
      
      // Поиск обратного курса
      const reverseRate = exchangeRates.value.find(
        rate => rate.fromCurrency === toCurrency && rate.toCurrency === fromCurrency
      );
      if (reverseRate) return 1 / reverseRate.rate;
      
      // Попытка использовать кросс-курс через базовую валюту
      const crossRate = CurrencyService.calculateCrossRate(
        exchangeRates.value,
        fromCurrency,
        toCurrency,
        appBaseCurrency.value
      );
      
      // Если удалось вычислить кросс-курс, используем его
      if (crossRate !== null) return crossRate;
      
      // Если не удалось найти курс, возвращаем 1 и логируем ошибку
      console.warn(`Exchange rate not found: ${fromCurrency} to ${toCurrency}`);
      return 1;
    };
  });
  
  const formatCurrency = computed(() => {
    return (amount: number, currencyCode: string): string => {
      const currency = getCurrency.value(currencyCode);
      if (!currency) {
        console.warn(`Currency not found: ${currencyCode}`);
        return amount.toString();
      }
      
      return CurrencyService.formatAmount(amount, currency);
    };
  });
  
  // Форматирование суммы в базовой валюте пользователя
  const formatInUserCurrency = computed(() => {
    return (amount: number, fromCurrency?: string): string => {
      const sourceCurrency = fromCurrency || userBaseCurrency.value;
      
      // Если валюта та же, что и базовая пользователя, просто форматируем
      if (sourceCurrency === userBaseCurrency.value) {
        return formatCurrency.value(amount, userBaseCurrency.value);
      }
      
      // Иначе конвертируем в базовую валюту пользователя и форматируем
      const result = convertAmount(
        amount, 
        sourceCurrency, 
        userBaseCurrency.value
      );
      
      return formatCurrency.value(result.convertedAmount, userBaseCurrency.value);
    };
  });
  
  // Действия
  async function fetchLatestRates(baseCurrency: string = appBaseCurrency.value) {
    try {
      const rates = await CurrencyService.fetchExchangeRates(baseCurrency);
      
      // Обновляем существующие курсы или добавляем новые
      rates.forEach(newRate => {
        const existingIndex = exchangeRates.value.findIndex(
          rate => rate.fromCurrency === newRate.fromCurrency && 
                 rate.toCurrency === newRate.toCurrency
        );
        
        if (existingIndex !== -1) {
          // Обновление существующего курса
          exchangeRates.value[existingIndex] = newRate;
        } else {
          // Добавление нового курса
          exchangeRates.value.push(newRate);
        }
      });
      
      return rates;
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      throw error;
    }
  }
  
  function updateExchangeRate(fromCurrency: string, toCurrency: string, rate: number) {
    const existingIndex = exchangeRates.value.findIndex(
      r => r.fromCurrency === fromCurrency && r.toCurrency === toCurrency
    );
    
    const newRate: ExchangeRate = {
      fromCurrency,
      toCurrency,
      rate,
      timestamp: Date.now(),
      source: 'manual' // Отмечаем, что курс был обновлен вручную
    };
    
    if (existingIndex !== -1) {
      // Обновление существующего курса
      exchangeRates.value[existingIndex] = newRate;
    } else {
      // Добавление нового курса
      exchangeRates.value.push(newRate);
    }
  }
  
  function addCurrency(currency: Currency) {
    // Проверяем, не существует ли уже такая валюта
    if (currencies.value.some(c => c.code === currency.code)) {
      console.warn(`Currency already exists: ${currency.code}`);
      return false;
    }
    
    currencies.value.push(currency);
    return true;
  }
  
  function removeCurrency(currencyCode: string) {
    // Нельзя удалить базовую валюту приложения
    if (currencyCode === appBaseCurrency.value) {
      console.warn(`Cannot remove application base currency: ${currencyCode}`);
      return false;
    }
    
    // Проверяем, используется ли эта валюта как базовая у какого-либо пользователя
    const userStore = useUserStore();
    const users = userStore.getAllUsers();
    const isUserBaseCurrency = users.some(user => 
      user.settings?.baseCurrency === currencyCode
    );
    
    if (isUserBaseCurrency) {
      console.warn(`Cannot remove currency used as base currency by users: ${currencyCode}`);
      return false;
    }
    
    const initialLength = currencies.value.length;
    currencies.value = currencies.value.filter(c => c.code !== currencyCode);
    
    // Удаляем связанные курсы обмена
    exchangeRates.value = exchangeRates.value.filter(
      rate => rate.fromCurrency !== currencyCode && rate.toCurrency !== currencyCode
    );
    
    return currencies.value.length < initialLength;
  }
  
  function convertAmount(
    amount: number, 
    fromCurrency: string, 
    toCurrency: string,
    options?: {
      manualRate?: number,
      feePercentage?: number,
      feeFixed?: number
    }
  ): ConversionResult {
    // Используем ручной курс или получаем из хранилища
    const rate = options?.manualRate || getExchangeRate.value(fromCurrency, toCurrency);
    
    return CurrencyService.convertCurrency(
      amount,
      fromCurrency,
      toCurrency,
      rate,
      {
        feePercentage: options?.feePercentage,
        feeFixed: options?.feeFixed
      }
    );
  }
  
  // Инициализация
  async function init() {
    // Загружаем актуальные курсы при инициализации хранилища
    await fetchLatestRates();
  }
  
  return {
    // Состояние
    currencies,
    exchangeRates,
    appBaseCurrency,
    
    // Геттеры
    userBaseCurrency,
    getCurrency,
    getExchangeRate,
    formatCurrency,
    formatInUserCurrency,
    
    // Действия
    fetchLatestRates,
    updateExchangeRate,
    addCurrency,
    removeCurrency,
    convertAmount,
    init,
    
    // Установка базовой валюты приложения (для кросс-курсов)
    setAppBaseCurrency: (currency: string) => { 
      if (currencies.value.some(c => c.code === currency)) {
        appBaseCurrency.value = currency;
        return true;
      }
      return false;
    }
  };
});