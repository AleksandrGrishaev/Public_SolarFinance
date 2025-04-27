// src/views/debt/composables/useDebts.ts
import { ref, computed, onMounted } from 'vue';
import { useDebtStore, type Debt, type DebtOwner } from '@/stores/debt/debtStore';
import { useCurrencyStore } from '@/stores/currency';
import { useUserStore } from '@/stores/user';
import { useFormatBalance } from '@/composables/transaction/useFormatBalance';

export function useDebts() {
  const debtStore = useDebtStore();
  const currencyStore = useCurrencyStore();
  const userStore = useUserStore();
  const { formatBalance, getCurrencySymbol } = useFormatBalance();
  
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isInitialized = ref(false);
  
  // Получаем данные из хранилища
  const allDebts = computed(() => debtStore.debts);
  const selectedOwner = computed(() => debtStore.selectedOwner);
  const filteredDebts = computed(() => debtStore.filteredDebts);
  
  // Получаем базовую валюту пользователя
  const userBaseCurrency = computed(() => 
    userStore.currentUser?.settings?.baseCurrency || 'USD'
  );
  
  // Общая сумма долгов в базовой валюте пользователя
  const totalDebtAmount = computed(() => {
    return filteredDebts.value.reduce((sum, debt) => {
      // Если мы должны другим, это отрицательное значение
      const multiplier = isDebtOwed(debt) ? 1 : -1;
      
      // Конвертируем в базовую валюту пользователя
      const { convertedAmount } = currencyStore.convertAmount(
        debt.remainingAmount * multiplier,
        debt.currency,
        userBaseCurrency.value
      );
      
      return sum + convertedAmount;
    }, 0);
  });
  
  const debtsByGroup = computed(() => debtStore.debtsByGroup);
  
  // Суммы по группам в базовой валюте пользователя
  const totalByGroup = computed(() => {
    const totals: Record<string, number> = {
      'book': 0,
      'person': 0,
      'credit': 0
    };
    
    Object.keys(debtsByGroup.value).forEach(group => {
      debtsByGroup.value[group].forEach(debt => {
        const multiplier = isDebtOwed(debt) ? 1 : -1;
        
        // Конвертируем в базовую валюту пользователя
        const { convertedAmount } = currencyStore.convertAmount(
          debt.remainingAmount * multiplier,
          debt.currency,
          userBaseCurrency.value
        );
        
        totals[group] += convertedAmount;
      });
    });
    
    return totals;
  });
  
  /**
   * Определяет, должны ли мы кому-то (отрицательное значение) 
   * или нам должны (положительное значение)
   */
  const isDebtOwed = (debt: Debt): boolean => {
    return debtStore.isDebtOwed(debt);
  };
  
  /**
   * Форматирует сумму долга с учетом валюты и знака
   * Использует новый компонент useFormatBalance
   */
  const formatDebtAmount = (debt: Debt): string => {
    const isOwed = isDebtOwed(debt);
    // Определяем знак в зависимости от того, кто кому должен
    const amount = isOwed ? debt.remainingAmount : -debt.remainingAmount;
    
    return formatBalance(amount, 2, debt.currency, {
      useAbbreviations: true,
      minValueToAbbreviate: 10000, // Начинаем сокращать с 10к
      showDecimalsOnWhole: false
    });
  };
  
  /**
   * Форматирует общую сумму в базовой валюте пользователя
   */
  const formatTotalInUserCurrency = (amount: number): string => {
    return formatBalance(amount, 2, userBaseCurrency.value, {
      useAbbreviations: true,
      minValueToAbbreviate: 10000, // Начинаем сокращать с 10к
      showDecimalsOnWhole: false
    });
  };
  
  /**
   * Общее форматирование суммы с учетом валюты
   */
  const formatCurrency = (amount: number, currencyCode: string = '$'): string => {
    return formatBalance(amount, 2, currencyCode, {
      useAbbreviations: true,
      minValueToAbbreviate: 10000, // Начинаем сокращать с 10к
      showDecimalsOnWhole: false
    });
  };
  
  /**
   * Получить символ валюты пользователя
   */
  const getUserCurrencySymbol = computed(() => {
    return getCurrencySymbol(userBaseCurrency.value);
  });
  
  /**
   * Форматирует сумму в базовой валюте пользователя с понятным знаком
   */
  const formatAmountWithSign = (amount: number): string => {
    // Определяем тип знака (+ или -) в зависимости от величины
    const prefix = amount < 0 ? '-' : '+';
    // Форматируем по абсолютной величине, а затем добавляем знак
    const formatted = formatBalance(Math.abs(amount), 2, userBaseCurrency.value, {
      useAbbreviations: true,
      minValueToAbbreviate: 10000,
      showDecimalsOnWhole: false
    });
    
    // Если сумма уже отрицательна, не добавляем знак -
    if (amount < 0) return formatted;
    
    // Если в начале formatted есть символ валюты, вставляем знак после него
    const currencySymbol = getCurrencySymbol(userBaseCurrency.value);
    if (formatted.startsWith(currencySymbol)) {
      return formatted.replace(currencySymbol, `${currencySymbol}${prefix}`);
    }
    
    // Иначе добавляем знак в начало
    return `${prefix}${formatted}`;
  };
  
  /**
   * Изменение выбранного владельца для фильтрации долгов
   */
  const setSelectedOwner = (owner: DebtOwner) => {
    debtStore.setSelectedOwner(owner);
  };
  
  /**
   * Получение информации о конкретном долге
   */
  const getDebtById = (id: string): Debt | undefined => {
    // Сначала проверим, что долги загружены
    if (allDebts.value.length === 0) {
      console.warn('No debts loaded yet, try to fetch them first');
      return undefined;
    }
    
    console.log(`Searching for debt with ID: ${id}`, allDebts.value);
    
    // Ищем в общем массиве
    const debt = allDebts.value.find(debt => debt.id === id);
    
    if (!debt) {
      console.warn(`Debt with ID ${id} not found`);
      
      // Дополнительная проверка - выведем все имеющиеся ID для отладки
      const availableIds = allDebts.value.map(d => d.id);
      console.log('Available debt IDs:', availableIds);
      
      // Пытаемся найти по частичному совпадению (для отладки)
      if (id && typeof id === 'string') {
        const partialMatches = allDebts.value.filter(d => 
          d.id.includes(id) || id.includes(d.id)
        );
        if (partialMatches.length > 0) {
          console.log('Found partial matches:', partialMatches.map(d => d.id));
        }
      }
    }
    
    return debt;
  };
  
  /**
   * Загрузка долгов
   */
  const loadDebts = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      if (!isInitialized.value) {
        // Инициализируем хранилище долгов, если еще не сделали это
        await debtStore.init();
        isInitialized.value = true;
      } else {
        // Если уже инициализировано, просто обновляем данные
        await debtStore.fetchDebts();
      }
      
      // Проверка загрузки данных
      console.log('Loaded debts:', allDebts.value.length);
      if (allDebts.value.length === 0) {
        console.warn('No debts were loaded');
      }
    } catch (err) {
      console.error('Error loading debts:', err);
      error.value = 'Failed to load debts';
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Добавление нового долга
   */
  const addDebt = (debt: Debt) => {
    debtStore.addDebt(debt);
  };
  
  /**
   * Обновление существующего долга
   */
  const updateDebt = (id: string, updates: Partial<Debt>) => {
    debtStore.updateDebt(id, updates);
  };
  
  /**
   * Удаление долга
   */
  const deleteDebt = (id: string) => {
    debtStore.deleteDebt(id);
  };
  
  // Загружаем долги при создании композабла, если они еще не загружены
  onMounted(async () => {
    if (!isInitialized.value && allDebts.value.length === 0) {
      await loadDebts();
    }
  });
  
  return {
    isLoading,
    error,
    allDebts,
    selectedOwner,
    filteredDebts,
    totalDebtAmount,
    debtsByGroup,
    totalByGroup,
    userBaseCurrency,
    getUserCurrencySymbol,
    isDebtOwed,
    formatDebtAmount,
    formatCurrency,
    formatTotalInUserCurrency,
    formatAmountWithSign,
    setSelectedOwner,
    getDebtById,
    loadDebts,
    addDebt,
    updateDebt,
    deleteDebt
  };
}