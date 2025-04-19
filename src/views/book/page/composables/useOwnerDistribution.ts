// src/views/book/page/composables/useOwnerDistribution.ts
import { computed } from 'vue';
import useBookData from './useBookData';

export default function useOwnerDistribution(bookIdProp: string, emit: any) {
  // Получаем базовые данные о книге
  const {
    bookData,
    filteredTransactions,
    getTransactionAmount,
    targetCurrency,
    isAllBooks,
    userStore
  } = useBookData(bookIdProp, emit);
  
  // Расчет распределения расходов между владельцами
  const ownerExpenseDistribution = computed(() => {
    console.log('[DEBUG] Starting ownerExpenseDistribution calculation');
    console.log('[DEBUG] isAllBooks:', isAllBooks.value);
    console.log('[DEBUG] bookData:', JSON.stringify(bookData.value));
    console.log('[DEBUG] bookData.distributionRules:', bookData.value?.distributionRules);
    
    try {
      // Если не выбрана конкретная книга или она не имеет правил распределения, возвращаем пустой результат
      if (isAllBooks.value || !bookData.value.distributionRules || bookData.value.distributionRules.length < 2) {
        console.log('[DEBUG] Early return from ownerExpenseDistribution: no valid distribution rules');
        return null;
      }
      
      // Получаем ID владельцев из правил распределения
      const ownerIds = bookData.value.distributionRules.map(rule => rule.ownerId);
      console.log('[DEBUG] Owner IDs:', ownerIds);
      
      // Инициализируем суммы для каждого владельца
      const ownerAmounts = {};
      ownerIds.forEach(id => {
        ownerAmounts[id] = 0;
      });
      console.log('[DEBUG] Initial ownerAmounts:', ownerAmounts);
      
      // Получаем отфильтрованные транзакции
      const transactions = filteredTransactions.value.filter(t => t.type === 'expense');
      console.log('[DEBUG] Filtered transactions count:', transactions.length);
      
      // Суммируем расходы по каждому владельцу с учетом правил распределения
      transactions.forEach((transaction, index) => {
        console.log(`[DEBUG] Processing transaction ${index}:`, transaction.id, transaction.amount, transaction.currency);
        
        // Если у транзакции есть свои правила распределения, используем их
        if (transaction.distributionRules && transaction.distributionRules.length > 0) {
          console.log(`[DEBUG] Transaction ${transaction.id} has custom distribution rules:`, transaction.distributionRules);
          const amount = getTransactionAmount(transaction, targetCurrency.value);
          console.log(`[DEBUG] Transaction amount in target currency:`, amount);
          
          transaction.distributionRules.forEach(rule => {
            const ownerId = rule.ownerId;
            if (ownerAmounts[ownerId] !== undefined) {
              const ownerAmount = Math.abs(amount) * (rule.percentage / 100);
              ownerAmounts[ownerId] += ownerAmount;
              console.log(`[DEBUG] Owner ${ownerId} added amount:`, ownerAmount, 'total now:', ownerAmounts[ownerId]);
            } else {
              console.log(`[DEBUG] Owner ${ownerId} not found in ownerAmounts`);
            }
          });
        } 
        // Если нет правил распределения, применяем общие правила книги
        else {
          console.log(`[DEBUG] Transaction ${transaction.id} uses book distribution rules`);
          const amount = getTransactionAmount(transaction, targetCurrency.value);
          console.log(`[DEBUG] Transaction amount in target currency:`, amount);
          
          bookData.value.distributionRules.forEach(rule => {
            const ownerId = rule.ownerId;
            const ownerAmount = Math.abs(amount) * (rule.percentage / 100);
            ownerAmounts[ownerId] += ownerAmount;
            console.log(`[DEBUG] Owner ${ownerId} added amount:`, ownerAmount, 'total now:', ownerAmounts[ownerId]);
          });
        }
      });
      
      // Расчет общей суммы расходов
      const totalExpense = Object.values(ownerAmounts).reduce((sum, val) => sum + Number(val), 0);
      console.log('[DEBUG] Total expense:', totalExpense);
      
      // Расчет процентного соотношения трат
      const result = {
        totalExpense,
        ownerAmounts,
        ownerPercentages: {}
      };
      
      // Вычисляем процентное соотношение, если общая сумма больше 0
      if (totalExpense > 0) {
        Object.keys(ownerAmounts).forEach(ownerId => {
          result.ownerPercentages[ownerId] = (ownerAmounts[ownerId] / totalExpense) * 100;
          console.log(`[DEBUG] Owner ${ownerId} percentage:`, result.ownerPercentages[ownerId]);
        });
      } else {
        // Если нет расходов, используем проценты из правил распределения книги
        console.log('[DEBUG] No expenses, using default distribution rules');
        bookData.value.distributionRules.forEach(rule => {
          result.ownerPercentages[rule.ownerId] = rule.percentage;
          console.log(`[DEBUG] Owner ${rule.ownerId} default percentage:`, rule.percentage);
        });
      }
      
      console.log('[DEBUG] Final result of ownerExpenseDistribution:', result);
      return result;
    } catch (error) {
      console.error('[useOwnerDistribution] Error calculating owner expense distribution:', error);
      console.error('[DEBUG] Error stack:', error.stack);
      return null;
    }
  });
  
  // Инициализация данных владельцев для слайдера с защитой от ошибок
  const ownerSides = computed(() => {
    console.log('[DEBUG] Starting ownerSides calculation');
    console.log('[DEBUG] bookData.distributionRules:', bookData.value?.distributionRules);
    console.log('[DEBUG] ownerExpenseDistribution:', ownerExpenseDistribution.value);
    
    try {
      // Проверяем, есть ли правила распределения и достаточно ли их
      if (!bookData.value.distributionRules || bookData.value.distributionRules.length < 2) {
        console.log('[DEBUG] No distribution rules, returning default values');
        // Возвращаем значения по умолчанию, если правил распределения нет
        return [
          { name: 'Alex', id: 'me', percentage: 50, amount: 0 },
          { name: 'Sasha Solar', id: 'other', percentage: 50, amount: 0 }
        ];
      }
  
      // Получаем данные о фактическом распределении расходов
      const distribution = ownerExpenseDistribution.value;
      console.log('[DEBUG] Distribution data:', distribution);
      
      // Получаем всех пользователей
      const allUsers = userStore.getAllUsers();
      console.log('[DEBUG] All users:', allUsers.map(u => ({ id: u.id, name: u.name })));
      
      // Получаем данные о владельцах из правил распределения
      console.log('[DEBUG] Creating ownerSides from distribution rules');
      const ownersData = bookData.value.distributionRules.map(rule => {
        console.log('[DEBUG] Processing rule for owner:', rule.ownerId, rule.percentage);
        // Находим пользователя по ID
        const user = allUsers.find(user => user.id === rule.ownerId);
        console.log('[DEBUG] Found user:', user ? user.name : 'Not found');
        
        // Проверяем, есть ли данные о фактическом распределении для этого владельца
        const hasDistributionPercentage = !!(
          distribution && 
          distribution.ownerPercentages && 
          distribution.ownerPercentages[rule.ownerId] !== undefined
        );
        
        const hasDistributionAmount = !!(
          distribution && 
          distribution.ownerAmounts && 
          distribution.ownerAmounts[rule.ownerId] !== undefined
        );
        
        console.log(`[DEBUG] Owner ${rule.ownerId} has distribution percentage:`, hasDistributionPercentage);
        console.log(`[DEBUG] Owner ${rule.ownerId} has distribution amount:`, hasDistributionAmount);
        
        // Создаем объект с информацией о владельце
        const ownerInfo = {
          name: user ? user.name : 'Unknown',
          id: rule.ownerId,
          // Если есть данные о фактическом распределении, используем их
          percentage: hasDistributionPercentage
            ? distribution.ownerPercentages[rule.ownerId] 
            : rule.percentage,
          // Добавляем сумму расходов владельца, если она доступна
          amount: hasDistributionAmount
            ? distribution.ownerAmounts[rule.ownerId]
            : 0
        };
        
        console.log('[DEBUG] Created owner info:', ownerInfo);
        return ownerInfo;
      });
      
      // Убедимся, что есть хотя бы два владельца
      if (ownersData.length < 2) {
        console.log('[DEBUG] Less than 2 owners, adding a second one');
        // Добавим второго владельца, если его нет
        ownersData.push({
          name: 'User 2',
          id: 'unknown',
          percentage: 100 - (ownersData[0]?.percentage || 50),
          amount: 0
        });
      }
      
      console.log('[DEBUG] Final ownerSides data:', ownersData);
      return ownersData;
    } catch (error) {
      console.error('[useOwnerDistribution] Error calculating owner sides:', error);
      console.error('[DEBUG] Error stack:', error.stack);
      // Возвращаем значения по умолчанию при ошибке
      return [
        { name: 'User 1', id: 'user1', percentage: 50, amount: 0 },
        { name: 'User 2', id: 'user2', percentage: 50, amount: 0 }
      ];
    }
  });
  
  // Вычисляем реальное процентное соотношение между первым и вторым владельцем
  const actualOwnerDistribution = computed(() => {
    console.log('[DEBUG] Starting actualOwnerDistribution calculation');
    console.log('[DEBUG] ownerSides:', ownerSides.value);
    
    try {
      // Проверяем, существует ли массив и есть ли в нем первый элемент
      if (!ownerSides.value || ownerSides.value.length === 0) {
        console.log('[DEBUG] ownerSides is empty, returning default 50%');
        return 50;
      }
      
      // Проверяем наличие первого элемента и его percentage
      const firstOwner = ownerSides.value[0];
      console.log('[DEBUG] First owner:', firstOwner);
      
      if (!firstOwner || firstOwner.percentage === undefined) {
        console.log('[DEBUG] First owner or percentage not found, returning default 50%');
        return 50;
      }
      
      // Если есть данные о распределении, используем процент первого владельца
      const rounded = Math.round(firstOwner.percentage);
      console.log('[DEBUG] Rounded percentage:', rounded);
      return rounded;
    } catch (error) {
      console.error('[useOwnerDistribution] Error calculating actual owner distribution:', error);
      console.error('[DEBUG] Error stack:', error.stack);
      return 50;
    }
  });
  
  // Расчет суммы для участника (с защитой от ошибок)
  const getParticipantAmount = (index) => {
    console.log(`[DEBUG] Getting participant amount for index ${index}`);
    console.log('[DEBUG] ownerSides:', ownerSides.value);
    console.log('[DEBUG] bookData.totalAmount:', bookData.value?.totalAmount);
    
    try {
      // Проверяем, инициализирован ли массив ownerSides
      if (!ownerSides.value || ownerSides.value.length <= index) {
        console.log(`[DEBUG] ownerSides not initialized or index ${index} out of bounds, returning 0`);
        return 0;
      }
      
      // Если у нас есть данные о распределении, используем их
      if (ownerSides.value[index] && ownerSides.value[index].amount !== undefined) {
        console.log(`[DEBUG] Using pre-calculated amount for index ${index}:`, ownerSides.value[index].amount);
        return ownerSides.value[index].amount;
      }
      
      // Запасной вариант - процентное распределение от общей суммы
      const totalAmount = Math.abs(bookData.value?.totalAmount || 0);
      
      // Определяем процент в зависимости от индекса
      let percentage;
      if (index === 0) {
        percentage = ownerSides.value[0]?.percentage ?? 50;
      } else {
        percentage = index < ownerSides.value.length 
          ? ownerSides.value[index]?.percentage 
          : (100 - (ownerSides.value[0]?.percentage ?? 50));
      }
      
      console.log(`[DEBUG] Calculating from total: ${totalAmount} * ${percentage}% / 100`);
      return totalAmount * (percentage / 100);
    } catch (error) {
      console.error(`[useOwnerDistribution] Error getting participant amount for index ${index}:`, error);
      console.error('[DEBUG] Error stack:', error.stack);
      return 0;
    }
  };
  
  // Обновление значения слайдера (теперь просто для отображения)
  const updateOwnerDistribution = (event) => {
    // Ничего не делаем - слайдер только для отображения
    console.log('[useOwnerDistribution] Slider is now read-only');
  };
  
  return {
    ownerExpenseDistribution,
    ownerSides,
    actualOwnerDistribution,
    getParticipantAmount,
    updateOwnerDistribution,
    bookData
  };
}