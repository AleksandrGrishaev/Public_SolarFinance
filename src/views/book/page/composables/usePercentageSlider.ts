// src/views/book/page/composables/usePercentageSlider.ts
import { computed } from 'vue';
import { useBookContext } from './useBookContext';
import { useUserStore } from '@/stores/user';
import { useFormatBalance } from '@/composables/transaction/useFormatBalance';

export function usePercentageSlider() {
  console.log('[usePercentageSlider] Initializing...');
  
  const { hasDistributionRules, currentBook, getFilteredTransactions } = useBookContext();
  const userStore = useUserStore();
  const { formatBalance } = useFormatBalance();
  
  // Безопасный метод получения пользователя
  const getUser = (userId) => {
    // Получаем всех пользователей из хранилища и находим нужного по ID
    const allUsers = userStore.getAllUsers();
    console.log(`[usePercentageSlider] Looking for user ${userId} in ${allUsers.length} users`);
    const user = allUsers.find(user => user.id === userId);
    
    if (!user) {
      console.warn(`[usePercentageSlider] User with ID ${userId} not found`);
      return { name: 'Unknown', settings: { color: '808080' } };
    }
    
    return user;
  };
  
  // Получаем правила распределения из текущей книги
  const distributionRules = computed(() => {
    if (!hasDistributionRules.value || !currentBook.value) {
      return [];
    }
    
    return currentBook.value.distributionRules || [];
  });
  
  // Рассчитываем стороны владельцев для слайдера
  const ownerSides = computed(() => {
    if (!hasDistributionRules.value) {
      return [
        { name: 'No data', id: 'unknown', percentage: 50, amount: 0 },
        { name: 'No data', id: 'unknown', percentage: 50, amount: 0 }
      ];
    }
    
    // Получаем данные пользователей для правил распределения
    // Используем наш метод getUser для поиска пользователя
    const sides = distributionRules.value.slice(0, 2).map(rule => {
      const user = getUser(rule.ownerId);
      
      return {
        name: user?.name || 'Unknown',
        id: rule.ownerId,
        percentage: rule.percentage,
        amount: 0,
        color: user?.settings?.color || '808080'
      };
    });
    
    // Если получено меньше двух сторон, добавляем заглушку
    if (sides.length < 2) {
      sides.push({
        name: 'No data',
        id: 'unknown',
        percentage: 100 - (sides[0]?.percentage || 50),
        amount: 0,
        color: '808080'
      });
    }
    
    console.log('[usePercentageSlider] Owner sides:', sides);
    return sides;
  });
  
  // Вычисляем фактическое распределение на основе транзакций
  const actualOwnerDistribution = computed(() => {
    if (!hasDistributionRules.value || ownerSides.value.length < 1) {
      return 50;
    }
    
    return Math.round(ownerSides.value[0].percentage);
  });
  
  // Расчет суммы для каждого участника с использованием bookAmount и правил распределения
  const getParticipantAmount = (index) => {
    console.log(`[usePercentageSlider] Calculating amount for participant index ${index}`);
    
    if (!ownerSides.value[index]) {
      console.log('[usePercentageSlider] Participant not found for index', index);
      return 0;
    }
    
    const transactions = getFilteredTransactions();
    console.log(`[usePercentageSlider] Processing ${transactions.length} transactions for participant calculations`);
    
    // Общие траты
    let participantTotal = 0;
    
    // Получаем ID владельца
    const ownerId = ownerSides.value[index].id;
    console.log(`[usePercentageSlider] Processing for ownerId: ${ownerId}`);
    
    // Перебираем все транзакции расходов
    transactions.forEach(transaction => {
      if (transaction.type !== 'expense') return;
      
      // Используем bookAmount вместо amount
      const transactionAmount = Math.abs(transaction.bookAmount || transaction.amount);
      
      // Проверяем, есть ли правила распределения в транзакции
      if (transaction.distributionRules && transaction.distributionRules.length > 0) {
        // Находим правило для текущего владельца
        const rule = transaction.distributionRules.find(rule => rule.ownerId === ownerId);
        
        if (rule) {
          // Рассчитываем сумму согласно проценту в правиле
          const amountForOwner = transactionAmount * (rule.percentage / 100);
          console.log(`[usePercentageSlider] Transaction ${transaction.id}: ${amountForOwner} for owner ${ownerId} (${rule.percentage}%)`);
          participantTotal += amountForOwner;
        }
      } else if (transaction.responsibleOwnerIds && transaction.responsibleOwnerIds.includes(ownerId)) {
        // Если нет правил, но пользователь ответственен за транзакцию
        // Делим поровну между всеми ответственными владельцами
        const shareAmount = transactionAmount / transaction.responsibleOwnerIds.length;
        console.log(`[usePercentageSlider] Transaction ${transaction.id}: ${shareAmount} for owner ${ownerId} (equal share)`);
        participantTotal += shareAmount;
      }
    });
    
    console.log(`[usePercentageSlider] Total for participant ${ownerId}: ${participantTotal}`);
    return participantTotal;
  };
  
  // Форматирование суммы с новым форматом
  const formatParticipantAmount = (index) => {
    const amount = getParticipantAmount(index);
    const currency = currentBook.value?.currency;
    return formatBalance(amount, 5, currency);
  };
  
  // Получение стиля для слайдера
  const getSliderStyle = () => {
    const percentage = actualOwnerDistribution.value;
    
    // Цвета по умолчанию
    let leftColor = '#4E8090';
    let rightColor = '#DB9894';
    
    // Если у нас есть данные о владельцах, используем их цвета
    if (ownerSides.value.length >= 2) {
      if (ownerSides.value[0].color) {
        leftColor = `#${ownerSides.value[0].color}`;
      }
      
      if (ownerSides.value[1].color) {
        rightColor = `#${ownerSides.value[1].color}`;
      }
    }
    
    return {
      background: `linear-gradient(to right, ${leftColor} 0%, ${leftColor} ${percentage}%, ${rightColor} ${percentage}%, ${rightColor} 100%)`
    };
  };
  
  // Получение стиля для участника
  const getParticipantStyle = (index) => {
    if (ownerSides.value.length <= index) {
      return { color: index === 0 ? '#4E8090' : '#DB9894' };
    }
    
    const color = ownerSides.value[index].color;
    return { color: color ? `#${color}` : (index === 0 ? '#4E8090' : '#DB9894') };
  };
  
  // Обновление значения слайдера (только для отображения в этой реализации)
  const updateOwnerDistribution = () => {
    // Это лишь заглушка, так как слайдер только для чтения
    console.log('[usePercentageSlider] Slider update attempted (read-only)');
  };
  
  console.log('[usePercentageSlider] Initialized with distribution:', actualOwnerDistribution.value);
  
  return {
    ownerSides,
    actualOwnerDistribution,
    getParticipantAmount,
    formatParticipantAmount,
    getSliderStyle,
    getParticipantStyle,
    updateOwnerDistribution
  };
}