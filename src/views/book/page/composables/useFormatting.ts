// src/views/book/page/composables/useFormatting.ts
import { computed } from 'vue';
import useBookData from './useBookData';
import useOwnerDistribution from './useOwnerDistribution';
import { useUserStore } from '@/stores/user';


export default function useFormatting(bookIdProp: string, emit: any) {
  // Получаем базовые данные о книге
  const {
    bookData,
    currencyStore
  } = useBookData(bookIdProp, emit);
  
// Получаем хранилище пользователей
const userStore = useUserStore();

  // Получаем данные о распределении между владельцами
  const {
    actualOwnerDistribution,
    ownerSides
  } = useOwnerDistribution(bookIdProp, emit);
  
  // Форматирование суммы с учетом валюты
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '0';
    
    try {
      const currencyCode = bookData.value.currency;
      return currencyStore.formatCurrency(amount, currencyCode);
    } catch (error) {
      console.error('[useFormatting] Error formatting amount:', error);
      return amount.toString();
    }
  };
  
  // Форматирование валюты
  const formatCurrency = (value) => {
    try {
      const currencyCode = bookData.value.currency;
      return currencyStore.formatCurrency(value || 0, currencyCode);
    } catch (error) {
      console.error('[useFormatting] Error formatting currency:', error);
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
      console.error('[useFormatting] Error getting total class:', error);
      return '';
    }
  };
  
// Стиль для слайдера
const getSliderStyle = () => {
    try {
      const percentage = actualOwnerDistribution.value;
      
      // Получаем цвета для участников из их настроек
      let leftColor = '#4E8090';  // Цвет по умолчанию
      let rightColor = '#DB9894'; // Цвет по умолчанию
      
      // Если есть данные о пользователях, используем их цвета
      if (ownerSides.value && ownerSides.value.length >= 2) {
        const users = userStore.getAllUsers();
        const leftUserId = ownerSides.value[0]?.id;
        const rightUserId = ownerSides.value[1]?.id;
        
        // Находим пользователя и получаем его цвет
        const leftUser = users.find(user => user.id === leftUserId);
        const rightUser = users.find(user => user.id === rightUserId);
        
        if (leftUser && leftUser.settings?.color) {
          leftColor = `#${leftUser.settings.color}`;
        }
        
        if (rightUser && rightUser.settings?.color) {
          rightColor = `#${rightUser.settings.color}`;
        }
      }
      
      return {
        background: `linear-gradient(to right, ${leftColor} 0%, ${leftColor} ${percentage}%, ${rightColor} ${percentage}%, ${rightColor} 100%)`
      };
    } catch (error) {
      console.error('[useFormatting] Error getting slider style:', error);
      return { background: 'linear-gradient(to right, #4E8090 0%, #4E8090 50%, #DB9894 50%, #DB9894 100%)' };
    }
  };
  
  // Стиль для участника
  const getParticipantStyle = (index) => {
    try {
      // Если есть данные о пользователях, используем их цвета
      if (ownerSides.value && ownerSides.value.length > index) {
        const users = userStore.getAllUsers();
        const userId = ownerSides.value[index]?.id;
        
        // Находим пользователя и получаем его цвет
        const user = users.find(user => user.id === userId);
        
        if (user && user.settings?.color) {
          return { color: `#${user.settings.color}` };
        }
      }
      
      // Значения по умолчанию
      return { color: index === 0 ? '#4E8090' : '#DB9894' };
    } catch (error) {
      console.error('[useFormatting] Error getting participant style:', error);
      return { color: index === 0 ? '#4E8090' : '#DB9894' };
    }
  };
  
  return {
    formatAmount,
    formatCurrency,
    getTotalClass,
    getSliderStyle,
    getParticipantStyle
  };
}