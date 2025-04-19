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
    
    // Проверка на валидный индекс
    if (index === undefined || index === null) {
      console.error('[usePercentageSlider] ERROR: Invalid index provided', index);
      return 0;
    }
    
    // Проверка наличия данных о сторонах
    if (!ownerSides.value || !ownerSides.value) {
      console.error('[usePercentageSlider] ERROR: ownerSides is not available');
      return 0;
    }
    
    if (!ownerSides.value[index]) {
      console.error('[usePercentageSlider] ERROR: Participant not found for index', index);
      return 0;
    }
    
    // Проверка наличия функции получения транзакций
    if (!getFilteredTransactions || typeof getFilteredTransactions !== 'function') {
      console.error('[usePercentageSlider] ERROR: getFilteredTransactions is not a function');
      return 0;
    }
    
    const transactions = getFilteredTransactions();
    
    // Проверка валидности транзакций
    if (!transactions || !Array.isArray(transactions)) {
      console.error('[usePercentageSlider] ERROR: Invalid transactions data', transactions);
      return 0;
    }
    
    console.log(`[usePercentageSlider] Processing ${transactions.length} transactions for participant calculations`);
    
    // Общие траты
    let participantTotal = 0;
    
    // Получаем ID владельца
    const ownerId = ownerSides.value[index].id;
    console.log(`[usePercentageSlider] Processing for ownerId: ${ownerId}`);
    
    // Отладка: проверка ID владельца
    if (!ownerId) {
      console.error('[usePercentageSlider] ERROR: Invalid owner ID for index', index);
      return 0;
    }
    
    // Счетчик обработанных транзакций
    let processedCount = 0;
    
    // Перебираем все транзакции расходов
    transactions.forEach((transaction, idx) => {
      // Проверка на тип транзакции
      if (!transaction) {
        console.warn(`[usePercentageSlider] WARNING: Null transaction at index ${idx}`);
        return;
      }
      
      if (transaction.type !== 'expense') {
        return;
      }
      
      processedCount++;
      
      // Используем bookAmount вместо amount
      const transactionAmount = Math.abs(transaction.bookAmount || transaction.amount || 0);
      
      // Отладка: значение транзакции
      if (isNaN(transactionAmount)) {
        console.warn(`[usePercentageSlider] WARNING: Invalid transaction amount for ID ${transaction.id}`);
        return;
      }
      
      // Проверяем, есть ли правила распределения в транзакции
      if (transaction.distributionRules && transaction.distributionRules.length > 0) {
        // Находим правило для текущего владельца
        const rule = transaction.distributionRules.find(rule => rule.ownerId === ownerId);
        
        if (rule) {
          // Проверка наличия процента в правиле
          if (rule.percentage === undefined || rule.percentage === null) {
            console.warn(`[usePercentageSlider] WARNING: Missing percentage in rule for transaction ${transaction.id}`);
            return;
          }
          
          // Рассчитываем сумму согласно проценту в правиле
          const amountForOwner = transactionAmount * (rule.percentage / 100);
          console.log(`[usePercentageSlider] Transaction ${transaction.id}: ${amountForOwner} for owner ${ownerId} (${rule.percentage}%)`);
          participantTotal += amountForOwner;
        }
      } else if (transaction.responsibleOwnerIds && transaction.responsibleOwnerIds.includes(ownerId)) {
        // Если нет правил, но пользователь ответственен за транзакцию
        // Проверка на валидность списка ответственных
        if (!Array.isArray(transaction.responsibleOwnerIds) || transaction.responsibleOwnerIds.length === 0) {
          console.warn(`[usePercentageSlider] WARNING: Invalid responsibleOwnerIds for transaction ${transaction.id}`);
          return;
        }
        
        // Делим поровну между всеми ответственными владельцами
        const shareAmount = transactionAmount / transaction.responsibleOwnerIds.length;
        console.log(`[usePercentageSlider] Transaction ${transaction.id}: ${shareAmount} for owner ${ownerId} (equal share)`);
        participantTotal += shareAmount;
      }
    });
    
    console.log(`[usePercentageSlider] Total for participant ${ownerId}: ${participantTotal} (processed ${processedCount} transactions)`);
    
    // Финальная проверка на валидность результата
    if (isNaN(participantTotal)) {
      console.error('[usePercentageSlider] ERROR: Calculated amount is NaN');
      return 0;
    }
    
    return participantTotal;
  };
  
  // НОВАЯ ФУНКЦИЯ: Рассчитываем реальное процентное распределение на основе фактических трат
  const actualPercentages = computed(() => {
    console.log('[usePercentageSlider] Calculating actual percentages...');
    
    // Получаем суммы для каждого участника
    const amount1 = getParticipantAmount(0);
    const amount2 = getParticipantAmount(1);
    
    console.log(`[usePercentageSlider] DEBUG: Amount for participant 0: ${amount1}`);
    console.log(`[usePercentageSlider] DEBUG: Amount for participant 1: ${amount2}`);
    
    const total = amount1 + amount2;
    console.log(`[usePercentageSlider] DEBUG: Total amount: ${total}`);
    
    // Защита от деления на ноль
    if (total === 0 || isNaN(total)) {
      console.log('[usePercentageSlider] WARNING: Total amount is zero or NaN, returning default 50/50');
      return [50, 50]; // По умолчанию 50/50
    }
    
    const percent1 = Math.round((amount1 / total) * 100);
    const percent2 = 100 - percent1; // Чтобы было точно 100% в сумме
    
    console.log(`[usePercentageSlider] Actual percentage distribution: ${percent1}% / ${percent2}%`);
    
    // Дополнительная проверка на валидность результата
    if (isNaN(percent1) || isNaN(percent2)) {
      console.log('[usePercentageSlider] ERROR: Calculated percentages are NaN, returning default 50/50');
      return [50, 50];
    }
    
    return [percent1, percent2];
  });
  
  // Форматирование суммы с новым форматом
  const formatParticipantAmount = (index) => {
    const amount = getParticipantAmount(index);
    const currency = currentBook.value?.currency;
    return formatBalance(amount, 5, currency);
  };
  
  // Получение стиля для слайдера
  const getSliderStyle = () => {
    console.log('[usePercentageSlider] Getting slider style');
    
    // Выбираем процентное значение
    // Если есть актуальные проценты, используем их, иначе используем базовые
    let percentage = 50; // значение по умолчанию
    
    if (actualPercentages.value && actualPercentages.value.length >= 2) {
      percentage = actualPercentages.value[0];
      console.log(`[usePercentageSlider] Using actual percentage for gradient: ${percentage}%`);
    } else {
      percentage = actualOwnerDistribution.value;
      console.log(`[usePercentageSlider] Using default percentage for gradient: ${percentage}%`);
    }
    
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
    
    console.log(`[usePercentageSlider] Using colors for gradient - left: ${leftColor}, right: ${rightColor}`);
    
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
    actualPercentages, // Экспортируем новую функцию
    getParticipantAmount,
    formatParticipantAmount,
    getSliderStyle,
    getParticipantStyle,
    updateOwnerDistribution
  };
}