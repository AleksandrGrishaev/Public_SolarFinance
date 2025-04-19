// src/views/book/page/composables/useBookContext.ts
import { ref, computed, provide, inject, type InjectionKey, type Ref } from 'vue';
import type { ComputedRef } from 'vue';
import { useBookStore } from '@/stores/book';
import { useUserStore } from '@/stores/user';
import { useTransactionStore } from '@/stores/transaction';
import { useCurrencyStore } from '@/stores/currency';
import type { Book } from '@/stores/book/types';
import type { Transaction } from '@/stores/transaction/types';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from 'date-fns';

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

// Вспомогательная функция для нормализации даты
const normalizeDate = (date: Date | string | undefined): Date => {
  if (!date) return new Date();
  return typeof date === 'string' ? parseISO(date) : new Date(date);
};

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
    if (isAllBooks.value) {
      console.log('[useBookContext] hasDistributionRules: false (All books selected)');
      return false;
    }
    
    const book = currentBook.value;
    
    // Проверяем, есть ли книга и есть ли у неё непустой массив правил распределения с минимум 2 элементами
    const result = !!(book && 
                     book.distributionRules && 
                     Array.isArray(book.distributionRules) && 
                     book.distributionRules.length >= 2);
    
    console.log('[useBookContext] hasDistributionRules check for book:', book?.name);
    console.log('[useBookContext] distributionRules:', book?.distributionRules ? 
      `Array with ${book.distributionRules.length} items` : 'undefined or empty');
    console.log('[useBookContext] hasDistributionRules result:', result);
    
    return result;
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
    console.log('[useBookContext] Setting date filter:', filter);
    
    // Нормализуем даты перед установкой в фильтр
    const normalizedFilter: DateFilterValue = {
      period: filter.period
    };
    
    if (filter.period === 'daily' && filter.dateRange) {
      // Нормализуем и устанавливаем правильные начало и конец дня для диапазона
      const start = startOfDay(normalizeDate(filter.dateRange[0]));
      const end = endOfDay(normalizeDate(filter.dateRange[1]));
      
      normalizedFilter.dateRange = [start, end];
      normalizedFilter.dateFrom = start;
      normalizedFilter.dateTo = end;
    } else if (filter.date) {
      const date = normalizeDate(filter.date);
      
      if (filter.period === 'monthly') {
        // Устанавливаем первый день месяца
        normalizedFilter.date = startOfMonth(date);
      } else if (filter.period === 'yearly') {
        // Устанавливаем первый день года
        normalizedFilter.date = startOfYear(date);
      } else {
        normalizedFilter.date = date;
      }
    }
    
    // Обновляем фильтр и обновляем данные
    dateFilter.value = normalizedFilter;
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
      // Используем dateFrom и dateTo, которые уже установлены в setDateFilter
      filters.dateFrom = dateFilter.value.dateFrom || startOfDay(dateFilter.value.dateRange[0]);
      filters.dateTo = dateFilter.value.dateTo || endOfDay(dateFilter.value.dateRange[1]);
    } else if (dateFilter.value.date) {
      const selectedDate = normalizeDate(dateFilter.value.date);
      
      if (dateFilter.value.period === 'monthly') {
        // Первый и последний день месяца с использованием date-fns
        filters.dateFrom = startOfMonth(selectedDate);
        filters.dateTo = endOfMonth(selectedDate);
      } else if (dateFilter.value.period === 'yearly') {
        // Весь год с использованием date-fns
        filters.dateFrom = startOfYear(selectedDate);
        filters.dateTo = endOfYear(selectedDate);
      }
    }
    
    console.log('[useBookContext] Applying filters:', filters);
    
    // Применяем фильтры к хранилищу транзакций
    transactionStore.resetFilters();
    transactionStore.setFilters(filters);
  };
  
  // Получение отфильтрованных транзакций
  const getFilteredTransactions = () => {
    const transactions = transactionStore.filteredTransactions;
    console.log(`[useBookContext] Got ${transactions.length} filtered transactions`);
    return transactions;
  };
  
  // Расчет финансовых данных книги
// Модифицированная функция getBookFinancialData в useBookContext.ts
const getBookFinancialData = (): BookFinancialData => {
  console.log('[useBookContext] Calculating financial data...');
  console.log('[useBookContext] Selected book IDs:', selectedBookIds.value);
  console.log('[useBookContext] isAllBooks:', isAllBooks.value);
  console.log('[useBookContext] Current book details:', 
    currentBook.value ? {
      id: currentBook.value.id,
      name: currentBook.value.name,
      currency: currentBook.value.currency,
      distributionRules: currentBook.value.distributionRules?.length || 0
    } : 'null');
  
  let incomeAmount = 0;
  let expenseAmount = 0;
  
  const transactions = getFilteredTransactions();
  console.log(`[useBookContext] Processing ${transactions.length} transactions for financial data`);
  
  // Получаем валюту книги или пользователя, если выбрано несколько книг
  // Явно проверяем currentBook.value и его свойства
  const bookCurrency = currentBook.value?.currency;
  const userBaseCurrency = userStore.currentUser?.settings?.baseCurrency || currencyStore.userBaseCurrency;
  const currency = bookCurrency || userBaseCurrency;
  
  console.log(`[useBookContext] Selected book currency: ${bookCurrency}`);
  console.log(`[useBookContext] User base currency: ${userBaseCurrency}`);
  console.log(`[useBookContext] Using currency for calculations: ${currency}`);
  
  // Если выбрано несколько книг, возможно с разными валютами
  const useUserCurrency = isAllBooks.value || selectedBookIds.value.length > 1;
  console.log(`[useBookContext] Using user currency for conversions: ${useUserCurrency}`);
  
  transactions.forEach(transaction => {
    // Используем bookAmount вместо amount для расчетов
    let transactionAmount = transaction.bookAmount || transaction.amount;
    
    // Если выбрано несколько книг с разными валютами, конвертируем в валюту пользователя
    if (useUserCurrency && transaction.bookCurrency !== currency) {
      console.log(`[useBookContext] Converting transaction ${transaction.id} from ${transaction.bookCurrency} to ${currency}`);
      const conversionResult = currencyStore.convertAmount(
        transactionAmount,
        transaction.bookCurrency || transaction.currency,
        currency
      );
      transactionAmount = conversionResult.convertedAmount;
      console.log(`[useBookContext] Converted amount: ${transactionAmount} ${currency}`);
    }
    
    if (transaction.type === 'income') {
      incomeAmount += transactionAmount;
    } else if (transaction.type === 'expense') {
      expenseAmount += transactionAmount;
    }
  });
  
  console.log(`[useBookContext] Calculated totals - Income: ${incomeAmount}, Expense: ${expenseAmount}, Currency: ${currency}`);
  
  // При возврате данных добавим отладку
  const result = {
    name: currentBook.value?.name || 'All Books',
    incomeAmount,
    expenseAmount,
    totalAmount: incomeAmount + expenseAmount,
    distributionRules: currentBook.value?.distributionRules || [],
    currency
  };
  
  console.log('[useBookContext] Returning financial data:', {
    name: result.name,
    currency: result.currency,
    incomeAmount: result.incomeAmount,
    expenseAmount: result.expenseAmount,
    totalAmount: result.totalAmount,
    distributionRules: result.distributionRules?.length || 0
  });
  
  return result;
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