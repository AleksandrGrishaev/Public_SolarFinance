// src/views/debt/composables/useDebts.ts
import { ref, computed } from 'vue';
import { useDebtStore, type Debt, type DebtOwner } from '@/stores/debt/debtStore';

export function useDebts() {
  const debtStore = useDebtStore();
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  // Получаем данные из хранилища
  const allDebts = computed(() => debtStore.debts);
  const selectedOwner = computed(() => debtStore.selectedOwner);
  const filteredDebts = computed(() => debtStore.filteredDebts);
  const totalDebtAmount = computed(() => debtStore.totalDebtAmount);
  const debtsByGroup = computed(() => debtStore.debtsByGroup);
  const totalByGroup = computed(() => debtStore.totalByGroup);
  
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
   * Общее форматирование суммы с учетом валюты
   */
  const formatCurrency = (amount: number, currency: string = '$', isPositive: boolean = false) => {
    // Определяем знак
    const sign = amount < 0 || !isPositive ? '-' : '';
    // Абсолютное значение для отображения
    const absAmount = Math.abs(amount);
    
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
   * Изменение выбранного владельца для фильтрации долгов
   */
  const setSelectedOwner = (owner: DebtOwner) => {
    debtStore.setSelectedOwner(owner);
  };
  
  /**
   * Получение информации о конкретном долге
   */
  const getDebtById = (id: string): Debt | undefined => {
    return allDebts.value.find(debt => debt.id === id);
  };
  
  /**
   * Загрузка долгов
   */
  const loadDebts = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await debtStore.fetchDebts();
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
  
  return {
    isLoading,
    error,
    allDebts,
    selectedOwner,
    filteredDebts,
    totalDebtAmount,
    debtsByGroup,
    totalByGroup,
    isDebtOwed,
    formatDebtAmount,
    formatCurrency,
    setSelectedOwner,
    getDebtById,
    loadDebts,
    addDebt,
    updateDebt,
    deleteDebt
  };
}