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
  const isLoading = ref(true);
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
      console.error('[useBookFinanceSummary] Error filtering transactions:', error);
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
      console.error('[useBookFinanceSummary] Error getting transaction amount:', error);
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
      console.error('[useBookFinanceSummary] Error calculating book data:', error);
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
  
  const ownerExpenseDistribution = computed(() => {
    console.log('[DEBUG] Starting ownerExpenseDistribution calculation');
    console.log('[DEBUG] isAllBooks:', isAllBooks.value);
    console.log('[DEBUG] bookData:', JSON.stringify(bookData.value));
    console.log('[DEBUG] bookData.distributionRules:', bookData.value?.distributionRules);
    
    try {
      // Если не выбрана конкретная книга или она не имеет правил распределения, возвращаем пустой результат
      if (isAllBooks.value || !bookData.value.distributionRules || bookData.value.distributionRules.length < 2) {
        console.log('[DEBUG] Early return from ownerExpenseDistribution: no valid distribution rules');
        return null;
      }
      
      // Получаем ID владельцев из правил распределения
      const ownerIds = bookData.value.distributionRules.map(rule => rule.ownerId);
      console.log('[DEBUG] Owner IDs:', ownerIds);
      
      // Инициализируем суммы для каждого владельца
      const ownerAmounts = {};
      ownerIds.forEach(id => {
        ownerAmounts[id] = 0;
      });
      console.log('[DEBUG] Initial ownerAmounts:', ownerAmounts);
      
      // Получаем отфильтрованные транзакции
      const transactions = filteredTransactions.value.filter(t => t.type === 'expense');
      console.log('[DEBUG] Filtered transactions count:', transactions.length);
      
      // Суммируем расходы по каждому владельцу с учетом правил распределения
      transactions.forEach((transaction, index) => {
        console.log(`[DEBUG] Processing transaction ${index}:`, transaction.id, transaction.amount, transaction.currency);
        
        // Если у транзакции есть свои правила распределения, используем их
        if (transaction.distributionRules && transaction.distributionRules.length > 0) {
          console.log(`[DEBUG] Transaction ${transaction.id} has custom distribution rules:`, transaction.distributionRules);
          const amount = getTransactionAmount(transaction, targetCurrency.value);
          console.log(`[DEBUG] Transaction amount in target currency:`, amount);
          
          transaction.distributionRules.forEach(rule => {
            const ownerId = rule.ownerId;
            if (ownerAmounts[ownerId] !== undefined) {
              const ownerAmount = Math.abs(amount) * (rule.percentage / 100);
              ownerAmounts[ownerId] += ownerAmount;
              console.log(`[DEBUG] Owner ${ownerId} added amount:`, ownerAmount, 'total now:', ownerAmounts[ownerId]);
            } else {
              console.log(`[DEBUG] Owner ${ownerId} not found in ownerAmounts`);
            }
          });
        } 
        // Если нет правил распределения, применяем общие правила книги
        else {
          console.log(`[DEBUG] Transaction ${transaction.id} uses book distribution rules`);
          const amount = getTransactionAmount(transaction, targetCurrency.value);
          console.log(`[DEBUG] Transaction amount in target currency:`, amount);
          
          bookData.value.distributionRules.forEach(rule => {
            const ownerId = rule.ownerId;
            const ownerAmount = Math.abs(amount) * (rule.percentage / 100);
            ownerAmounts[ownerId] += ownerAmount;
            console.log(`[DEBUG] Owner ${ownerId} added amount:`, ownerAmount, 'total now:', ownerAmounts[ownerId]);
          });
        }
      });
      
      // Расчет общей суммы расходов
      const totalExpense = Object.values(ownerAmounts).reduce((sum, val) => sum + Number(val), 0);
      console.log('[DEBUG] Total expense:', totalExpense);
      
      // Расчет процентного соотношения трат
      const result = {
        totalExpense,
        ownerAmounts,
        ownerPercentages: {}
      };
      
      // Вычисляем процентное соотношение, если общая сумма больше 0
      if (totalExpense > 0) {
        Object.keys(ownerAmounts).forEach(ownerId => {
          result.ownerPercentages[ownerId] = (ownerAmounts[ownerId] / totalExpense) * 100;
          console.log(`[DEBUG] Owner ${ownerId} percentage:`, result.ownerPercentages[ownerId]);
        });
      } else {
        // Если нет расходов, используем проценты из правил распределения книги
        console.log('[DEBUG] No expenses, using default distribution rules');
        bookData.value.distributionRules.forEach(rule => {
          result.ownerPercentages[rule.ownerId] = rule.percentage;
          console.log(`[DEBUG] Owner ${rule.ownerId} default percentage:`, rule.percentage);
        });
      }
      
      console.log('[DEBUG] Final result of ownerExpenseDistribution:', result);
      return result;
    } catch (error) {
      console.error('[useBookFinanceSummary] Error calculating owner expense distribution:', error);
      console.error('[DEBUG] Error stack:', error.stack);
      return null;
    }
  });
  
  // Инициализация данных владельцев для слайдера с защитой от ошибок
  const ownerSides = computed(() => {
    console.log('[DEBUG] Starting ownerSides calculation');
    console.log('[DEBUG] bookData.distributionRules:', bookData.value?.distributionRules);
    console.log('[DEBUG] ownerExpenseDistribution:', ownerExpenseDistribution.value);
    
    try {
      // Проверяем, есть ли правила распределения и достаточно ли их
      if (!bookData.value.distributionRules || bookData.value.distributionRules.length < 2) {
        console.log('[DEBUG] No distribution rules, returning default values');
        // Возвращаем значения по умолчанию, если правил распределения нет
        return [
          { name: 'Alex', id: 'me', percentage: 50, amount: 0 },
          { name: 'Sasha Solar', id: 'other', percentage: 50, amount: 0 }
        ];
      }
  
      // Получаем данные о фактическом распределении расходов
      const distribution = ownerExpenseDistribution.value;
      console.log('[DEBUG] Distribution data:', distribution);
      
      // Получаем всех пользователей
      const allUsers = userStore.getAllUsers();
      console.log('[DEBUG] All users:', allUsers.map(u => ({ id: u.id, name: u.name })));
      
      // Получаем данные о владельцах из правил распределения
      console.log('[DEBUG] Creating ownerSides from distribution rules');
      const ownersData = bookData.value.distributionRules.map(rule => {
        console.log('[DEBUG] Processing rule for owner:', rule.ownerId, rule.percentage);
        // Находим пользователя по ID
        const user = allUsers.find(user => user.id === rule.ownerId);
        console.log('[DEBUG] Found user:', user ? user.name : 'Not found');
        
        // Проверяем, есть ли данные о фактическом распределении для этого владельца
        const hasDistributionPercentage = !!(
          distribution && 
          distribution.ownerPercentages && 
          distribution.ownerPercentages[rule.ownerId] !== undefined
        );
        
        const hasDistributionAmount = !!(
          distribution && 
          distribution.ownerAmounts && 
          distribution.ownerAmounts[rule.ownerId] !== undefined
        );
        
        console.log(`[DEBUG] Owner ${rule.ownerId} has distribution percentage:`, hasDistributionPercentage);
        console.log(`[DEBUG] Owner ${rule.ownerId} has distribution amount:`, hasDistributionAmount);
        
        // Создаем объект с информацией о владельце
        const ownerInfo = {
          name: user ? user.name : 'Unknown',
          id: rule.ownerId,
          // Если есть данные о фактическом распределении, используем их
          percentage: hasDistributionPercentage
            ? distribution.ownerPercentages[rule.ownerId] 
            : rule.percentage,
          // Добавляем сумму расходов владельца, если она доступна
          amount: hasDistributionAmount
            ? distribution.ownerAmounts[rule.ownerId]
            : 0
        };
        
        console.log('[DEBUG] Created owner info:', ownerInfo);
        return ownerInfo;
      });
      
      // Убедимся, что есть хотя бы два владельца
      if (ownersData.length < 2) {
        console.log('[DEBUG] Less than 2 owners, adding a second one');
        // Добавим второго владельца, если его нет
        ownersData.push({
          name: 'User 2',
          id: 'unknown',
          percentage: 100 - (ownersData[0]?.percentage || 50),
          amount: 0
        });
      }
      
      console.log('[DEBUG] Final ownerSides data:', ownersData);
      return ownersData;
    } catch (error) {
      console.error('[useBookFinanceSummary] Error calculating owner sides:', error);
      console.error('[DEBUG] Error stack:', error.stack);
      // Возвращаем значения по умолчанию при ошибке
      return [
        { name: 'User 1', id: 'user1', percentage: 50, amount: 0 },
        { name: 'User 2', id: 'user2', percentage: 50, amount: 0 }
      ];
    }
  });
  
  // Вычисляем реальное процентное соотношение между первым и вторым владельцем
  const actualOwnerDistribution = computed(() => {
    console.log('[DEBUG] Starting actualOwnerDistribution calculation');
    console.log('[DEBUG] ownerSides:', ownerSides.value);
    
    try {
      // Проверяем, существует ли массив и есть ли в нем первый элемент
      if (!ownerSides.value || ownerSides.value.length === 0) {
        console.log('[DEBUG] ownerSides is empty, returning default 50%');
        return 50;
      }
      
      // Проверяем наличие первого элемента и его percentage
      const firstOwner = ownerSides.value[0];
      console.log('[DEBUG] First owner:', firstOwner);
      
      if (!firstOwner || firstOwner.percentage === undefined) {
        console.log('[DEBUG] First owner or percentage not found, returning default 50%');
        return 50;
      }
      
      // Если есть данные о распределении, используем процент первого владельца
      const rounded = Math.round(firstOwner.percentage);
      console.log('[DEBUG] Rounded percentage:', rounded);
      return rounded;
    } catch (error) {
      console.error('[useBookFinanceSummary] Error calculating actual owner distribution:', error);
      console.error('[DEBUG] Error stack:', error.stack);
      return 50;
    }
  });
  
  // Расчет суммы для участника (с защитой от ошибок)
  const getParticipantAmount = (index) => {
    console.log(`[DEBUG] Getting participant amount for index ${index}`);
    console.log('[DEBUG] ownerSides:', ownerSides.value);
    console.log('[DEBUG] bookData.totalAmount:', bookData.value?.totalAmount);
    
    try {
      // Проверяем, инициализирован ли массив ownerSides
      if (!ownerSides.value || ownerSides.value.length <= index) {
        console.log(`[DEBUG] ownerSides not initialized or index ${index} out of bounds, returning 0`);
        return 0;
      }
      
      // Если у нас есть данные о распределении, используем их
      if (ownerSides.value[index] && ownerSides.value[index].amount !== undefined) {
        console.log(`[DEBUG] Using pre-calculated amount for index ${index}:`, ownerSides.value[index].amount);
        return ownerSides.value[index].amount;
      }
      
      // Запасной вариант - процентное распределение от общей суммы
      const totalAmount = Math.abs(bookData.value?.totalAmount || 0);
      
      // Определяем процент в зависимости от индекса
      let percentage;
      if (index === 0) {
        percentage = ownerSides.value[0]?.percentage ?? 50;
      } else {
        percentage = index < ownerSides.value.length 
          ? ownerSides.value[index]?.percentage 
          : (100 - (ownerSides.value[0]?.percentage ?? 50));
      }
      
      console.log(`[DEBUG] Calculating from total: ${totalAmount} * ${percentage}% / 100`);
      return totalAmount * (percentage / 100);
    } catch (error) {
      console.error(`[useBookFinanceSummary] Error getting participant amount for index ${index}:`, error);
      console.error('[DEBUG] Error stack:', error.stack);
      return 0;
    }
  };
  
  // Обновление значения слайдера (теперь просто для отображения)
  const updateOwnerDistribution = (event) => {
    // Ничего не делаем - слайдер только для отображения
    console.log('[useBookFinanceSummary] Slider is now read-only');
  };
  
  // Форматирование суммы с учетом валюты
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '0';
    
    try {
      const currencyCode = bookData.value.currency;
      return currencyStore.formatCurrency(amount, currencyCode);
    } catch (error) {
      console.error('[useBookFinanceSummary] Error formatting amount:', error);
      return amount.toString();
    }
  };
  
  // Форматирование валюты
  const formatCurrency = (value) => {
    try {
      const currencyCode = bookData.value.currency;
      return currencyStore.formatCurrency(value || 0, currencyCode);
    } catch (error) {
      console.error('[useBookFinanceSummary] Error formatting currency:', error);
      return (value || 0).toString();
    }
  };
  
  // Определение класса для общей суммы
  const getTotalClass = (amount) => {
    try {
      if (amount > 0) return 'amount-positive';
      if (amount < 0) return 'amount-negative';
      return '';
    } catch (error) {
      console.error('[useBookFinanceSummary] Error getting total class:', error);
      return '';
    }
  };
  
  // Стиль для слайдера
  const getSliderStyle = () => {
    try {
      const percentage = actualOwnerDistribution.value;
      const leftColor = '#555555';
      const rightColor = '#4F9FC8';
      
      return {
        background: `linear-gradient(to right, ${leftColor} 0%, ${leftColor} ${percentage}%, ${rightColor} ${percentage}%, ${rightColor} 100%)`
      };
    } catch (error) {
      console.error('[useBookFinanceSummary] Error getting slider style:', error);
      return { background: 'linear-gradient(to right, #555555 0%, #555555 50%, #4F9FC8 50%, #4F9FC8 100%)' };
    }
  };
  
  // Стиль для участника
  const getParticipantStyle = (index) => {
    try {
      const leftColor = '#555555';
      const rightColor = '#4F9FC8';
      
      return {
        color: index === 0 ? leftColor : rightColor
      };
    } catch (error) {
      console.error('[useBookFinanceSummary] Error getting participant style:', error);
      return { color: index === 0 ? '#555555' : '#4F9FC8' };
    }
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
        console.error('[useBookFinanceSummary] Error refreshing transactions:', error);
        isLoading.value = false;
      });
  });
  
  // Функция для принудительного обновления данных
  const refreshData = async () => {
    isLoading.value = true;
    
    try {
      console.log(`[useBookFinanceSummary] Manually refreshing data for book: ${bookId.value}`);
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
      console.error('[useBookFinanceSummary] Error refreshing data:', error);
    } finally {
      isLoading.value = false;
    }
  };
  
  // Инициализация хранилищ
  const initStores = async () => {
    isLoading.value = true;
    
    try {
      // Последовательно инициализируем все необходимые хранилища
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
    } catch (error) {
      console.error('[useBookFinanceSummary] Error initializing stores:', error);
    } finally {
      isLoading.value = false;
    }
  };
  
  return {
    actualOwnerDistribution,
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
    refreshData,
    isLoading
  };
}