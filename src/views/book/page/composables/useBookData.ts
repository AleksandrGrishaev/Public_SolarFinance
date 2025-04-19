// src/views/book/page/composables/useBookData.ts
import { ref, computed, watch, toRef } from 'vue';
import { useBookStore } from '@/stores/book';
import { useUserStore } from '@/stores/user';
import { useTransactionStore } from '@/stores/transaction';
import { useCurrencyStore } from '@/stores/currency';
import type { Transaction } from '@/stores/transaction/types';

export default function useBookData(bookIdProp: string, emit: any) {
  // Превращаем bookId в реактивную ссылку для отслеживания изменений
  const bookId = toRef(bookIdProp);
  
  // Хранилища
  const bookStore = useBookStore();
  const userStore = useUserStore();
  const transactionStore = useTransactionStore();
  const currencyStore = useCurrencyStore();
  
  // Состояние
  const isLoading = ref(true);
  const dateFilter = ref({
    period: 'monthly',
    date: new Date(),
    dateRange: [
      new Date(new Date().setDate(new Date().getDate() - 7)), 
      new Date()
    ]
  });
  
  // Проверяем, является ли выбранная книга опцией "All"
  const isAllBooks = computed(() => {
    return bookId.value === 'all';
  });
  
  // Получаем список ID книг для фильтрации
  const bookIdsForFilter = computed(() => {
    // Если выбрана опция "All", используем все доступные пользователю книги
    if (isAllBooks.value) {
      return bookStore.userAccessibleBooks.map(book => book.id);
    }
    
    // Иначе используем только ID выбранной книги
    return [bookId.value];
  });
  
  // Определяем целевую валюту для отображения
  const targetCurrency = computed(() => {
    // Если выбрана опция "All", используем базовую валюту пользователя
    if (isAllBooks.value) {
      return currencyStore.userBaseCurrency;
    }
    
    // Иначе используем валюту выбранной книги
    const book = bookStore.getBookById(bookId.value);
    return book?.currency || currencyStore.userBaseCurrency;
  });
  
  // Отфильтрованные транзакции на основе текущих фильтров
  const filteredTransactions = computed(() => {
    if (isLoading.value) return [];
    
    try {
      // Создаем фильтры для транзакций
      const filters: any = {
        bookIds: bookIdsForFilter.value
      };
      
      // Применяем фильтр по дате в зависимости от выбранного периода
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
      
      // Устанавливаем фильтры в хранилище транзакций
      transactionStore.setFilters(filters);
      
      return transactionStore.filteredTransactions;
    } catch (error) {
      console.error('[useBookData] Error filtering transactions:', error);
      return [];
    }
  });
  
  /**
   * Получение суммы транзакции в целевой валюте
   * Приоритет:
   * 1. bookAmount если доступен и в нужной валюте
   * 2. Конвертация из валюты транзакции в целевую
   */
  const getTransactionAmount = (transaction: Transaction, currency: string): number => {
    // Проверка существования транзакции
    if (!transaction) return 0;
    
    try {
      // 1. Используем bookAmount, если он уже в целевой валюте (для конкретной книги)
      if (!isAllBooks.value && 
          transaction.bookAmount !== undefined && 
          transaction.bookCurrency === currency) {
        return transaction.bookAmount;
      }
      
      // 2. Если валюты разные, выполняем конвертацию
      if (transaction.currency !== currency) {
        const rate = currencyStore.getExchangeRate(transaction.currency, currency);
        return transaction.amount * rate;
      }
      
      // 3. Если валюты совпадают, просто возвращаем сумму
      return transaction.amount;
    } catch (error) {
      console.error('[useBookData] Error getting transaction amount:', error);
      return 0;
    }
  };
  
  // Получаем данные книги или сводную информацию по всем книгам
  const bookData = computed(() => {
    if (isLoading.value) {
      return {
        name: bookId.value === 'all' ? 'All Books' : 'Loading...',
        incomeAmount: 0,
        expenseAmount: 0,
        totalAmount: 0,
        distributionRules: [],
        currency: targetCurrency.value
      };
    }
    
    try {
      // Инициализируем суммы
      let incomeAmount = 0;
      let expenseAmount = 0;
      
      // Обрабатываем транзакции с учетом конвертации валют
      filteredTransactions.value.forEach(transaction => {
        // Определяем сумму в целевой валюте
        const amountInTargetCurrency = getTransactionAmount(transaction, targetCurrency.value);
        
        // Суммируем приходы и расходы
        if (transaction.type === 'income') {
          incomeAmount += amountInTargetCurrency;
        } else if (transaction.type === 'expense') {
          expenseAmount += amountInTargetCurrency;
        }
      });
      
      // Рассчитываем общую сумму
      const totalAmount = incomeAmount + expenseAmount;
      
      // Для режима "All Books"
      if (isAllBooks.value) {
        // Получаем список книг для формирования обобщенных правил распределения
        const booksWithRules = bookStore.userAccessibleBooks.filter(b => 
          b.distributionRules && b.distributionRules.length > 1
        );
        
        // Берем правила распределения из первой книги с правилами (упрощение)
        const distributionRules = booksWithRules.length > 0 ? booksWithRules[0].distributionRules : [];
        
        return {
          name: "All Books",
          incomeAmount,
          expenseAmount,
          totalAmount,
          distributionRules: distributionRules || [],
          currency: targetCurrency.value
        };
      }
      
      // Для конкретной книги
      const book = bookStore.getBookById(bookId.value);
      
      if (!book) {
        return {
          name: 'Unknown Book',
          incomeAmount: 0,
          expenseAmount: 0,
          totalAmount: 0,
          distributionRules: [],
          currency: targetCurrency.value
        };
      }
      
      return {
        name: book.name,
        incomeAmount,
        expenseAmount,
        totalAmount,
        distributionRules: book.distributionRules || [],
        currency: book.currency || targetCurrency.value
      };
    } catch (error) {
      console.error('[useBookData] Error calculating book data:', error);
      return {
        name: 'Error',
        incomeAmount: 0,
        expenseAmount: 0,
        totalAmount: 0,
        distributionRules: [],
        currency: targetCurrency.value
      };
    }
  });
  
  // Обработчики событий
  const onCalendarVisibilityChange = (isVisible) => {
    // Возможность дополнительной логики при изменении видимости календаря
  };
  
  // Отслеживаем изменения фильтра даты
  watch(dateFilter, (newValue) => {
    emit('update:dateFilter', newValue);
  }, { deep: true });
  
  // Отслеживаем изменения bookId для обновления расчетов
  watch(bookId, (newBookId) => {
    console.log(`[useBookData] Book ID changed to: ${newBookId}`);
    isLoading.value = true;
    
    // Сбрасываем фильтр даты на текущий месяц
    dateFilter.value = {
      period: 'monthly',
      date: new Date(),
      dateRange: [
        new Date(new Date().setDate(new Date().getDate() - 7)), 
        new Date()
      ]
    };
    
    // Выполняем принудительное обновление транзакций
    transactionStore.refreshTransactions()
      .then(() => {
        isLoading.value = false;
      })
      .catch(error => {
        console.error('[useBookData] Error refreshing transactions:', error);
        isLoading.value = false;
      });
  });
  
  // Функция для принудительного обновления данных
  const refreshData = async () => {
    isLoading.value = true;
    
    try {
      console.log(`[useBookData] Manually refreshing data for book: ${bookId.value}`);
      // Обновляем данные транзакций из хранилища
      await transactionStore.refreshTransactions();
      
      // Сбрасываем и повторно применяем фильтры
      transactionStore.resetFilters();
      transactionStore.setFilters({
        bookIds: bookIdsForFilter.value,
        dateFrom: dateFilter.value.period === 'daily' ? dateFilter.value.dateRange[0] : undefined,
        dateTo: dateFilter.value.period === 'daily' ? dateFilter.value.dateRange[1] : undefined
      });
    } catch (error) {
      console.error('[useBookData] Error refreshing data:', error);
    } finally {
      isLoading.value = false;
    }
  };
  
  // Инициализация хранилищ
  const initStores = async () => {
    isLoading.value = true;
    
    try {
      // Последовательно инициализируем все необходимые хранилища
      if (!userStore.isInitialized) {
        console.log('[useBookData] Initializing user store');
        await userStore.init();
      }
      
      if (!bookStore.isInitialized) {
        console.log('[useBookData] Initializing book store');
        await bookStore.init();
      }
      
      if (!transactionStore.isInitialized) {
        console.log('[useBookData] Initializing transaction store');
        await transactionStore.init();
      }
      
      if (!currencyStore.currencies.length) {
        console.log('[useBookData] Initializing currency store');
        await currencyStore.init();
      }
      
      // Убедимся, что пользователи загружены
      if (userStore.users.length === 0) {
        console.log('[useBookData] Loading users');
        await userStore.refreshUsers();
      }
    } catch (error) {
      console.error('[useBookData] Error initializing stores:', error);
    } finally {
      isLoading.value = false;
    }
  };
  
  return {
    bookId,
    dateFilter,
    bookData,
    isAllBooks,
    targetCurrency,
    filteredTransactions,
    getTransactionAmount,
    refreshData,
    initStores,
    isLoading,
    onCalendarVisibilityChange,
    bookStore,
    userStore,
    transactionStore,
    currencyStore
  };
}