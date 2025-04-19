// src/composables/transaction/useFormatBalance.ts
import { useCurrencyStore } from '../../stores/currency';

export function useFormatBalance() {
  const currencyStore = useCurrencyStore();
  
  /**
   * Get currency symbol for a given currency code
   */
  const getCurrencySymbol = (currencyCode: string): string => {
    if (!currencyCode) return '$';
    
    const currency = currencyStore.getCurrency(currencyCode);
    if (currency && currency.symbol) return currency.symbol;
    
    // Fallback symbols for common currencies
    const symbolMap: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'RUB': '₽',
      'IDR': 'Rp',
      'INR': '₹',
      'CNY': '¥'
    };
    
    return symbolMap[currencyCode] || currencyCode.substring(0, 1);
  };
  
  /**
   * Helper function to format numbers with decimal places and space as thousand separator
   */
  const formatNumberWithDecimals = (
    value: number, 
    decimalPlaces: number = 0, 
    showDecimalsOnWhole: boolean = false
  ): string => {
    // Determine if the number is a whole number
    const isWholeNumber = value % 1 === 0;
    
    // If it's a whole number and we don't want to show decimals on whole numbers,
    // use 0 decimal places, otherwise use the specified amount
    const effectiveDecimalPlaces = (isWholeNumber && !showDecimalsOnWhole) ? 0 : decimalPlaces;
    
    // Format with space as thousand separator
    // Use 'ru-RU' locale which uses spaces as thousand separators
    const formatted = value.toLocaleString('ru-RU', {
      minimumFractionDigits: effectiveDecimalPlaces,
      maximumFractionDigits: effectiveDecimalPlaces
    });
    
    // Replace comma with dot for decimal separator (Russian uses comma, we want dot)
    return formatted.replace(',', '.');
  };
  
  /**
   * Format a balance with appropriate suffixes (K, M, B) based on size
   * @param amount - The amount to format
   * @param decimalPlaces - Number of decimal places to show (0 by default)
   * @param currencyCode - Currency code for symbol retrieval
   * @param options - Additional formatting options
   */
  const formatBalance = (
    amount: number | undefined | null,
    decimalPlaces: number = 0,
    currencyCode?: string,
    options: {
      symbol?: string,
      useAbbreviations?: boolean,
      minValueToAbbreviate?: number,
      symbolAfterNegative?: boolean,
      showDecimalsOnWhole?: boolean
    } = {}
  ): string => {
    // Default options
    const {
      symbol,
      useAbbreviations = true,
      minValueToAbbreviate = 1000000, // Сокращать значения от миллиона и выше по умолчанию
      symbolAfterNegative = true,
      showDecimalsOnWhole = false // Не показывать десятичные знаки для целых чисел по умолчанию
    } = options;
    
    // Handle empty values
    if (amount === undefined || amount === null) return '';
    
    // Determine if amount is negative
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    
    // Get the currency symbol
    let currencySymbol = symbol;
    if (!currencySymbol && currencyCode) {
      currencySymbol = getCurrencySymbol(currencyCode);
    }
    
    // Default symbol if none provided
    if (!currencySymbol) {
      currencySymbol = '$';
    }
    
    // Format with suffix based on magnitude if abbreviations are enabled
    let formattedAmount = '';
    
    if (useAbbreviations && absAmount >= minValueToAbbreviate) {
      if (absAmount >= 1_000_000_000) {
        // Billions
        formattedAmount = (absAmount / 1_000_000_000).toFixed(1) + 'B';
      } else if (absAmount >= 1_000_000) {
        // Millions
        formattedAmount = (absAmount / 1_000_000).toFixed(1) + 'M';
      } else {
        // Форматируем обычным способом, если не достигли порога для сокращения
        formattedAmount = formatNumberWithDecimals(absAmount, decimalPlaces, showDecimalsOnWhole);
      }
      
      // Remove trailing zeros after decimal point for abbreviations
      if (!showDecimalsOnWhole) {
        formattedAmount = formattedAmount.replace(/\.0([KMB]?)$/, '$1');
      }
    } else {
      // Format number with locale and specified decimal places
      formattedAmount = formatNumberWithDecimals(absAmount, decimalPlaces, showDecimalsOnWhole);
    }
    
    // Add space after currency symbol for better readability
    const currencyWithSpace = `${currencySymbol} `;
    
    // Apply negative sign if needed
    if (isNegative) {
      if (symbolAfterNegative) {
        // Символ валюты после знака минус
        return `-${currencyWithSpace}${formattedAmount}`;
      } else {
        // Символ валюты перед знаком минус
        return `${currencyWithSpace}-${formattedAmount}`;
      }
    } else {
      // Положительное число - символ валюты в начале
      return `${currencyWithSpace}${formattedAmount}`;
    }
  };
  
  /**
   * Format account balance with currency symbol
   */
  const formatAccountBalance = (
    account: any, 
    decimalPlaces: number = 0,
    options: {
      useAbbreviations?: boolean,
      minValueToAbbreviate?: number,
      symbolAfterNegative?: boolean,
      showDecimalsOnWhole?: boolean
    } = {}
  ): string => {
    if (!account) return '';
    
    // Используем currentBalance вместо balance
    let balance: number | undefined | null = undefined;
    
    if (account.currentBalance !== undefined && account.currentBalance !== null) {
      balance = typeof account.currentBalance === 'string' 
        ? parseFloat(account.currentBalance) 
        : account.currentBalance;
    }
    
    // Используем обычный balance как запасной вариант, если currentBalance отсутствует
    else if (account.balance !== undefined && account.balance !== null) {
      balance = typeof account.balance === 'string' 
        ? parseFloat(account.balance) 
        : account.balance;
    }
    
    return formatBalance(
      balance,
      decimalPlaces,
      account.currency,
      {
        symbol: account.symbol,
        ...options
      }
    );
  };
  
  return {
    getCurrencySymbol,
    formatBalance,
    formatAccountBalance,
    formatNumberWithDecimals
  };
}