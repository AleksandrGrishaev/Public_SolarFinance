// src/composables/transaction/useKeypad.ts
import { ref } from 'vue';

/**
 * Хук для управления вводом суммы через цифровую клавиатуру
 */
export function useKeypad() {
  // Текущее значение суммы
  const amount = ref('0');

  /**
   * Обработка нажатия кнопки на клавиатуре
   * @param value Введенное значение
   */
  const handleKeypadInput = (value) => {
    // НОВОЕ: Проверяем наличие второго участника
    if (secondUserId.value && !isSliderVisible.value) {
      isSliderVisible.value = true;
      shouldShowDistribution.value = true;
    }
    
    // Существующая логика обработки нажатий
    if ((selectedType.value === 'transfer' || selectedType.value === 'exchange') && 
        isTransferWithDifferentCurrencies.value) {
      
      if (!isSourceAmountActive.value) {
        if (value === '.' && manualDestinationAmount.value.includes('.')) {
          return;
        }
        
        if (manualDestinationAmount.value === '0' && value !== '.') {
          updateManualDestinationAmount(value);
        } else {
          updateManualDestinationAmount(
            manualDestinationAmount.value + value
          );
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

  /**
   * Удаление последнего символа суммы
   */
  const deleteLastDigit = () => {
    if (amount.value.length > 1) {
      amount.value = amount.value.slice(0, -1);
    } else {
      amount.value = '0';
    }
  };

  /**
   * Установка нового значения суммы
   * @param newAmount Новое значение суммы
   */
  const setAmount = (newAmount: string | number) => {
    if (typeof newAmount === 'number') {
      amount.value = newAmount.toString();
    } else {
      amount.value = newAmount;
    }
  };

  /**
   * Сброс суммы на ноль
   */
  const resetAmount = () => {
    amount.value = '0';
  };

  return {
    amount,
    handleKeypadInput,
    deleteLastDigit,
    setAmount,
    resetAmount
  };
}