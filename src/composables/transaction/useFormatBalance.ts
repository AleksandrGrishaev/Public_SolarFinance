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
   * Format a balance with appropriate suffixes (K, M, B) based on size
   * @param amount - The amount to format
   * @param maxLength - Maximum length of the formatted number (not including suffix)
   * @param currencyCode - Currency code for symbol retrieval
   * @param symbol - Optional currency symbol (overrides currencyCode)
   */
  const formatBalance = (
    amount: number | undefined | null,
    maxLength: number = 5,
    currencyCode?: string,
    symbol?: string
  ): string => {
    // Handle empty values
    if (amount === undefined || amount === null) return '';
    
    // Get the currency symbol
    let currencySymbol = symbol;
    if (!currencySymbol && currencyCode) {
      currencySymbol = getCurrencySymbol(currencyCode);
    }
    
    // Default symbol if none provided
    if (!currencySymbol) {
      currencySymbol = '$';
    }
    
    // Format with suffix based on magnitude
    let formattedAmount = '';
    const absAmount = Math.abs(amount);
    
    if (absAmount >= 1_000_000_000) {
      // Billions
      formattedAmount = (amount / 1_000_000_000).toFixed(1) + 'B';
    } else if (absAmount >= 1_000_000) {
      // Millions
      formattedAmount = (amount / 1_000_000).toFixed(1) + 'M';
    } else if (absAmount >= 1_000) {
      // Thousands
      formattedAmount = (amount / 1_000).toFixed(1) + 'K';
    } else {
      // Regular number
      formattedAmount = amount.toString();
    }
    
    // Remove trailing zeros after decimal point
    formattedAmount = formattedAmount.replace(/\.0([KMB]?)$/, '$1');
    
    // Truncate if the number part exceeds maxLength
    const parts = formattedAmount.split(/([KMB])$/);
    const numberPart = parts[0];
    const suffix = parts[1] || '';
    
    if (numberPart.length > maxLength) {
      const truncated = numberPart.substring(0, maxLength);
      formattedAmount = `${truncated}${suffix}`;
    }
    
    // Return formatted string with currency symbol
    return `${currencySymbol} ${formattedAmount}`;
  };
  
  /**
   * Format account balance with currency symbol
   */
  const formatAccountBalance = (account: any, maxLength: number = 5): string => {
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
      maxLength,
      account.currency,
      account.symbol
    );
  };
  
  return {
    getCurrencySymbol,
    formatBalance,
    formatAccountBalance
  };
}