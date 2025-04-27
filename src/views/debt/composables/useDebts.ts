// src/views/debt/composables/useDebts.ts
import { ref, computed, onMounted } from 'vue';
import { useDebtStore, type Debt, type DebtOwner } from '@/stores/debt/debtStore';
import { useCurrencyStore } from '@/stores/currency';
import { useUserStore } from '@/stores/user';

export function useDebts() {
  const debtStore = useDebtStore();
  const currencyStore = useCurrencyStore();
  const userStore = useUserStore();
  
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
   */
  const formatDebtAmount = (debt: Debt): string => {
    const isOwed = isDebtOwed(debt);
    const prefix = isOwed ? '' : '-';
    const amount = Math.abs(debt.remainingAmount);
    
    if (amount >= 1000) {
      // Для тысяч используем суффикс k
      return `${prefix}${debt.currency} ${(amount / 1000).toFixed(0)}k`;
    } else {
      // Для меньших сумм показываем обычное форматирование
      return `${prefix}${debt.currency} ${amount.toFixed(2)}`;
    }
  };
  
  /**
   * Форматирует общую сумму в базовой валюте пользователя
   */
  const formatTotalInUserCurrency = (amount: number): string => {
    return currencyStore.formatCurrency(amount, userBaseCurrency.value);
  };
  
  /**
   * Общее форматирование суммы с учетом валюты
   */
  const formatCurrency = (amount: number, currency: string = '$'): string => {
    // Абсолютное значение для отображения
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    
    // Определяем формат в зависимости от суммы
    if (absAmount >= 1000) {
      // Для тысяч используем суффикс k
      return `${sign}${currency} ${(absAmount / 1000).toFixed(0)}k`;
    } else {
      // Для меньших сумм показываем обычное форматирование
      return `${sign}${currency} ${absAmount.toFixed(2)}`;
    }
  };
  
  /**
   * Получить символ валюты пользователя
   */
  const getUserCurrencySymbol = computed(() => {
    const currency = currencyStore.getCurrency(userBaseCurrency.value);
    return currency?.symbol || userBaseCurrency.value;
  });
  
  /**
   * Форматирует сумму в базовой валюте пользователя с понятным знаком
   */
  const formatAmountWithSign = (amount: number): string => {
    const absAmount = Math.abs(amount);
    const prefix = amount < 0 ? '-' : '+';
    
    if (absAmount >= 1000) {
      return `${prefix}${getUserCurrencySymbol.value} ${(absAmount / 1000).toFixed(0)}k`;
    } else {
      return `${prefix}${getUserCurrencySymbol.value} ${absAmount.toFixed(2)}`;
    }
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