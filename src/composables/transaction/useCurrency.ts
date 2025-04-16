// src/composables/transaction/useCurrency.ts
import { computed, type ComputedRef, type Ref } from 'vue';
import { useCurrencyStore } from '../../stores/currency';
import { useAccountStore } from '../../stores/account';

/**
 * Хук для управления валютами и конвертацией в транзакциях
 */
export function useCurrency(
  selectedAccount: Ref<string>,
  destinationAccount: Ref<string>,
  selectedType: Ref<string>,
  amount: Ref<string>
) {
  // Инициализируем хранилища
  const currencyStore = useCurrencyStore();
  const accountStore = useAccountStore();

  /**
   * Получает код валюты для указанного счета
   */
  const getAccountCurrencyCode = (accountId: string): string => {
    const account = accountStore.getAccountById(accountId);
    if (!account) return currencyStore.appBaseCurrency;
    
    return account.currency;
  };

  /**
   * Возвращает символ валюты для исходного счета
   */
  const sourceCurrencySymbol = computed(() => {
    if (!selectedAccount.value) {
      return currencyStore.getCurrency(currencyStore.appBaseCurrency)?.symbol || '$';
    }
    
    const account = accountStore.getAccountById(selectedAccount.value);
    if (!account) {
      return currencyStore.getCurrency(currencyStore.appBaseCurrency)?.symbol || '$';
    }
    
    const currencyCode = account.currency;
    const currency = currencyStore.getCurrency(currencyCode);
    
    if (currency) {
      return currency.symbol;
    }
    
    return account.symbol || currencyStore.getCurrency(currencyStore.appBaseCurrency)?.symbol || '$';
  });

  /**
   * Возвращает символ валюты для счета назначения
   */
  const destinationCurrencySymbol = computed(() => {
    if (!destinationAccount.value) {
      return currencyStore.getCurrency(currencyStore.appBaseCurrency)?.symbol || '$';
    }
    
    const account = accountStore.getAccountById(destinationAccount.value);
    if (!account) {
      return currencyStore.getCurrency(currencyStore.appBaseCurrency)?.symbol || '$';
    }
    
    const currencyCode = account.currency;
    const currency = currencyStore.getCurrency(currencyCode);
    
    if (currency) {
      return currency.symbol;
    }
    
    return account.symbol || currencyStore.getCurrency(currencyStore.appBaseCurrency)?.symbol || '$';
  });

  /**
   * Проверяет, имеют ли выбранные счета разные валюты
   */
  const hasDifferentCurrencies = computed(() => {
    if (selectedType.value !== 'transfer' || !selectedAccount.value || !destinationAccount.value) {
      return false;
    }
    
    const sourceAccount = accountStore.getAccountById(selectedAccount.value);
    const destAccount = accountStore.getAccountById(destinationAccount.value);
    
    if (!sourceAccount || !destAccount) {
      return false;
    }
    
    return sourceAccount.currency !== destAccount.currency;
  });

  /**
   * Определяет, находимся ли мы в режиме перевода между счетами с разными валютами
   */
  const isTransferWithDifferentCurrencies = computed(() => {
    return selectedType.value === 'transfer' && hasDifferentCurrencies.value;
  });

  /**
   * Конвертирует сумму из одной валюты в другую
   */
  const convertCurrencyAmount = (
    amount: number, 
    fromCurrency: string, 
    toCurrency: string
  ) => {
    // Если валюты совпадают, возвращаем исходную сумму
    if (fromCurrency === toCurrency) {
      return {
        convertedAmount: amount,
        appliedRate: 1,
        feeAmount: 0
      };
    }
    
    // Используем сервис конвертации из хранилища валют
    try {
      return currencyStore.convertAmount(
        amount, 
        fromCurrency, 
        toCurrency
      );
    } catch (error) {
      console.error('[useCurrency] Error during currency conversion:', error);
      // В случае ошибки возвращаем исходную сумму
      return {
        convertedAmount: amount,
        appliedRate: 1,
        feeAmount: 0
      };
    }
  };

  /**
   * Форматирует сумму по правилам указанной валюты
   */
  const formatAmountForCurrency = (amount: number, currencyCode: string): string => {
    try {
      return currencyStore.formatCurrency(amount, currencyCode);
    } catch (error) {
      console.error('[useCurrency] Error formatting amount:', error);
      return amount.toString();
    }
  };

  /**
   * Вычисляемое свойство для отображения конвертированной суммы
   */
  const convertedAmount: ComputedRef<string> = computed(() => {
    if (!isTransferWithDifferentCurrencies.value) return amount.value;
    
    // Получаем исходную сумму как число
    const sourceAmount = parseFloat(amount.value);
    if (isNaN(sourceAmount) || sourceAmount === 0) return '0';
    
    // Получаем коды валют
    const sourceCurrency = getAccountCurrencyCode(selectedAccount.value);
    const destCurrency = getAccountCurrencyCode(destinationAccount.value);
    
    // Конвертируем сумму
    const result = convertCurrencyAmount(sourceAmount, sourceCurrency, destCurrency);
    
    // Получаем информацию о валюте назначения для форматирования
    const destCurrencyObj = currencyStore.getCurrency(destCurrency);
    if (!destCurrencyObj) return result.convertedAmount.toString();
    
    // Форматируем согласно правилам валюты
    try {
      // Используем Intl.NumberFormat для локализованного форматирования
      const formatter = new Intl.NumberFormat(undefined, {
        minimumFractionDigits: destCurrencyObj.decimalPlaces,
        maximumFractionDigits: destCurrencyObj.decimalPlaces,
        useGrouping: true,
        // Используем разделители, указанные в объекте валюты, если они есть
        ...(destCurrencyObj.groupSeparator && {
          // Нужно использовать locale, совместимый с указанными разделителями
          // Но поскольку это сложно, оставляем default, а шаблонизируем потом вручную
        })
      });
      
      const formatted = formatter.format(result.convertedAmount);
      
      // Если у валюты указаны нестандартные разделители, заменяем их вручную
      if (destCurrencyObj.groupSeparator && destCurrencyObj.groupSeparator !== ',') {
        const defaultSeparator = ',';
        return formatted.replace(new RegExp(defaultSeparator, 'g'), destCurrencyObj.groupSeparator);
      }
      
      if (destCurrencyObj.decimalSeparator && destCurrencyObj.decimalSeparator !== '.') {
        const defaultDecimalSep = '.';
        return formatted.replace(defaultDecimalSep, destCurrencyObj.decimalSeparator);
      }
      
      return formatted;
    } catch (error) {
      console.error('[useCurrency] Error formatting converted amount:', error);
      return result.convertedAmount.toString();
    }
  });

  /**
   * Получает курс обмена между двумя валютами
   */
  const getExchangeRate = (fromCurrency: string, toCurrency: string): number => {
    return currencyStore.getExchangeRate(fromCurrency, toCurrency);
  };

  /**
   * Инициализирует хранилище валют, если необходимо
   */
  const initCurrencyStore = async () => {
    if (currencyStore.init && !currencyStore.exchangeRates.length) {
      await currencyStore.init();
    }
  };

  return {
    sourceCurrencySymbol,
    destinationCurrencySymbol,
    hasDifferentCurrencies,
    isTransferWithDifferentCurrencies,
    convertedAmount,
    getAccountCurrencyCode,
    convertCurrencyAmount,
    formatAmountForCurrency,
    getExchangeRate,
    initCurrencyStore
  };
}