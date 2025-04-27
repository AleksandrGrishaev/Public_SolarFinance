// src/views/debt/composables/useDebtTransactions.ts
import { ref, computed, watch, type Ref } from 'vue';
import { isWithinInterval, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

// Define transaction interface
interface Transaction {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  type: 'income' | 'expense' | 'transfer';
  description?: string;
  categoryId?: string;
  sourceEntityId?: string;
  sourceEntityType?: string;
  destinationEntityId?: string;
  destinationEntityType?: string;
  executedByOwnerId?: string;
  debtId?: string;
  bookId?: string;
}

// Define date filter type
interface DateFilter {
  period?: 'daily' | 'monthly' | 'yearly';
  date?: Date;
  dateRange?: [Date, Date];
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Composable for managing debt-related transactions
 */
export function useDebtTransactions(debtId: Ref<string>) {
  const transactions = ref<Transaction[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  // Default date filter (monthly, current month)
  const dateFilter = ref<DateFilter>({
    period: 'monthly',
    date: new Date()
  });
  
  /**
   * Load transactions for a specific debt ID
   */
  const loadTransactions = async () => {
    if (!debtId.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // In a real application, this would be an API call
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 700)); // Simulate network delay
      
      transactions.value = getMockTransactions(debtId.value);
    } catch (err) {
      console.error('Error loading debt transactions:', err);
      error.value = 'Failed to load transactions';
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Filter transactions based on the date filter
   */
  const filteredTransactions = computed(() => {
    if (!transactions.value.length) return [];
    
    const filter = dateFilter.value;
    
    if (filter.period === 'daily' && filter.dateRange) {
      // Filter by date range
      const [start, end] = filter.dateRange;
      
      return transactions.value.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return isWithinInterval(transactionDate, { start, end });
      });
    } else if (filter.period === 'monthly' && filter.date) {
      // Filter by month
      const date = new Date(filter.date);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      return transactions.value.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
      });
    } else if (filter.period === 'yearly' && filter.date) {
      // Filter by year
      const date = new Date(filter.date);
      const yearStart = startOfYear(date);
      const yearEnd = endOfYear(date);
      
      return transactions.value.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return isWithinInterval(transactionDate, { start: yearStart, end: yearEnd });
      });
    }
    
    // If no filter matches or filter is invalid, return all transactions
    return transactions.value;
  });
  
  /**
   * Update the date filter
   */
  const updateDateFilter = (newFilter: DateFilter) => {
    dateFilter.value = newFilter;
  };
  
  // Watch for changes in the debt ID and reload transactions
  watch(debtId, (newId, oldId) => {
    if (newId !== oldId) {
      loadTransactions();
    }
  });
  
  /**
   * Generate mock transactions for demo purposes
   */
  const getMockTransactions = (debtId: string): Transaction[] => {
    // Current date for relative dates
    const now = new Date();
    
    // Create dates for demonstration
    const dates = [
      // Today
      new Date(),
      // Yesterday
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
      // Last week
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
      // Two weeks ago
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14),
      // Last month
      new Date(now.getFullYear(), now.getMonth() - 1, 15),
      // Two months ago
      new Date(now.getFullYear(), now.getMonth() - 2, 10)
    ];
    
    return [
      // Recent payment
      {
        id: `tx_${debtId}_1`,
        date: dates[0],
        amount: -3500,
        currency: 'RUB',
        type: 'expense',
        description: 'Debt payment',
        categoryId: 'debt_payment',
        sourceEntityId: 'cash1',
        sourceEntityType: 'account',
        executedByOwnerId: 'user_1',
        debtId: debtId,
        bookId: 'family'
      },
      // Yesterday's transfer
      {
        id: `tx_${debtId}_2`,
        date: dates[1],
        amount: -1200,
        currency: 'RUB',
        type: 'transfer',
        description: 'Transfer to debt account',
        categoryId: 'transfer',
        sourceEntityId: 'bank1',
        sourceEntityType: 'account',
        destinationEntityId: 'debt_account',
        destinationEntityType: 'account',
        executedByOwnerId: 'user_2',
        debtId: debtId,
        bookId: 'family'
      },
      // Last week payment
      {
        id: `tx_${debtId}_3`,
        date: dates[2],
        amount: -5000,
        currency: 'RUB',
        type: 'expense',
        description: 'Monthly payment',
        categoryId: 'debt_payment',
        sourceEntityId: 'card1',
        sourceEntityType: 'account',
        executedByOwnerId: 'user_1',
        debtId: debtId,
        bookId: 'family'
      },
      // Two weeks ago adjustment
      {
        id: `tx_${debtId}_4`,
        date: dates[3],
        amount: 250,
        currency: 'RUB',
        type: 'income',
        description: 'Rate adjustment',
        categoryId: 'adjustment',
        sourceEntityId: 'system',
        sourceEntityType: 'external',
        destinationEntityId: 'debt_account',
        destinationEntityType: 'account',
        executedByOwnerId: 'system',
        debtId: debtId,
        bookId: 'family'
      },
      // Last month payment
      {
        id: `tx_${debtId}_5`,
        date: dates[4],
        amount: -4800,
        currency: 'RUB',
        type: 'expense',
        description: 'Monthly payment',
        categoryId: 'debt_payment',
        sourceEntityId: 'bank2',
        sourceEntityType: 'account',
        executedByOwnerId: 'user_2',
        debtId: debtId,
        bookId: 'family'
      },
      // Two months ago initial transaction
      {
        id: `tx_${debtId}_6`,
        date: dates[5],
        amount: 15000,
        currency: 'RUB',
        type: 'income',
        description: 'Initial debt creation',
        categoryId: 'debt_creation',
        sourceEntityId: 'system',
        sourceEntityType: 'external',
        destinationEntityId: 'debt_account',
        destinationEntityType: 'account',
        executedByOwnerId: 'system',
        debtId: debtId,
        bookId: 'family'
      }
    ];
  };
  
  return {
    transactions,
    filteredTransactions,
    isLoading,
    error,
    dateFilter,
    loadTransactions,
    updateDateFilter
  };
}