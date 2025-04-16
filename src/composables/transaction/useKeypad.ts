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
  const handleKeypadInput = (value: string) => {
    // Если уже есть точка, то не добавляем вторую
    if (value === '.' && amount.value.includes('.')) {
      return;
    }
    
    // Если сумма равна нулю и вводится не точка, то заменяем ноль на введенное значение
    if (amount.value === '0' && value !== '.') {
      amount.value = value;
    } else {
      // Иначе добавляем символ к текущему значению
      amount.value += value;
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