// src/views/account/popup/composables/useAccountTypes.ts
import { computed, ref, watch } from 'vue';
import type { AccountType } from '../../../../stores/account/types';

export function useAccountTypes() {
  /**
   * Получает все возможные типы аккаунтов в виде объекта с метками
   * @returns Массив объектов с label и value для использования в UI компонентах
   */
  const getAccountTypeLabels = () => {
    // Это должно соответствовать типу AccountType в вашем приложении
    const accountTypes: AccountType[] = [
      'cash',
      'bank',
      'card',
      'credit_card',
      'savings',
      'investment'
    ];

    // Форматируем каждый тип для отображения с заглавной буквы и пробелами
    return accountTypes.map(type => ({
      value: type,
      label: formatAccountTypeLabel(type)
    }));
  };

  /**
   * Форматирует строковое значение типа аккаунта для отображения в UI
   * @param type Тип аккаунта
   * @returns Отформатированная строка для отображения
   */
  const formatAccountTypeLabel = (type: string): string => {
    // Заменяем underscore на пробелы и делаем первую букву каждого слова заглавной
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

   /**
   * Получает иконку по умолчанию для типа аккаунта
   * @param type Тип аккаунта 
   * @returns Название иконки по умолчанию для указанного типа
   */
   const getDefaultIconForAccountType = (type: AccountType): string => {
    switch (type) {
      case 'cash':
        return 'IconWallet';
      case 'bank':
        return 'IconBuilding';
      case 'card':
        return 'IconCreditCard';
      case 'credit_card':
        return 'IconCreditCard';
      case 'savings':
        return 'IconPigMoney';
      case 'investment':
        return 'IconChartLine'; // Изменено с IconLineChart на IconChartLine из @tabler/icons-vue
      default:
        return 'IconWallet';
    }
  };

  /**
   * Получает цвет по умолчанию для типа аккаунта
   * @param type Тип аккаунта
   * @returns Цвет по умолчанию для указанного типа
   */
  const getDefaultColorForAccountType = (type: AccountType): string => {
    switch (type) {
      case 'cash':
        return '#4CAF50'; // Зеленый
      case 'bank':
        return '#2196F3'; // Синий
      case 'card':
        return '#FFC107'; // Янтарный
      case 'credit_card':
        return '#E91E63'; // Розовый
      case 'savings':
        return '#9C27B0'; // Фиолетовый
      case 'investment':
        return '#FF9800'; // Оранжевый
      default:
        return '#949496'; // Серый по умолчанию
    }
  };

  /**
   * Инициализирует данные аккаунта с типом и соответствующими значениями по умолчанию
   * @param defaultType Тип аккаунта по умолчанию
   * @returns Объект с дефолтными значениями icon и color
   */
  const initAccountTypeData = (defaultType: AccountType = 'card') => {
    return {
      icon: getDefaultIconForAccountType(defaultType),
      color: getDefaultColorForAccountType(defaultType)
    };
  };

  /**
   * Создает наблюдатель для автоматического обновления иконки и цвета при изменении типа
   * @param accountData Реактивный объект с данными аккаунта
   */
  const watchAccountTypeChanges = (accountData: any) => {
    watch(() => accountData.type, (newType) => {
      // Если иконка не была установлена пользователем (или пустая), установим иконку по умолчанию для нового типа
      if (!accountData.iconComponent) {
        accountData.icon = getDefaultIconForAccountType(newType);
      }
      
      // Можно также автоматически предлагать цвет по умолчанию, но только если пользователь
      // еще не выбрал собственный цвет
      if (accountData.color === '#949496') {
        accountData.color = getDefaultColorForAccountType(newType);
      }
    });
  };

  // Опции для типов аккаунтов, используемые в ToggleButtonGroup
  const typeOptions = computed(() => getAccountTypeLabels());

  return {
    typeOptions,
    getDefaultIconForAccountType,
    getDefaultColorForAccountType,
    initAccountTypeData,
    watchAccountTypeChanges
  };
}