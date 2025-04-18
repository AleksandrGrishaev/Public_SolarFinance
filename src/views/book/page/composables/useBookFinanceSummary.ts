// src/views/book/page/composables/useBookFinanceSummary.ts
import { ref, computed, watch, toRef } from 'vue';
import { useBookStore } from '@/stores/book';
import { useUserStore } from '@/stores/user';
import { useTransactionStore } from '@/stores/transaction';
import { useCurrencyStore } from '@/stores/currency';
import type { Transaction } from '@/stores/transaction/types';

export default function useBookFinanceSummary(bookIdProp: string, emit: any) {
  // Превращаем bookId в реактивную ссылку для отслеживания изменений
  const bookId = toRef(bookIdProp);
  
  // Хранилища
  const bookStore = useBookStore();
  const userStore = useUserStore();
  const transactionStore = useTransactionStore();
  const currencyStore = useCurrencyStore();
  
  // Состояние
  const ownerDistribution = ref(50); // Начальное значение слайдера (50/50)
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
  });
  
  /**
   * Получение суммы транзакции в целевой валюте
   * Приоритет:
   * 1. bookAmount если доступен и в нужной валюте
   * 2. Конвертация из валюты транзакции в целевую
   */
  const getTransactionAmount = (transaction: Transaction, currency: string): number => {
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
  };
  
  // Получаем данные книги или сводную информацию по всем книгам
  const bookData = computed(() => {
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
  });
  
  // Инициализация данных владельцев для слайдера
  const ownerSides = computed(() => {
    if (!bookData.value.distributionRules || bookData.value.distributionRules.length < 2) {
      return [
        { name: 'Alex', id: 'me' },
        { name: 'Sasha Solar', id: 'other' }
      ];
    }
    
    return bookData.value.distributionRules.map(rule => {
      const user = userStore.getAllUsers().find(user => user.id === rule.ownerId);
      return {
        name: user ? user.name : 'Unknown',
        id: rule.ownerId,
        percentage: rule.percentage
      };
    });
  });
  
  // Устанавливаем начальное распределение согласно правилам книги
  watch(() => bookData.value.distributionRules, (rules) => {
    if (rules && rules.length >= 2) {
      ownerDistribution.value = rules[0].percentage;
    }
  }, { immediate: true });
  
  // Форматирование суммы с учетом валюты
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '';
    
    const currencyCode = bookData.value.currency;
    return currencyStore.formatCurrency(amount, currencyCode);
  };
  
  // Форматирование валюты
  const formatCurrency = (value) => {
    const currencyCode = bookData.value.currency;
    return currencyStore.formatCurrency(value, currencyCode);
  };
  
  // Определение класса для общей суммы
  const getTotalClass = (amount) => {
    if (amount > 0) return 'amount-positive';
    if (amount < 0) return 'amount-negative';
    return '';
  };
  
  // Стиль для слайдера
  const getSliderStyle = () => {
    const percentage = ownerDistribution.value;
    const leftColor = '#555555';
    const rightColor = '#4F9FC8';
    
    return {
      background: `linear-gradient(to right, ${leftColor} 0%, ${leftColor} ${percentage}%, ${rightColor} ${percentage}%, ${rightColor} 100%)`
    };
  };
  
  // Стиль для участника
  const getParticipantStyle = (index) => {
    const leftColor = '#555555';
    const rightColor = '#4F9FC8';
    
    return {
      color: index === 0 ? leftColor : rightColor
    };
  };
  
  // Расчет суммы для участника
  const getParticipantAmount = (index) => {
    const totalAmount = Math.abs(bookData.value.totalAmount);
    const percentage = index === 0 ? ownerDistribution.value : 100 - ownerDistribution.value;
    
    return totalAmount * (percentage / 100);
  };
  
  // Обновление значения слайдера
  const updateOwnerDistribution = (event) => {
    ownerDistribution.value = parseInt(event.target.value);
  };
  
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
    console.log(`[useBookFinanceSummary] Book ID changed to: ${newBookId}`);
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
    transactionStore.refreshTransactions();
  });
  
  // Функция для принудительного обновления данных
  const refreshData = async () => {
    console.log(`[useBookFinanceSummary] Manually refreshing data for book: ${bookId.value}`);
    // Обновляем данные транзакций из хранилища
    await transactionStore.refreshTransactions();
    
    // Сбрасываем фильтры и применяем текущие
    transactionStore.resetFilters();
    transactionStore.setFilters({
      bookIds: bookIdsForFilter.value,
      dateFrom: dateFilter.value.period === 'daily' ? dateFilter.value.dateRange[0] : undefined,
      dateTo: dateFilter.value.period === 'daily' ? dateFilter.value.dateRange[1] : undefined
    });
  };
  
  // Инициализация хранилищ
  const initStores = async () => {
    if (!bookStore.isInitialized) {
      await bookStore.init();
    }
    
    if (!userStore.isInitialized) {
      await userStore.init();
    }
    
    if (!transactionStore.isInitialized) {
      await transactionStore.init();
    }
    
    if (!currencyStore.currencies.length) {
      await currencyStore.init();
    }
  };
  
  return {
    ownerDistribution,
    dateFilter,
    bookData,
    ownerSides,
    formatAmount,
    formatCurrency,
    getTotalClass,
    getSliderStyle,
    getParticipantStyle,
    getParticipantAmount,
    updateOwnerDistribution,
    onCalendarVisibilityChange,
    initStores,
    isAllBooks,
    refreshData
  };
}