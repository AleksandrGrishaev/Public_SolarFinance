// src/views/book/page/composables/useBookFinanceSummary.ts
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
  
  // Отфильтрованные транзакции на основе текущих фильтров
  const filteredTransactions = computed(() => {
    // Создаем фильтры для транзакций
    const filters: any = {
      bookIds: [bookId]
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
  
  // Получаем данные книги
  const bookData = computed(() => {
    const book = bookStore.getBookById(bookId);
    
    if (!book) {
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
    
    // Инициализируем суммы
    let incomeAmount = 0;
    let expenseAmount = 0;
    
    // Обрабатываем транзакции с учетом конвертации валют
    filteredTransactions.value.forEach(transaction => {
      // Определяем сумму в валюте книги
      let amountInBookCurrency;
      
      // Если есть предварительно рассчитанная сумма в валюте книги, используем её
      if (transaction.bookAmount !== undefined && transaction.bookCurrency === bookCurrency) {
        amountInBookCurrency = transaction.bookAmount;
      } else {
        // Иначе выполняем конвертацию
        if (transaction.currency !== bookCurrency) {
          const rate = currencyStore.getExchangeRate(transaction.currency, bookCurrency);
          amountInBookCurrency = transaction.amount * rate;
        } else {
          amountInBookCurrency = transaction.amount;
        }
      }
      
      // Суммируем приходы и расходы
      if (transaction.type === 'income') {
        incomeAmount += amountInBookCurrency;
      } else if (transaction.type === 'expense') {
        expenseAmount += amountInBookCurrency;
      }
    });
    
    // Рассчитываем общую сумму
    const totalAmount = incomeAmount + expenseAmount;
    
    return {
      name: book.name,
      incomeAmount,
      expenseAmount,
      totalAmount,
      distributionRules: book.distributionRules || [],
      currency: bookCurrency
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
  
  // Форматирование суммы с учетом валюты книги
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '';
    
    const bookCurrency = bookData.value.currency;
    const currency = currencyStore.getCurrency(bookCurrency);
    
    if (currency) {
      return currencyStore.formatCurrency(amount, bookCurrency);
    }
    
    // Запасной вариант
    return `${currency?.symbol || ''} ${Math.abs(amount).toLocaleString()}`;
  };
  
  // Форматирование валюты
  const formatCurrency = (value) => {
    const bookCurrency = bookData.value.currency;
    return currencyStore.formatCurrency(value, bookCurrency);
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
    console.log('Calendar visibility changed:', isVisible);
  };
  
  // Отслеживаем изменения фильтра даты
  watch(dateFilter, (newValue) => {
    emit('update:dateFilter', newValue);
  }, { deep: true });
  
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
    initStores
  };
}