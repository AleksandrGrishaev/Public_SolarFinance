<!-- src/components/categories/CategoryViewPopup.vue -->
<template>
    <BasePopup 
      v-model="isVisible" 
      :closeOnOverlayClick="true"
      @update:modelValue="handleClose"
    >
      <!-- Кастомный заголовок со слотом title -->
      <template #title>
        <div class="category-title-container">
          <CategoryIcon 
            :icon-name="category?.icon || ''" 
            :background-color="category?.color || '#F5C54C'"
            size="medium" 
          />
          <div class="category-title-wrapper">
            <div v-if="category?.parentName" class="parent-name">
              {{ category?.parentName }}
            </div>
            <div class="category-name">
              {{ category?.name || 'Category' }}
            </div>
          </div>
        </div>
      </template>
      
      <!-- Левая иконка (закрытие) -->
      <template #leftIcon>
        <IconX color="#A44942" class="icon-close" />
      </template>
      
      <!-- Правая иконка (редактирование) -->
      <template #rightIcon>
        <div class="edit-button" @click="handleEdit">
          Edit
        </div>
      </template>
      
      <div class="category-view-container">
        <!-- Фильтры и информация -->
        <div class="info-filters">
          <!-- Книга -->
          <div class="filter-badge book-badge">
            <IconBook color="white" size="20" />
            <div class="badge-text">{{ bookNames }}</div>
          </div>
          
          <!-- Тип транзакции -->
          <div class="filter-badge type-badge">
            <div class="badge-text">{{ categoryType }}</div>
          </div>
          
          <!-- Иконки действий -->
          <div class="action-icons">
            <IconShare color="#A44942" size="24" />
            <IconChartPie color="#53B794" size="24" />
          </div>
        </div>
        
        <!-- Фильтр периода -->
        <DateFilter v-model="dateFilter" />
        
        <!-- Список транзакций -->
        <div class="transactions-container" v-if="Object.keys(groupedTransactions).length > 0">
          <TransactionDateGroup 
            v-for="(transactions, dateKey) in groupedTransactions" 
            :key="dateKey"
            :date="dateKey"
            :totalAmount="getDateTotal(transactions)"
            :currency="transactions[0]?.currency || 'Rp'"
          >
            <TransactionItem
              v-for="(transaction, index) in transactions"
              :key="transaction.id"
              :transaction="transaction"
              :title="getTransactionTitle(transaction)"
              :subtitle="getTransactionSubtitle(transaction)"
              :accountName="getAccountName(transaction)"
              :iconName="getTransactionIconName(transaction)"
              :iconColor="category?.color || '#D9D9D9'"
              :withBorder="index < transactions.length - 1"
              @click="handleTransactionClick(transaction)"
            />
          </TransactionDateGroup>
        </div>
        
        <!-- Пустое состояние при отсутствии транзакций -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <IconReceipt2 size="48" color="#949496" />
          </div>
          <div class="empty-text">No transactions found for this period</div>
        </div>
      </div>
    </BasePopup>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import BasePopup from '../ui/BasePopup.vue';
  import CategoryIcon from './CategoryIcon.vue';
  import DateFilter from '../ui/filters/DateFilter.vue';
  import TransactionDateGroup from '../transactions/ViewTransaction/TransactionDateGroup.vue';
  import TransactionItem from '../transactions/ViewTransaction/TransactionItem.vue';
  import { 
    IconX,
    IconBook,
    IconShare,
    IconChartPie,
    IconReceipt2,
  } from '@tabler/icons-vue';
  
  import { useCategoryStore } from '../../stores/category';
  import { useBookStore } from '../../stores/book';
  import { useAccountStore } from '../../stores/account';
  import { useTransactionStore } from '../../stores/transaction';
  import { useUserStore } from '../../stores/user';
  
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    categoryId: {
      type: String,
      default: ''
    }
  });
  
  const emit = defineEmits(['update:modelValue', 'edit']);
  
  // Сторы
  const categoryStore = useCategoryStore();
  const bookStore = useBookStore();
  const accountStore = useAccountStore();
  const transactionStore = useTransactionStore();
  const userStore = useUserStore();
  
  // Состояние
  const isVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  });
  
  // Текущая категория
  const category = computed(() => {
    if (!props.categoryId) return null;
    return categoryStore.getCategoryById(props.categoryId);
  });
  
  // Типы и книги
  const categoryType = computed(() => {
    if (!category.value?.type) return 'Unknown';
    
    const typeMap = {
      'expense': 'Expense',
      'income': 'Income',
      'transfer': 'Transfer'
    };
    
    return typeMap[category.value.type] || category.value.type;
  });
  
  const bookNames = computed(() => {
    if (!category.value?.books || category.value.books.length === 0) {
      return 'No books';
    }
    
    // Преобразуем ID книг в имена
    const bookNames = category.value.books.map(bookId => {
      // Найти книгу по ID в списке доступных книг
      const book = availableBooks.value.find(b => b.id === bookId);
      return book ? book.name : bookId.charAt(0).toUpperCase() + bookId.slice(1);
    });
    
    if (bookNames.length <= 2) {
      return bookNames.join(', ');
    } else {
      return `${bookNames[0]}, ${bookNames[1]} +${bookNames.length - 2}`;
    }
  });
  
  // Фильтры по периоду
  const dateFilter = ref({
    period: 'monthly',
    date: new Date()
  });
  
  // Список книг
  const availableBooks = computed(() => {
    // В реальном приложении эти данные должны приходить из BookStore
    return [
      { id: 'my', name: 'My Book' },
      { id: 'family', name: 'Family' },
      { id: 'wife', name: 'Wife' }
    ];
  });
  
  // Получение транзакций для выбранной категории
  const categoryTransactions = ref([]);
  
  // Загрузка транзакций
  const loadTransactions = () => {
    if (!props.categoryId) return;
    
    // В реальном приложении здесь должен быть вызов transactionStore.getTransactionsByCategory
    // с учетом выбранного периода
    const allTransactions = transactionStore.getAllTransactions();
    
    // Фильтруем транзакции по категории и периоду
    const filteredTransactions = allTransactions.filter(transaction => {
      if (transaction.categoryId !== props.categoryId) return false;
      
      const transactionDate = new Date(transaction.date);
      const filterDate = new Date(dateFilter.value.date);
      
      // Фильтрация по периоду
      switch (dateFilter.value.period) {
        case 'weekly': {
          // Начало недели (понедельник)
          const weekStart = new Date(filterDate);
          weekStart.setDate(filterDate.getDate() - filterDate.getDay() + 1);
          weekStart.setHours(0, 0, 0, 0);
          
          // Конец недели (воскресенье)
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          
          return transactionDate >= weekStart && transactionDate <= weekEnd;
        }
        case 'monthly': {
          return transactionDate.getMonth() === filterDate.getMonth() && 
                 transactionDate.getFullYear() === filterDate.getFullYear();
        }
        case 'yearly': {
          return transactionDate.getFullYear() === filterDate.getFullYear();
        }
        default:
          return true;
      }
    });
    
    categoryTransactions.value = filteredTransactions;
  };
  
  // Группировка транзакций по датам
  const groupedTransactions = computed(() => {
    const groups = {};
    
    categoryTransactions.value.forEach(transaction => {
      const dateKey = transaction.date instanceof Date 
        ? transaction.date.toISOString().split('T')[0]
        : new Date(transaction.date).toISOString().split('T')[0];
        
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });
    
    // Сортировка дат в обратном порядке (сначала новые)
    return Object.fromEntries(
      Object.entries(groups)
        .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
    );
  });
  
  // Получение общей суммы за день
  const getDateTotal = (transactions) => {
    return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  };
  
  // Получение заголовка транзакции
  const getTransactionTitle = (transaction) => {
    // В реальном приложении нужно использовать bookStore.getBookName
    const bookMap = {
      'my': 'Alex book',
      'family': 'Family book',
      'wife': 'Wife book'
    };
    
    return transaction.description || bookMap[transaction.bookId] || 'Unknown';
  };
  
  // Получение подзаголовка транзакции
  const getTransactionSubtitle = (transaction) => {
    // В реальном приложении нужно использовать userStore.getUserName
    const userMap = {
      'user_1': 'Me',
      'user_2': 'Wife'
    };
    
    return userMap[transaction.executedByOwnerId] || 'Unknown';
  };
  
  // Получение имени счета
  const getAccountName = (transaction) => {
    // В реальном приложении нужно использовать accountStore.getAccountName
    const accountMap = {
      'card1': 'Card',
      'card2': 'Family Card',
      'card3': 'Wife Card',
      'bank1': 'Bank',
      'bank2': 'Bank 2',
      'cash1': 'Cash'
    };
    
    if (transaction.type === 'expense') {
      return accountMap[transaction.sourceEntityId] || 'Unknown';
    } else {
      return accountMap[transaction.destinationEntityId] || 'Unknown';
    }
  };
  
  // Получение имени иконки для транзакции
  const getTransactionIconName = (transaction) => {
    // В реальном приложении нужно использовать иконку категории
    // Здесь просто по типу возвращаем иконки
    const typeIconMap = {
      'expense': 'shopping',
      'income': 'coin',
      'transfer': 'credit-card'
    };
    
    return typeIconMap[transaction.type] || 'wallet';
  };
  
  // Обработчики событий
  const handleClose = () => {
    emit('update:modelValue', false);
  };
  
  const handleEdit = () => {
    if (!category.value) return;
    emit('edit', category.value);
  };
  
  const handleTransactionClick = (transaction) => {
    console.log('Transaction clicked:', transaction);
    // Здесь должен быть код для открытия детального просмотра транзакции
  };
  
  // Обновляем транзакции при изменении фильтров
  watch([() => props.categoryId, dateFilter], () => {
    loadTransactions();
  }, { immediate: true });
  
  // Инициализация
  onMounted(() => {
    loadTransactions();
  });
  </script>
  
  <style scoped>
  .category-view-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }
  
  /* Стили для кастомного заголовка */
  .category-title-container {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .category-title-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .parent-name {
    color: white;
    font-size: 16px;
    font-weight: 400;
    line-height: 20px;
  }
  
  .category-name {
    color: white;
    font-size: 20px;
    font-weight: 500;
    line-height: 24px;
  }
  
  .edit-button {
    color: #DBDADD;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    cursor: pointer;
  }
  
  /* Фильтры и информация */
  .info-filters {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
    margin-top: 8px;
  }
  
  .filter-badge {
    height: 32px;
    padding: 6px 10px 6px 13px;
    background: #46484A;
    border-radius: 28px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .book-badge {
    display: flex;
    align-items: center;
  }
  
  .badge-text {
    color: white;
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    white-space: nowrap;
  }
  
  .action-icons {
    display: flex;
    gap: 5px;
  }
  
  .transactions-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }
  
  /* Пустое состояние */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 32px 0;
    text-align: center;
  }
  
  .empty-icon {
    width: 48px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .empty-text {
    color: #949496;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
  }
  </style>