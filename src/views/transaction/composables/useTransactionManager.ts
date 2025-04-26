// src/views/transaction/composables/useTransactionManager.ts
import { computed, watch, ref } from 'vue';
import { useTransactionCore } from './useTransactionCore';
import { useRegularTransaction } from './useRegularTransaction';
import { useTransferTransaction } from './useTransferTransaction';
import { useDebtTransaction } from './useDebtTransaction';
import { useExchangeTransaction } from './useExchangeTransaction';
import { useDistribution } from './useDistribution';
import { useCurrency } from './useCurrency';

/**
 * Главный composable, объединяющий логику для всех типов транзакций
 */
export function useTransactionManager(emit, amountSectionRef) {
  // Инициализируем базовую логику транзакций
  const core = useTransactionCore(emit);
  
  // Инициализируем логику распределения с зависимостями от core
  const distribution = useDistribution(
    core.selectedBook,
    core.selectedType,
    core.selectedAccount,
    core.selectedCategory
  );
  
  // Инициализируем валютные операции
  const currency = useCurrency(
    core.selectedAccount,
    core.destinationAccount,
    core.selectedType,
    core.amount
  );
  
  // Инициализируем специфичные типы транзакций
  const regularTransaction = useRegularTransaction(
    core.amount,
    core.selectedType,
    core.selectedBook,
    core.selectedAccount,
    core.selectedCategory,
    distribution.distributionPercentage,
    distribution.distributionOwners,
    distribution.shouldShowDistribution,
    distribution.isNonStandardDistribution,
    core.isSaving,
    core.resetForm,
    core.validateBaseTransaction,
    distribution.checkCategoryDistributionConflict,
    distribution.saveDistributionSetting
  );
  
  const transferTransaction = useTransferTransaction(
    core.amount,
    core.selectedBook,
    core.selectedAccount,
    core.destinationAccount,
    core.isSaving,
    core.resetForm,
    core.validateBaseTransaction,
    currency.isTransferWithDifferentCurrencies,
    currency.convertedAmount
  );
  
  const debtTransaction = useDebtTransaction(
    core.amount,
    core.selectedBook,
    core.selectedAccount,
    core.selectedCategory,
    distribution.distributionPercentage,
    distribution.distributionOwners,
    core.isSaving,
    core.resetForm,
    core.validateBaseTransaction
  );
  
  const exchangeTransaction = useExchangeTransaction(
    core.amount,
    core.selectedBook,
    core.selectedAccount,
    core.destinationAccount,
    core.isSaving,
    core.resetForm,
    core.validateBaseTransaction,
    currency.isTransferWithDifferentCurrencies,
    currency.convertedAmount
  );
  
  // Определение, какой компонент обработки использовать на основе типа
  const activeTransactionHandler = computed(() => {
    switch (core.selectedType.value) {
      case 'transfer':
        return transferTransaction;
      case 'debt':
        return debtTransaction;
      case 'exchange':
        return exchangeTransaction;
      default:
        return regularTransaction;
    }
  });
  
  // Создаем ref для контроля состояния активной суммы
  const isSourceAmountActive = ref(true);
  const manualDestinationAmount = ref('0');
  
  // Обработчик нажатия на клавиатуре, учитывающий тип транзакции
  const handleKeypadInput = (value) => {
    // Если это перевод или обмен с разными валютами
    if ((core.selectedType.value === 'transfer' || core.selectedType.value === 'exchange') && 
        currency.isTransferWithDifferentCurrencies.value) {
      
      // Если активен ввод конечной суммы
      if (!isSourceAmountActive.value) {
        if (value === '.' && manualDestinationAmount.value.includes('.')) {
          return;
        }
        
        if (manualDestinationAmount.value === '0' && value !== '.') {
          manualDestinationAmount.value = value;
        } else {
          manualDestinationAmount.value = manualDestinationAmount.value + value;
        }
        
        // Обновляем также в компоненте, если нужно
        updateAmountSectionComponent();
        
        // Обновляем значение в соответствующем обработчике транзакции
        if (core.selectedType.value === 'transfer') {
          transferTransaction.updateManualDestinationAmount(manualDestinationAmount.value);
        } else if (core.selectedType.value === 'exchange') {
          exchangeTransaction.updateManualDestinationAmount(manualDestinationAmount.value);
        }
      } else {
        // Стандартный ввод для исходной суммы
        core.handleKeypadInput(value);
      }
    } else {
      // Стандартный ввод для всех остальных случаев
      core.handleKeypadInput(value);
    }
  };
  
  // Обработчик удаления символа, учитывающий тип транзакции
  const deleteLastDigit = () => {
    // Если это перевод или обмен с разными валютами
    if ((core.selectedType.value === 'transfer' || core.selectedType.value === 'exchange') && 
        currency.isTransferWithDifferentCurrencies.value && 
        !isSourceAmountActive.value) {
      
      // Удаляем из суммы назначения
      if (manualDestinationAmount.value.length > 1) {
        manualDestinationAmount.value = manualDestinationAmount.value.slice(0, -1);
      } else {
        manualDestinationAmount.value = '0';
      }
      
      // Обновляем также в компоненте, если нужно
      updateAmountSectionComponent();
      
      // Обновляем значение в соответствующем обработчике транзакции
      if (core.selectedType.value === 'transfer') {
        transferTransaction.updateManualDestinationAmount(manualDestinationAmount.value);
      } else if (core.selectedType.value === 'exchange') {
        exchangeTransaction.updateManualDestinationAmount(manualDestinationAmount.value);
      }
    } else {
      // Стандартное удаление для всех остальных случаев
      core.deleteLastDigit();
    }
  };
  
  // Функция для обновления компонента AmountSection
  const updateAmountSectionComponent = () => {
    if (amountSectionRef.value) {
      amountSectionRef.value.updateManualAmount(manualDestinationAmount.value);
    }
  };
  
  // Общий обработчик добавления транзакции
  const handleAddTransaction = async () => {
    let result;
    
    switch (core.selectedType.value) {
      case 'transfer':
        result = await transferTransaction.handleAddTransferTransaction();
        if (result) {
          // Сбрасываем также конвертируемую сумму
          manualDestinationAmount.value = '0';
          isSourceAmountActive.value = true;
          updateAmountSectionComponent();
        }
        return result;
        
      case 'debt':
        result = await debtTransaction.handleAddDebtTransaction();
        return result;
        
      case 'exchange':
        result = await exchangeTransaction.handleAddExchangeTransaction();
        if (result) {
          // Сбрасываем также конвертируемую сумму
          manualDestinationAmount.value = '0';
          isSourceAmountActive.value = true;
          updateAmountSectionComponent();
        }
        return result;
        
      default: // income или expense
        result = await regularTransaction.handleAddRegularTransaction();
        if (result && result.action === 'openCategorySelector') {
          core.showCategorySelector.value = true;
        }
        return result;
    }
  };
  

  // Обработчик выбора категории, учитывающий тип транзакции
  const handleCategorySelect = (category) => {
    core.selectedCategory.value = category;
    
    if (core.selectedType.value === 'debt') {
      // Для долгов просто сохраняем категорию и показываем диалог
      debtTransaction.showDebtorSelectionDialog();
      return true;
    } else {
      // Для обычных доходов и расходов
      return regularTransaction.handleCategorySelectionForRegular(category);
    }
  };
  
  // Обработчики для AmountSection при конвертации валют
  const handleSourceAmountActive = () => {
    isSourceAmountActive.value = true;
    
    if (core.selectedType.value === 'transfer') {
      transferTransaction.handleSourceAmountActive();
    } else if (core.selectedType.value === 'exchange') {
      exchangeTransaction.handleSourceAmountActive();
    }
  };
  
  const handleDestinationAmountActive = (value) => {
    isSourceAmountActive.value = false;
    manualDestinationAmount.value = value || currency.convertedAmount.value;
    
    if (core.selectedType.value === 'transfer') {
      transferTransaction.handleDestinationAmountActive(value || manualDestinationAmount.value);
    } else if (core.selectedType.value === 'exchange') {
      exchangeTransaction.handleDestinationAmountActive(value || manualDestinationAmount.value);
    }
  };
  
  const handleUpdateDestinationAmount = (value) => {
    manualDestinationAmount.value = value;
    
    if (core.selectedType.value === 'transfer') {
      transferTransaction.updateManualDestinationAmount(value);
    } else if (core.selectedType.value === 'exchange') {
      exchangeTransaction.updateManualDestinationAmount(value);
    }
  };
  
  // Сброс при смене типа транзакции
  watch(core.selectedType, (newType) => {
    // Сбросим состояние ввода суммы при смене типа
    isSourceAmountActive.value = true;
    manualDestinationAmount.value = '0';
    
    if (newType === 'transfer') {
      transferTransaction.resetTransferState();
    } else if (newType === 'exchange') {
      exchangeTransaction.resetExchangeState();
    }
    
    // Для долга показываем слайдер распределения
    if (newType === 'debt' && !distribution.isSliderVisible.value) {
      distribution.toggleDistributionVisibility();
    }
    
    // При смене с перевода на другой тип сбрасываем сумму, если была конвертация
    if (newType !== 'transfer' && 
        core.selectedType.value === 'transfer' && 
        currency.isTransferWithDifferentCurrencies.value) {
      core.amount.value = '0';
    }
    
    // Настраиваем распределение для нового типа транзакции
    distribution.setupDistributionForTransactionType(newType);
  });
  
  // Сброс ручной суммы при изменении валют или счетов
  watch(
    [core.selectedAccount, core.destinationAccount, currency.convertedAmount], 
    () => {
      if (currency.isTransferWithDifferentCurrencies.value) {
        // Обновляем значение в зависимости от типа транзакции
        if (isSourceAmountActive.value) {
          manualDestinationAmount.value = currency.convertedAmount.value;
          
          // Обновляем в компоненте AmountSection
          updateAmountSectionComponent();
        }
        
        // Обновляем также в обработчиках транзакций
        if (core.selectedType.value === 'transfer') {
          transferTransaction.updateManualDestinationAmount(manualDestinationAmount.value);
        } else if (core.selectedType.value === 'exchange') {
          exchangeTransaction.updateManualDestinationAmount(manualDestinationAmount.value);
        }
      }
    }
  );
  
  // Следим за изменениями в isSourceAmountActive и manualDestinationAmount 
  // в transferTransaction и обновляем наши локальные переменные
  watch(
    () => transferTransaction.isSourceAmountActive.value,
    (newValue) => {
      if (isSourceAmountActive.value !== newValue) {
        isSourceAmountActive.value = newValue;
      }
    }
  );
  
  watch(
    () => transferTransaction.manualDestinationAmount.value,
    (newValue) => {
      if (manualDestinationAmount.value !== newValue) {
        manualDestinationAmount.value = newValue;
        updateAmountSectionComponent();
      }
    }
  );
  
  // Аналогично для exchangeTransaction, если нужно
  watch(
    () => exchangeTransaction.isSourceAmountActive?.value,
    (newValue) => {
      if (newValue !== undefined && isSourceAmountActive.value !== newValue) {
        isSourceAmountActive.value = newValue;
      }
    }
  );
  
  watch(
    () => exchangeTransaction.manualDestinationAmount?.value,
    (newValue) => {
      if (newValue !== undefined && manualDestinationAmount.value !== newValue) {
        manualDestinationAmount.value = newValue;
        updateAmountSectionComponent();
      }
    }
  );
  
  // Объединяем и возвращаем все необходимые значения и методы
  return {
    // Core state
    ...core,
    
    // Distribution
    distributionPercentage: distribution.distributionPercentage,
    distributionOwners: distribution.distributionOwners,
    isSliderVisible: distribution.isSliderVisible,
    showDistributionToggle: distribution.showDistributionToggle,
    isNonStandardDistribution: distribution.isNonStandardDistribution,
    getStandardDistributionValue: distribution.getStandardDistributionValue,
    toggleDistributionVisibility: distribution.toggleDistributionVisibility,
    personSelectionPopupVisible: distribution.personSelectionPopupVisible,
    currentSlotIndex: distribution.currentSlotIndex,
    handlePersonClick: distribution.handlePersonClick,
    handleAddPerson: distribution.handleAddPerson,
    handlePersonSelect: distribution.handlePersonSelect,
    setPopupVisibility: distribution.setPopupVisibility,
    handlePersonRemove: distribution.handlePersonRemove,
    removeSecondPerson: distribution.removeSecondPerson,
    
    // Currency
    sourceCurrencySymbol: currency.sourceCurrencySymbol,
    destinationCurrencySymbol: currency.destinationCurrencySymbol,
    isTransferWithDifferentCurrencies: currency.isTransferWithDifferentCurrencies,
    convertedAmount: currency.convertedAmount,
    initCurrencyStore: currency.initCurrencyStore,
    
    // Активная сумма и мануальное значение
    isSourceAmountActive,
    manualDestinationAmount,
    
    // DebtTransaction
    debtorDialog: debtTransaction.debtorDialog,
    availableDebtors: debtTransaction.availableDebtors,
    currentUserId: debtTransaction.currentUserId,
    onDebtorSelected: debtTransaction.onDebtorSelected,
    hideDebtorDialog: debtTransaction.hideDebtorDialog,
    
    // RegularTransaction confirmation
    confirmationDialog: regularTransaction.confirmationDialog,
    
    // Custom handlers
    handleKeypadInput,
    deleteLastDigit,
    handleAddTransaction,
    handleCategorySelect,
    handleSourceAmountActive,
    handleDestinationAmountActive,
    handleUpdateDestinationAmount
  };
}