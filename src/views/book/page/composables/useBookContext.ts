// src/views/book/page/composables/useBookContext.ts
import { ref, computed, provide, inject, type InjectionKey, type Ref } from 'vue';
import type { ComputedRef } from 'vue';
import { useBookStore } from '@/stores/book';
import { useUserStore } from '@/stores/user';
import { useTransactionStore } from '@/stores/transaction';
import { useCurrencyStore } from '@/stores/currency';
import type { Book } from '@/stores/book/types';
import type { Transaction } from '@/stores/transaction/types';

// Типы для контекста
interface DateFilterValue {
  period: 'daily' | 'monthly' | 'yearly';
  date?: Date;
  dateRange?: [Date, Date];
  dateFrom?: Date;
  dateTo?: Date;
}

interface BookFinancialData {
  name: string;
  incomeAmount: number;
  expenseAmount: number;
  totalAmount: number;
  distributionRules: any[];
  currency: string;
}

// Определение типа контекста
export interface BookContext {
  // Состояние
  selectedBookIds: Ref<string[]>;
  dateFilter: Ref<DateFilterValue>;
  isLoading: Ref<boolean>;
  
  // Вычисляемые свойства
  currentBook: ComputedRef<Book | null>;
  isAllBooks: ComputedRef<boolean>;
  hasDistributionRules: ComputedRef<boolean>;
  
  // Методы
  selectBook: (bookId: string) => void;
  selectMultipleBooks: (bookIds: string[]) => void;
  setDateFilter: (filter: DateFilterValue) => void;
  refreshData: () => Promise<void>;
  getFilteredTransactions: () => Transaction[];
  getBookFinancialData: () => BookFinancialData;
}

// Создаем символ для инъекции
export const BookContextKey: InjectionKey<BookContext> = Symbol('BookContext');

// Основной composable
export function useBookContextProvider() {
    console.log('[useBookContext] Creating context provider');

  // Инициализация хранилищ
  const bookStore = useBookStore();
  const userStore = useUserStore();
  const transactionStore = useTransactionStore();
  const currencyStore = useCurrencyStore();
  
  // Состояние
  const selectedBookIds = ref<string[]>(['family']); // Выбор по умолчанию
  const dateFilter = ref<DateFilterValue>({
    period: 'monthly',
    date: new Date()
  });
  const isLoading = ref(false);
  
  // Инициализация данных
  const initStores = async () => {
    console.log('[useBookContext] Stores initialized, selected book ID:', selectedBookIds.value[0]);
    console.log('[useBookContext] Current book:', currentBook.value?.name || 'None');
    isLoading.value = true;
    try {
      // Инициализируем все необходимые хранилища
      if (!userStore.isInitialized) await userStore.init();
      if (!bookStore.isInitialized) await bookStore.init();
      if (!transactionStore.isInitialized) await transactionStore.init();
      if (!currencyStore.currencies.length) await currencyStore.init();
    } catch (error) {
      console.error('[useBookContext] Error initializing stores:', error);
    } finally {
      isLoading.value = false;
    }
  };
  
  // Вычисляемые свойства
  const currentBook = computed(() => {
    if (selectedBookIds.value.length === 0) return null;
    if (selectedBookIds.value[0] === 'all') return null;
    return bookStore.getBookById(selectedBookIds.value[0]);
  });
  
  const isAllBooks = computed(() => {
    return selectedBookIds.value.includes('all');
  });
  
  const hasDistributionRules = computed(() => {
    if (isAllBooks.value) return false;
    
    const book = currentBook.value;
    return !!(book && book.distributionRules && book.distributionRules.length >= 2);
  });
  
  // Методы выбора книги
  const selectBook = (bookId: string) => {
    console.log(`[useBookContext] Selecting book: ${bookId}`);

    selectedBookIds.value = [bookId];
    refreshData();
  };
  
  const selectMultipleBooks = (bookIds: string[]) => {
    selectedBookIds.value = bookIds;
    refreshData();
  };
  
  // Методы управления фильтром дат
  const setDateFilter = (filter: DateFilterValue) => {
    dateFilter.value = filter;
    refreshData();
  };
  
  // Получение данных
  const refreshData = async () => {
    console.log('[useBookContext] Refreshing data...');
    isLoading.value = true;
    try {
      await bookStore.refreshBooks();
      await transactionStore.refreshTransactions();
      
      // Применяем фильтры к транзакциям
      applyTransactionFilters();
      console.log('[useBookContext] Data refreshed successfully');
    } catch (error) {
      console.error('[useBookContext] Error refreshing data:', error);
    } finally {
      isLoading.value = false;
    }
  };
  
  // Применение фильтров к хранилищу транзакций
  const applyTransactionFilters = () => {
    const filters: any = {};
    
    // Фильтр по книге
    if (isAllBooks.value) {
      filters.bookIds = bookStore.userAccessibleBooks.map(book => book.id);
    } else {
      filters.bookIds = selectedBookIds.value;
    }
    
    // Фильтр по дате
    if (dateFilter.value.period === 'daily' && dateFilter.value.dateRange) {
      filters.dateFrom = dateFilter.value.dateRange[0];
      filters.dateTo = dateFilter.value.dateRange[1];
    } else if (dateFilter.value.date) {
      const selectedDate = new Date(dateFilter.value.date);
      
      if (dateFilter.value.period === 'monthly') {
        // Первый и последний день месяца
        const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        
        filters.dateFrom = startDate;
        filters.dateTo = endDate;
      } else if (dateFilter.value.period === 'yearly') {
        // Весь год
        const startDate = new Date(selectedDate.getFullYear(), 0, 1);
        const endDate = new Date(selectedDate.getFullYear(), 11, 31);
        
        filters.dateFrom = startDate;
        filters.dateTo = endDate;
      }
    }
    
    // Применяем фильтры к хранилищу транзакций
    transactionStore.resetFilters();
    transactionStore.setFilters(filters);
  };
  
  // Получение отфильтрованных транзакций
  const getFilteredTransactions = () => {
    return transactionStore.filteredTransactions;
  };
  
  // Расчет финансовых данных книги
  const getBookFinancialData = (): BookFinancialData => {
    // Логика перенесена из useBookData для финансовых расчетов
    let incomeAmount = 0;
    let expenseAmount = 0;
    
    const transactions = getFilteredTransactions();
    const currency = currentBook.value?.currency || currencyStore.userBaseCurrency;
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        incomeAmount += transaction.amount;
      } else if (transaction.type === 'expense') {
        expenseAmount += transaction.amount;
      }
    });
    
    return {
      name: currentBook.value?.name || 'All Books',
      incomeAmount,
      expenseAmount,
      totalAmount: incomeAmount + expenseAmount,
      distributionRules: currentBook.value?.distributionRules || [],
      currency
    };
  };
  
  // Создаем объект контекста
  const context: BookContext = {
    // Состояние
    selectedBookIds,
    dateFilter,
    isLoading,
    
    // Вычисляемые свойства
    currentBook,
    isAllBooks,
    hasDistributionRules,
    
    // Методы
    selectBook,
    selectMultipleBooks,
    setDateFilter,
    refreshData,
    getFilteredTransactions,
    getBookFinancialData
  };
  
  // Предоставляем контекст дочерним компонентам
  provide(BookContextKey, context);
  
  // Инициализируем хранилища при создании
  initStores();
  
  return context;
}

// Используйте эту функцию для доступа к контексту в дочерних компонентах
export function useBookContext() {
  const context = inject(BookContextKey);
  
  if (!context) {
    throw new Error('useBookContext должен использоваться внутри компонента с useBookContextProvider');
  }
  
  return context;
}