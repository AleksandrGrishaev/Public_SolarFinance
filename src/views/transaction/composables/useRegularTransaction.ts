// src/views/transaction/composables/useRegularTransaction.ts
import { ref } from 'vue';
import { useAccountStore } from '@/stores/account';
import { useBookStore } from '@/stores/book';
import { useCurrencyStore } from '@/stores/currency';
import { useTransactionStore } from '@/stores/transaction';
import { messageService } from '@/services/system/MessageService';

/**
 * Composable для работы с обычными транзакциями (доходы и расходы)
 */
export function useRegularTransaction(
  amount,
  selectedType,
  selectedBook,
  selectedAccount,
  selectedCategory,
  distributionPercentage,
  distributionOwners,
  shouldShowDistribution,
  isNonStandardDistribution,
  isSaving,
  resetForm,
  validateBaseTransaction,
  checkCategoryDistributionConflict,
  saveDistributionSetting
) {
  // Stores
  const accountStore = useAccountStore();
  const bookStore = useBookStore();
  const currencyStore = useCurrencyStore();
  const transactionStore = useTransactionStore();
  
  // State for confirmation dialog
  const confirmationDialog = ref({
    show: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    standardDistribution: 50,
    onConfirm: null,
    onCancel: null
  });

/**
 * Сохранение обычной транзакции (доход/расход)
 */
const saveRegularTransaction = async () => {
  try {
    isSaving.value = true;
    
    // Конвертируем сумму в число
    const amountValue = parseFloat(amount.value);
    const finalAmount = selectedType.value === 'expense' 
      ? -Math.abs(amountValue) 
      : Math.abs(amountValue);
    
    // Получаем данные о выбранном счете
    const account = accountStore.getAccountById(selectedAccount.value);
    if (!account) {
      throw new Error(`Счет с ID ${selectedAccount.value} не найден`);
    }
    
    // Получаем данные о выбранной книге
    const book = bookStore.getBookById(selectedBook.value);
    if (!book) {
      throw new Error(`Книга с ID ${selectedBook.value} не найдена`);
    }
    
    // Определяем курс конвертации и сумму в валюте книги
    let bookRate = 1;
    let bookAmount = finalAmount;
    
    if (account.currency !== book.currency) {
      bookRate = currencyStore.getExchangeRate(account.currency, book.currency);
      bookAmount = finalAmount * bookRate;
    }
    
    // Формируем данные транзакции
    const transactionData = {
      date: new Date(),
      amount: finalAmount,
      currency: account.currency,
      bookCurrency: book.currency,
      bookRate: bookRate,
      bookAmount: bookAmount,
      type: selectedType.value,
      categoryId: selectedCategory.value?.id,
      description: selectedCategory.value?.name || 
                  `${selectedType.value === 'income' ? 'Доход' : 'Расход'}`,
      sourceEntityId: selectedAccount.value,
      sourceEntityType: 'account',
      executedByOwnerId: 'user_1', // TODO: заменить на currentUser.id
      responsibleOwnerIds: ['user_1'], // TODO: заменить на currentUser.id
      bookId: selectedBook.value
    };
    
    // Добавляем правила распределения на основе наличия участников
    if (distributionOwners.value?.length > 1) {
      // Если есть два участника, добавляем распределение между ними
      transactionData.distributionRules = [
        {
          ownerId: distributionOwners.value[0].id,
          percentage: distributionPercentage.value
        },
        {
          ownerId: distributionOwners.value[1].id,
          percentage: 100 - distributionPercentage.value
        }
      ];
    } else if (distributionOwners.value?.length === 1) {
      // Если есть только один участник (владелец счета), ему 100%
      transactionData.distributionRules = [
        {
          ownerId: distributionOwners.value[0].id,
          percentage: 100
        }
      ];
    }
    
    // Сохраняем транзакцию
    const savedTransaction = await transactionStore.addTransaction(transactionData);
    
    // Обновляем баланс счета
    if (savedTransaction) {
      // Обновляем баланс выбранного счета
      const newBalance = account.currentBalance + finalAmount;
      await accountStore.updateAccountBalance(selectedAccount.value, newBalance);
    }
    
    // Сохраняем настройки распределения, если оно нестандартное
    if (isNonStandardDistribution.value && selectedCategory.value) {
      saveDistributionSetting(selectedBook.value, selectedCategory.value.id);
    }
    
    // Показываем уведомление
    messageService.success('Транзакция успешно добавлена');
    
    // Сбрасываем форму
    resetForm();
    
    return savedTransaction;
  } catch (error) {
    console.error('[useRegularTransaction] Ошибка при сохранении транзакции:', error);
    messageService.error('Произошла ошибка при сохранении транзакции');
    throw error;
  } finally {
    isSaving.value = false;
  }
};

  /**
   * Валидация обычной транзакции
   */
  const validateRegularTransaction = () => {
    return validateBaseTransaction();
  };

  /**
   * Показать диалог подтверждения
   */
  const showConfirmationDialog = (options) => {
    confirmationDialog.value = {
      show: true,
      title: options.title || 'Подтверждение',
      message: options.message || '',
      confirmText: options.confirmText || 'Подтвердить',
      cancelText: options.cancelText || 'Отмена',
      standardDistribution: options.standardDistribution || 50,
      onConfirm: options.onConfirm || (() => {}),
      onCancel: options.onCancel || (() => {})
    };
  };

  /**
   * Обработчик добавления транзакции
   */
  const handleAddRegularTransaction = async () => {
    if (!validateRegularTransaction()) {
      return;
    }
    
    if (selectedCategory.value) {
      // Если категория уже выбрана, проверяем конфликт распределения
      if (checkCategoryDistributionConflict(selectedCategory.value)) {
        showConfirmationDialog({
          title: 'Подтвердите распределение',
          message: `Обычно расходы в категории "${selectedCategory.value.name}" распределяются как ${selectedCategory.value.defaultDistribution}/${100-selectedCategory.value.defaultDistribution}, но сейчас установлено ${distributionPercentage.value}/${100-distributionPercentage.value}. Сохранить с текущим распределением?`,
          confirmText: 'Сохранить как есть',
          cancelText: 'Использовать стандартное',
          standardDistribution: selectedCategory.value.defaultDistribution,
          onConfirm: () => {
            saveRegularTransaction();
          },
          onCancel: () => {
            distributionPercentage.value = selectedCategory.value.defaultDistribution;
            saveRegularTransaction();
          }
        });
      } else {
        await saveRegularTransaction();
      }
    } else {
      // Если категория не выбрана, открываем селектор
      return { action: 'openCategorySelector' };
    }
  };

  /**
   * Обработчик выбора категории
   */
  const handleCategorySelectionForRegular = (category) => {
    if (category) {
      if (checkCategoryDistributionConflict(category)) {
        showConfirmationDialog({
          title: 'Подтвердите распределение',
          message: `Обычно расходы в категории "${category.name}" распределяются как ${category.defaultDistribution}/${100-category.defaultDistribution}, но сейчас установлено ${distributionPercentage.value}/${100-distributionPercentage.value}. Сохранить с текущим распределением?`,
          confirmText: 'Сохранить как есть',
          cancelText: 'Использовать стандартное',
          standardDistribution: category.defaultDistribution,
          onConfirm: () => saveRegularTransaction(),
          onCancel: () => {
            distributionPercentage.value = category.defaultDistribution;
            saveRegularTransaction();
          }
        });
        return true;
      }
      
      // Автоматически сохраняем транзакцию
      saveRegularTransaction();
      return true;
    }
    
    return false;
  };

  return {
    confirmationDialog,
    validateRegularTransaction,
    saveRegularTransaction,
    handleAddRegularTransaction,
    handleCategorySelectionForRegular,
    showConfirmationDialog
  };
}