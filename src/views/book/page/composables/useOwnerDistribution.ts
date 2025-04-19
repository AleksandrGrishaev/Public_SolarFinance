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
    userStore,
    bookStore,
    bookId
  } = useBookData(bookIdProp, emit);
  
  // Получение правил распределения напрямую из BookStore
  const bookDistributionRules = computed(() => {
    // Если выбраны все книги, возвращаем пустой массив
    if (isAllBooks.value) {
      return [];
    }
    
    // Получаем книгу напрямую из хранилища
    const book = bookStore.getBookById(bookId.value);
    
    // Проверяем наличие правил распределения
    if (book && book.distributionRules && book.distributionRules.length > 0) {
      return book.distributionRules;
    }
    
    // Если правил нет, возвращаем пустой массив
    return [];
  });

  // Проверка наличия правил распределения
  const hasDistributionRules = computed(() => {
    return bookDistributionRules.value.length >= 2;
  });
  
  // Расчет распределения расходов между владельцами
  const ownerExpenseDistribution = computed(() => {
    try {
      // Если не выбрана конкретная книга или она не имеет правил распределения, возвращаем пустой результат
      if (isAllBooks.value || !hasDistributionRules.value) {
        return null;
      }
      
      // Получаем ID владельцев из правил распределения
      const ownerIds = bookDistributionRules.value.map(rule => rule.ownerId);
      
      // Инициализируем суммы для каждого владельца
      const ownerAmounts = {};
      ownerIds.forEach(id => {
        ownerAmounts[id] = 0;
      });
      
      // Получаем отфильтрованные транзакции
      const transactions = filteredTransactions.value.filter(t => t.type === 'expense');
      
      // Суммируем расходы по каждому владельцу с учетом правил распределения
      transactions.forEach(transaction => {
        // Если у транзакции есть свои правила распределения, используем их
        if (transaction.distributionRules && transaction.distributionRules.length > 0) {
          const amount = getTransactionAmount(transaction, targetCurrency.value);
          
          transaction.distributionRules.forEach(rule => {
            const ownerId = rule.ownerId;
            if (ownerAmounts[ownerId] !== undefined) {
              const ownerAmount = Math.abs(amount) * (rule.percentage / 100);
              ownerAmounts[ownerId] += ownerAmount;
            }
          });
        } 
        // Если нет правил распределения, применяем общие правила книги
        else {
          const amount = getTransactionAmount(transaction, targetCurrency.value);
          
          bookDistributionRules.value.forEach(rule => {
            const ownerId = rule.ownerId;
            const ownerAmount = Math.abs(amount) * (rule.percentage / 100);
            ownerAmounts[ownerId] += ownerAmount;
          });
        }
      });
      
      // Расчет общей суммы расходов
      const totalExpense = Object.values(ownerAmounts).reduce((sum, val) => sum + Number(val), 0);
      
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
        });
      } else {
        // Если нет расходов, используем проценты из правил распределения книги
        bookDistributionRules.value.forEach(rule => {
          result.ownerPercentages[rule.ownerId] = rule.percentage;
        });
      }
      
      return result;
    } catch (error) {
      console.error('[useOwnerDistribution] Error calculating owner expense distribution:', error);
      return null;
    }
  });
  
  // Инициализация данных владельцев для слайдера с защитой от ошибок
  const ownerSides = computed(() => {
    try {
      // Проверяем, есть ли правила распределения и достаточно ли их
      if (!hasDistributionRules.value) {
        // Возвращаем значения по умолчанию, если правил распределения нет
        return [
          { name: 'No data', id: 'unknown', percentage: 50, amount: 0 },
          { name: 'No data', id: 'unknown', percentage: 50, amount: 0 }
        ];
      }
  
      // Получаем данные о фактическом распределении расходов
      const distribution = ownerExpenseDistribution.value;
      
      // Получаем всех пользователей
      const allUsers = userStore.getAllUsers();
      
      // Получаем данные о владельцах из правил распределения
      const ownersData = bookDistributionRules.value.map(rule => {
        // Находим пользователя по ID
        const user = allUsers.find(user => user.id === rule.ownerId);
        
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
        
        return ownerInfo;
      });
      
      // Убедимся, что есть хотя бы два владельца
      if (ownersData.length < 2) {
        // Добавим второго владельца, если его нет
        ownersData.push({
          name: 'No data',
          id: 'unknown',
          percentage: 100 - (ownersData[0]?.percentage || 50),
          amount: 0
        });
      }
      
      return ownersData;
    } catch (error) {
      console.error('[useOwnerDistribution] Error calculating owner sides:', error);
      // Возвращаем значения по умолчанию при ошибке
      return [
        { name: 'No data', id: 'unknown', percentage: 50, amount: 0 },
        { name: 'No data', id: 'unknown', percentage: 50, amount: 0 }
      ];
    }
  });
  
  // Вычисляем реальное процентное соотношение между первым и вторым владельцем
  const actualOwnerDistribution = computed(() => {
    try {
      // Проверяем, существует ли массив и есть ли в нем первый элемент
      if (!ownerSides.value || ownerSides.value.length === 0) {
        return 50;
      }
      
      // Проверяем наличие первого элемента и его percentage
      const firstOwner = ownerSides.value[0];
      
      if (!firstOwner || firstOwner.percentage === undefined) {
        return 50;
      }
      
      // Если есть данные о распределении, используем процент первого владельца
      const rounded = Math.round(firstOwner.percentage);
      return rounded;
    } catch (error) {
      console.error('[useOwnerDistribution] Error calculating actual owner distribution:', error);
      return 50;
    }
  });
  
  // Расчет суммы для участника (с защитой от ошибок)
  const getParticipantAmount = (index) => {
    try {
      // Проверяем, инициализирован ли массив ownerSides
      if (!ownerSides.value || ownerSides.value.length <= index) {
        return 0;
      }
      
      // Если у нас есть данные о распределении, используем их
      if (ownerSides.value[index] && ownerSides.value[index].amount !== undefined) {
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
      
      return totalAmount * (percentage / 100);
    } catch (error) {
      console.error(`[useOwnerDistribution] Error getting participant amount for index ${index}:`, error);
      return 0;
    }
  };
  
  // Обновление значения слайдера (теперь просто для отображения)
  const updateOwnerDistribution = (event) => {
    // Ничего не делаем - слайдер только для отображения
  };
  
  return {
    hasDistributionRules,
    ownerExpenseDistribution,
    ownerSides,
    actualOwnerDistribution,
    getParticipantAmount,
    updateOwnerDistribution,
    bookData,
    bookDistributionRules
  };
}