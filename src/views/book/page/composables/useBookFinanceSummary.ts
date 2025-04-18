// src/views/book/page/composables/useBookFinanceSummary.ts - модифицированная версия
import { ref, computed, watch } from 'vue';
import { useBookStore } from '@/stores/book';
import { useUserStore } from '@/stores/user';
import { useTransactionStore } from '@/stores/transaction';
import { useCurrencyStore } from '@/stores/currency';

export default function useBookFinanceSummary(bookId: string, emit: any) {
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
    return bookId === 'all';
  });
  
  // Получаем список ID книг для фильтрации
  const bookIdsForFilter = computed(() => {
    // Если выбрана опция "All", используем все доступные пользователю книги
    if (isAllBooks.value) {
      console.log('[useBookFinanceSummary] Using all accessible books for filter');
      return bookStore.userAccessibleBooks.map(book => book.id);
    }
    
    // Иначе используем только ID выбранной книги
    console.log(`[useBookFinanceSummary] Using single book ${bookId} for filter`);
    return [bookId];
  });
  
  // Отладочная информация о книге
  const debugBookInfo = computed(() => {
    // Для "All" возвращаем общую информацию
    if (isAllBooks.value) {
      return {
        id: 'all',
        name: 'All Books',
        booksCount: bookIdsForFilter.value.length,
        isAllBooks: true
      };
    }
    
    // Для конкретной книги возвращаем её данные
    const book = bookStore.getBookById(bookId);
    if (!book) return { message: 'Book not found' };
    
    return {
      id: book.id,
      name: book.name,
      type: book.type,
      currency: book.currency,
      ownersCount: book.ownerIds.length,
      hasDistributionRules: !!book.distributionRules && book.distributionRules.length > 0
    };
  });
  
  // Определяем базовую валюту для отображения
  const displayCurrency = computed(() => {
    // Если выбрана опция "All", используем базовую валюту пользователя
    if (isAllBooks.value) {
      return currencyStore.userBaseCurrency;
    }
    
    // Иначе используем валюту выбранной книги
    const book = bookStore.getBookById(bookId);
    return book?.currency || 'IDR';
  });
  
  // Отфильтрованные транзакции на основе текущих фильтров
  const filteredTransactions = computed(() => {
    console.log(`[useBookFinanceSummary] Calculating filtered transactions for ${isAllBooks.value ? 'all books' : 'book ' + bookId}`);
    
    // Создаем фильтры для транзакций
    const filters: any = {
      bookIds: bookIdsForFilter.value
    };
    
    // Применяем фильтр по дате в зависимости от выбранного периода
    if (dateFilter.value.period === 'daily' && dateFilter.value.dateRange) {
      filters.dateFrom = dateFilter.value.dateRange[0];
      filters.dateTo = dateFilter.value.dateRange[1];
      console.log(`[useBookFinanceSummary] Daily filter: ${filters.dateFrom.toISOString()} - ${filters.dateTo.toISOString()}`);
    } else if (dateFilter.value.date) {
      const selectedDate = new Date(dateFilter.value.date);
      
      if (dateFilter.value.period === 'monthly') {
        // Первый и последний день месяца
        const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        
        filters.dateFrom = startDate;
        filters.dateTo = endDate;
        console.log(`[useBookFinanceSummary] Monthly filter: ${startDate.toISOString()} - ${endDate.toISOString()}`);
      } else if (dateFilter.value.period === 'yearly') {
        // Весь год
        const startDate = new Date(selectedDate.getFullYear(), 0, 1);
        const endDate = new Date(selectedDate.getFullYear(), 11, 31);
        
        filters.dateFrom = startDate;
        filters.dateTo = endDate;
        console.log(`[useBookFinanceSummary] Yearly filter: ${startDate.toISOString()} - ${endDate.toISOString()}`);
      }
    }
    
    // Устанавливаем фильтры в хранилище транзакций
    transactionStore.setFilters(filters);
    
    const transactions = transactionStore.filteredTransactions;
    console.log(`[useBookFinanceSummary] Found ${transactions.length} transactions for ${isAllBooks.value ? 'all books' : 'book ' + bookId}`);
    
    // Отладочная информация о транзакциях
    const transactionTypeCounts = transactions.reduce((counts, t) => {
      counts[t.type] = (counts[t.type] || 0) + 1;
      return counts;
    }, {});
    
    console.log('[useBookFinanceSummary] Transaction types:', transactionTypeCounts);
    
    // Отладочная информация по книгам
    if (isAllBooks.value) {
      const bookCounts = transactions.reduce((counts, t) => {
        counts[t.bookId] = (counts[t.bookId] || 0) + 1;
        return counts;
      }, {});
      console.log('[useBookFinanceSummary] Transactions by book:', bookCounts);
    }
    
    return transactions;
  });
  
  // Детальная отладочная информация о каждой транзакции
  const debugTransactionDetails = computed(() => {
    return filteredTransactions.value.map(t => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      currency: t.currency,
      bookId: t.bookId,
      bookAmount: t.bookAmount,
      bookCurrency: t.bookCurrency,
      bookRate: t.bookRate,
      description: t.description?.substring(0, 20) + (t.description?.length > 20 ? '...' : ''),
      categoryId: t.categoryId,
      date: t.date
    }));
  });
  
  // Получаем данные книги или сводную информацию по всем книгам
  const bookData = computed(() => {
    // Если выбрана опция "All", формируем сводные данные
    if (isAllBooks.value) {
      console.log(`[useBookFinanceSummary] Calculating summary data for all books`);
      
      // Используем валюту отображения
      const currencyForDisplay = displayCurrency.value;
      console.log(`[useBookFinanceSummary] Display currency for all books: ${currencyForDisplay}`);
      
      // Инициализируем суммы
      let incomeAmount = 0;
      let expenseAmount = 0;
      
      // Отладочные счетчики
      let withPrecalculatedAmount = 0;
      let withConversionAmount = 0;
      let withDirectAmount = 0;
      
      // Обрабатываем транзакции с учетом конвертации валют
      filteredTransactions.value.forEach(transaction => {
        // Определяем сумму в валюте отображения
        let amountInDisplayCurrency;
        
        // Проверяем, есть ли уже конвертированная сумма в валюту отображения
        if (transaction.bookCurrency === currencyForDisplay && transaction.bookAmount !== undefined) {
          amountInDisplayCurrency = transaction.bookAmount;
          withPrecalculatedAmount++;
          console.log(`[useBookFinanceSummary] Using precalculated amount for transaction ${transaction.id}: ${transaction.amount} ${transaction.currency} -> ${amountInDisplayCurrency} ${currencyForDisplay}`);
        } else {
          // Иначе конвертируем сумму в валюту отображения
          if (transaction.currency !== currencyForDisplay) {
            const rate = currencyStore.getExchangeRate(transaction.currency, currencyForDisplay);
            amountInDisplayCurrency = transaction.amount * rate;
            withConversionAmount++;
            console.log(`[useBookFinanceSummary] Converting amount for transaction ${transaction.id}: ${transaction.amount} ${transaction.currency} -> ${amountInDisplayCurrency} ${currencyForDisplay} (rate: ${rate})`);
          } else {
            amountInDisplayCurrency = transaction.amount;
            withDirectAmount++;
            console.log(`[useBookFinanceSummary] Using direct amount for transaction ${transaction.id}: ${transaction.amount} ${transaction.currency}`);
          }
        }
        
        // Суммируем приходы и расходы
        if (transaction.type === 'income') {
          incomeAmount += amountInDisplayCurrency;
          console.log(`[useBookFinanceSummary] Adding income: ${amountInDisplayCurrency} ${currencyForDisplay} from transaction ${transaction.id}`);
        } else if (transaction.type === 'expense') {
          expenseAmount += amountInDisplayCurrency;
          console.log(`[useBookFinanceSummary] Adding expense: ${amountInDisplayCurrency} ${currencyForDisplay} from transaction ${transaction.id}`);
        }
      });
      
      // Рассчитываем общую сумму
      const totalAmount = incomeAmount + expenseAmount;
      
      console.log(`[useBookFinanceSummary] All books summary: Income=${incomeAmount}, Expense=${expenseAmount}, Total=${totalAmount}, Currency=${currencyForDisplay}`);
      console.log(`[useBookFinanceSummary] Amount sources: Precalculated=${withPrecalculatedAmount}, Converted=${withConversionAmount}, Direct=${withDirectAmount}`);
      
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
        currency: currencyForDisplay,
        // Добавляем отладочную информацию
        debug: {
          withPrecalculatedAmount,
          withConversionAmount,
          withDirectAmount,
          transactionsCount: filteredTransactions.value.length,
          isAllBooks: true,
          booksIncluded: bookIdsForFilter.value
        }
      };
    }
    
    // Для конкретной книги
    console.log(`[useBookFinanceSummary] Calculating book data for ${bookId}`);
    
    const book = bookStore.getBookById(bookId);
    
    if (!book) {
      console.warn(`[useBookFinanceSummary] Book with id ${bookId} not found`);
      return {
        name: 'Unknown Book',
        incomeAmount: 0,
        expenseAmount: 0,
        totalAmount: 0,
        distributionRules: [],
        currency: 'IDR'
      };
    }
    
    // Получаем валюту книги
    const bookCurrency = book.currency || 'IDR';
    console.log(`[useBookFinanceSummary] Book currency: ${bookCurrency}`);
    
    // Инициализируем суммы
    let incomeAmount = 0;
    let expenseAmount = 0;
    
    // Отладочные счетчики
    let withPrecalculatedAmount = 0;
    let withConversionAmount = 0;
    let withDirectAmount = 0;
    
    // Обрабатываем транзакции с учетом конвертации валют
    filteredTransactions.value.forEach(transaction => {
      // Определяем сумму в валюте книги
      let amountInBookCurrency;
      
      // Если есть предварительно рассчитанная сумма в валюте книги, используем её
      if (transaction.bookAmount !== undefined && transaction.bookCurrency === bookCurrency) {
        amountInBookCurrency = transaction.bookAmount;
        withPrecalculatedAmount++;
        console.log(`[useBookFinanceSummary] Using precalculated amount for transaction ${transaction.id}: ${transaction.amount} ${transaction.currency} -> ${amountInBookCurrency} ${bookCurrency}`);
      } else {
        // Иначе выполняем конвертацию
        if (transaction.currency !== bookCurrency) {
          const rate = currencyStore.getExchangeRate(transaction.currency, bookCurrency);
          amountInBookCurrency = transaction.amount * rate;
          withConversionAmount++;
          console.log(`[useBookFinanceSummary] Converting amount for transaction ${transaction.id}: ${transaction.amount} ${transaction.currency} -> ${amountInBookCurrency} ${bookCurrency} (rate: ${rate})`);
        } else {
          amountInBookCurrency = transaction.amount;
          withDirectAmount++;
          console.log(`[useBookFinanceSummary] Using direct amount for transaction ${transaction.id}: ${transaction.amount} ${transaction.currency}`);
        }
      }
      
      // Суммируем приходы и расходы
      if (transaction.type === 'income') {
        incomeAmount += amountInBookCurrency;
        console.log(`[useBookFinanceSummary] Adding income: ${amountInBookCurrency} ${bookCurrency} from transaction ${transaction.id}`);
      } else if (transaction.type === 'expense') {
        expenseAmount += amountInBookCurrency;
        console.log(`[useBookFinanceSummary] Adding expense: ${amountInBookCurrency} ${bookCurrency} from transaction ${transaction.id}`);
      }
    });
    
    // Рассчитываем общую сумму
    const totalAmount = incomeAmount + expenseAmount;
    
    console.log(`[useBookFinanceSummary] Book summary: Income=${incomeAmount}, Expense=${expenseAmount}, Total=${totalAmount}, Currency=${bookCurrency}`);
    console.log(`[useBookFinanceSummary] Amount sources: Precalculated=${withPrecalculatedAmount}, Converted=${withConversionAmount}, Direct=${withDirectAmount}`);
    
    return {
      name: book.name,
      incomeAmount,
      expenseAmount,
      totalAmount,
      distributionRules: book.distributionRules || [],
      currency: bookCurrency,
      // Добавляем отладочную информацию
      debug: {
        withPrecalculatedAmount,
        withConversionAmount,
        withDirectAmount,
        transactionsCount: filteredTransactions.value.length
      }
    };
  });
  
  // Инициализация данных владельцев для слайдера
  const ownerSides = computed(() => {
    console.log(`[useBookFinanceSummary] Calculating owner sides for ${isAllBooks.value ? 'all books' : 'book ' + bookId}`);
    
    if (!bookData.value.distributionRules || bookData.value.distributionRules.length < 2) {
      console.log('[useBookFinanceSummary] No distribution rules found, using default owners');
      return [
        { name: 'Alex', id: 'me' },
        { name: 'Sasha Solar', id: 'other' }
      ];
    }
    
    const owners = bookData.value.distributionRules.map(rule => {
      const user = userStore.getAllUsers().find(user => user.id === rule.ownerId);
      console.log(`[useBookFinanceSummary] Found user for rule: ${user?.name || 'Unknown'} (${rule.ownerId}) - ${rule.percentage}%`);
      return {
        name: user ? user.name : 'Unknown',
        id: rule.ownerId,
        percentage: rule.percentage
      };
    });
    
    console.log('[useBookFinanceSummary] Owner sides:', owners);
    return owners;
  });
  
  // Устанавливаем начальное распределение согласно правилам книги
  watch(() => bookData.value.distributionRules, (rules) => {
    if (rules && rules.length >= 2) {
      ownerDistribution.value = rules[0].percentage;
      console.log(`[useBookFinanceSummary] Set initial distribution to ${ownerDistribution.value}%`);
    }
  }, { immediate: true });
  
  // Форматирование суммы с учетом валюты книги или валюты отображения
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '';
    
    const currencyCode = bookData.value.currency;
    const currency = currencyStore.getCurrency(currencyCode);
    
    if (currency) {
      const formatted = currencyStore.formatCurrency(amount, currencyCode);
      console.log(`[useBookFinanceSummary] Formatted amount: ${amount} ${currencyCode} -> ${formatted}`);
      return formatted;
    }
    
    // Запасной вариант
    const fallbackFormat = `${currency?.symbol || ''} ${Math.abs(amount).toLocaleString()}`;
    console.warn(`[useBookFinanceSummary] Using fallback formatting for ${amount} ${currencyCode} -> ${fallbackFormat}`);
    return fallbackFormat;
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
    
    const amount = totalAmount * (percentage / 100);
    console.log(`[useBookFinanceSummary] Calculated participant amount for index ${index}: ${amount} (${percentage}% of ${totalAmount})`);
    return amount;
  };
  
  // Обновление значения слайдера
  const updateOwnerDistribution = (event) => {
    ownerDistribution.value = parseInt(event.target.value);
    console.log(`[useBookFinanceSummary] Updated distribution to ${ownerDistribution.value}%`);
  };
  
  // Обработчики событий
  const onCalendarVisibilityChange = (isVisible) => {
    console.log(`[useBookFinanceSummary] Calendar visibility changed: ${isVisible}`);
  };
  
  // Отслеживаем изменения фильтра даты
  watch(dateFilter, (newValue) => {
    console.log(`[useBookFinanceSummary] Date filter changed: period=${newValue.period}`);
    emit('update:dateFilter', newValue);
  }, { deep: true });
  
  // Инициализация хранилищ
  const initStores = async () => {
    console.log('[useBookFinanceSummary] Initializing stores...');
    
    if (!bookStore.isInitialized) {
      console.log('[useBookFinanceSummary] Initializing book store...');
      await bookStore.init();
    }
    
    if (!userStore.isInitialized) {
      console.log('[useBookFinanceSummary] Initializing user store...');
      await userStore.init();
    }
    
    if (!transactionStore.isInitialized) {
      console.log('[useBookFinanceSummary] Initializing transaction store...');
      await transactionStore.init();
    }
    
    if (!currencyStore.currencies.length) {
      console.log('[useBookFinanceSummary] Initializing currency store...');
      await currencyStore.init();
    }
    
    console.log('[useBookFinanceSummary] All stores initialized successfully');
    
    // Отладочная информация
    const books = bookStore.books.map(b => ({ id: b.id, name: b.name, currency: b.currency }));
    console.log('[useBookFinanceSummary] Available books:', books);
    
    const currencies = currencyStore.currencies.map(c => ({ code: c.code, symbol: c.symbol }));
    console.log('[useBookFinanceSummary] Available currencies:', currencies);
    
    const rates = currencyStore.exchangeRates.map(r => ({ 
      from: r.fromCurrency, 
      to: r.toCurrency, 
      rate: r.rate 
    }));
    console.log('[useBookFinanceSummary] Exchange rates:', rates);
    
    const transactions = transactionStore.transactions.slice(0, 5).map(t => ({ 
      id: t.id, 
      type: t.type, 
      amount: t.amount,
      bookId: t.bookId 
    }));
    console.log('[useBookFinanceSummary] Sample transactions:', transactions);
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
    // Экспортируем отладочную информацию
    debugBookInfo,
    debugTransactionDetails,
    isAllBooks
  };
}