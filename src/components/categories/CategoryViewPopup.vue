.filter-group {
  display: flex;
  gap: 10px;
}<!-- src/components/categories/CategoryViewPopup.vue -->
<template>
  <BasePopup 
    v-model="isVisible" 
    :closeOnOverlayClick="true"
    :rightContent="true"
    :extendedMode="isCalendarVisible"
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
    
    <!-- Правая кнопка (редактирование) с классом edit-button -->
    <template #rightContent>
      <div class="edit-button" @click="handleEdit">Edit</div>
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
          <!-- Иконка "Share" с индикацией состояния isShared -->
          <div 
            class="action-icon-wrapper" 
            :class="{ 'active': category?.isShared }"
            @click="toggleSharing"
          >
            <IconShare :color="category?.isShared ? '#A44942' : '#7A7A7D'" size="20" />
          </div>
          
          <!-- Иконка "Stats" с индикацией состояния useInStats -->
          <div 
            class="action-icon-wrapper" 
            :class="{ 'active': category?.useInStats }"
            @click="toggleStats"
          >
            <IconChartPie :color="category?.useInStats ? '#53B794' : '#7A7A7D'" size="20" />
          </div>
        </div>
      </div>
      
      <!-- Фильтр периода с обработчиком видимости календаря -->
      <DateFilter 
        ref="dateFilterRef"
        v-model="dateFilter" 
        @update:modelValue="handleDateFilterChange"
        @calendar-visibility-change="handleCalendarVisibilityChange" 
      />
      
      <!-- Список транзакций -->
      <div 
        class="transactions-container" 
        v-if="Object.keys(groupedTransactions).length > 0"
      >
        <TransactionDateGroup 
          v-for="(transactions, dateKey) in groupedTransactions" 
          :key="dateKey"
          :date="dateKey"
          :totalAmount="getDateTotal(transactions)"
          :currency="transactions[0]?.currency || 'Rp'"
        >
          <TransactionItem
            v-for="transaction in transactions"
            :key="transaction.id"
            :transaction="transaction"
            :title="getTransactionTitle(transaction)"
            :subtitle="getTransactionSubtitle(transaction)"
            :accountName="getAccountName(transaction)"
            :iconName="getTransactionIconName(transaction)"
            :iconColor="category?.color || '#D9D9D9'"
            :withBorder="transactions.indexOf(transaction) < transactions.length - 1"
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import BasePopup from '../ui/BasePopup.vue';
import CategoryIcon from './CategoryIcon.vue';
import DateFilter from '../ui/filters/DateFilter.vue';
import TransactionDateGroup from '../transactions/ViewTransaction/TransactionDateGroup.vue';
import TransactionItem from '../transactions/ViewTransaction/TransactionItem.vue';
import { 
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
import type { Transaction } from '../../stores/transaction/types';

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

// Состояние для отслеживания видимости календаря
const isCalendarVisible = ref(false);

// Ссылка на компонент DateFilter
const dateFilterRef = ref(null);

// Обработчик события изменения видимости календаря
const handleCalendarVisibilityChange = (isVisible) => {
  console.log('Calendar visibility changed:', isVisible);
  isCalendarVisible.value = isVisible;
};

// Метод для программного закрытия календаря
const closeCalendar = () => {
  if (dateFilterRef.value && typeof dateFilterRef.value.forceCloseCalendar === 'function') {
    dateFilterRef.value.forceCloseCalendar();
  }
  isCalendarVisible.value = false;
};

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

// Получение книг из BookStore
const bookNames = computed(() => {
  if (!category.value?.books || category.value.books.length === 0) {
    return 'No books';
  }
  
  // Преобразуем ID книг в имена, используя BookStore
  const bookNames = category.value.books.map(bookId => {
    const book = bookStore.getBookById(bookId);
    return book ? book.name : bookId.charAt(0).toUpperCase() + bookId.slice(1);
  });
  
  if (bookNames.length <= 2) {
    return bookNames.join(', ');
  } else {
    return `${bookNames[0]}, ${bookNames[1]} +${bookNames.length - 2}`;
  }
});

// НОВЫЕ МЕТОДЫ ДЛЯ РАБОТЫ С SHARING И STATS
const toggleSharing = () => {
  if (!category.value) return;
  
  const newState = !category.value.isShared;
  categoryStore.toggleCategoryShared(category.value.id, newState);
};

const toggleStats = () => {
  if (!category.value) return;
  
  const newState = !category.value.useInStats;
  categoryStore.toggleCategoryStats(category.value.id, newState);
};

// Фильтры по периоду
const dateFilter = ref({
  period: 'monthly',
  date: new Date(),
  dateRange: [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()] as [Date, Date]
});

// Хранение отфильтрованных транзакций
const categoryTransactions = ref<Transaction[]>([]);

// Обработчик изменения фильтра дат
const handleDateFilterChange = (value) => {
  console.log('CategoryViewPopup received date filter:', value);
  console.log('Filter period:', value.period);
  console.log('Filter date:', value.date);
  console.log('Filter dateRange:', value.dateRange);
  console.log('Filter dateFrom:', value.dateFrom);
  console.log('Filter dateTo:', value.dateTo);
  applyFilters();
};

// Фильтрация
const applyFilters = () => {
  if (!props.categoryId) return;
  
  console.log('Starting applyFilters...');
  console.log('Current dateFilter:', JSON.stringify(dateFilter.value));
  
  // Базовый фильтр по категории
  const filters = {
    categoryIds: [props.categoryId]
  };
  
  // Добавляем фильтр по дате в зависимости от периода
  if (dateFilter.value.period === 'daily') {
    console.log('Daily period detected');
    
    // В режиме daily для фильтра используем dateRange
    if (dateFilter.value.dateRange && dateFilter.value.dateRange.length === 2) {
      // Преобразуем даты в формат Date и задаем правильное время
      const dateFrom = new Date(dateFilter.value.dateRange[0]);
      dateFrom.setHours(0, 0, 0, 0); // Начало дня
      
      const dateTo = new Date(dateFilter.value.dateRange[1]);
      dateTo.setHours(23, 59, 59, 999); // Конец дня
      
      console.log('Using dateRange:', dateFrom, dateTo);
      filters.dateFrom = dateFrom;
      filters.dateTo = dateTo;
    } else {
      console.warn('Invalid dateRange format for daily period:', dateFilter.value.dateRange);
    }
  } else if (dateFilter.value.period === 'monthly' && dateFilter.value.date) {
    console.log('Monthly period detected');
    // Для месячного периода - весь месяц
    const date = new Date(dateFilter.value.date);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999); // Конец дня
    
    console.log('Setting monthly range:', firstDay, lastDay);
    filters.dateFrom = firstDay;
    filters.dateTo = lastDay;
  } else if (dateFilter.value.period === 'yearly' && dateFilter.value.date) {
    console.log('Yearly period detected');
    // Для годового периода - весь год
    const year = dateFilter.value.date.getFullYear();
    const firstDay = new Date(year, 0, 1);
    const lastDay = new Date(year, 11, 31);
    lastDay.setHours(23, 59, 59, 999); // Конец дня
    
    console.log('Setting yearly range:', firstDay, lastDay);
    filters.dateFrom = firstDay;
    filters.dateTo = lastDay;
  } else {
    console.warn('Unsupported or incomplete filter configuration:', dateFilter.value);
  }
  
  console.log('Final filters to apply:', filters);
  
  // Устанавливаем фильтры в хранилище
  transactionStore.setFilters(filters);
  
  // Получаем отфильтрованные транзакции
  const filtered = transactionStore.filteredTransactions;
  console.log('Current transactionStore filters:', transactionStore.currentFilters);
  console.log(`Found ${filtered.length} transactions for category ${props.categoryId}`);
  
  if (filtered.length > 0) {
    console.log('First transaction example:', {
      id: filtered[0].id,
      date: filtered[0].date,
      amount: filtered[0].amount,
      description: filtered[0].description
    });
  }
  
  categoryTransactions.value = [...filtered];
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
    
    // Проверяем, не добавлена ли уже эта транзакция
    const isDuplicate = groups[dateKey].some(t => t.id === transaction.id);
    if (!isDuplicate) {
      groups[dateKey].push(transaction);
    }
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
  // Используем описание транзакции или название книги
  if (transaction.description) {
    return transaction.description;
  }
  
  // Получаем название книги из BookStore
  const book = bookStore.getBookById(transaction.bookId);
  return book ? book.name : 'Unknown';
};

// Получение подзаголовка транзакции
const getTransactionSubtitle = (transaction) => {
  // Получаем имя пользователя из UserStore
  const user = userStore.getUserById?.(transaction.executedByOwnerId);
  // Если getUserById не существует или не вернул пользователя, используем запасной вариант
  if (user) {
    return user.name || 'Unknown';
  }
  
  // Запасной вариант
  const userMap = {
    'user_1': 'Me',
    'user_2': 'Wife'
  };
  return userMap[transaction.executedByOwnerId] || 'Unknown';
};

// Получение имени счета
const getAccountName = (transaction) => {
  // Запасной вариант для названий счетов
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
  // Иконки по типу транзакции
  const typeIconMap = {
    'expense': 'shopping',
    'income': 'coin',
    'transfer': 'credit-card'
  };
  
  return typeIconMap[transaction.type] || 'wallet';
};

// Обработчики событий
const handleClose = () => {
  // Сбрасываем фильтры при закрытии
  resetFilters();
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

// Сброс фильтров
const resetFilters = () => {
  console.log('Resetting all filters in transactionStore');
  transactionStore.resetFilters();
};

// Убедимся, что сторы инициализированы перед загрузкой данных
const ensureStoresInitialized = async () => {
  if (!bookStore.isInitialized) await bookStore.init();
  if (!transactionStore.isInitialized) await transactionStore.init();
  if (!categoryStore.isInitialized) await categoryStore.init();
  
  // После инициализации сторов применяем фильтры
  applyFilters();
};

// Отслеживаем изменение категории
watch(() => props.categoryId, (newValue, oldValue) => {
  console.log(`Category changed from ${oldValue} to ${newValue}`);
  if (transactionStore.isInitialized && newValue !== oldValue) {
    applyFilters();
  }
});

// Отслеживаем изменение видимости компонента
watch(() => props.modelValue, (isVisible) => {
  console.log(`Popup visibility changed to ${isVisible}`);
  if (isVisible && props.categoryId) {
    applyFilters();
  }
});

// Отслеживаем изменения в самом объекте dateFilter
watch(() => dateFilter.value, (newValue, oldValue) => {
  console.log('DateFilter object changed:', newValue);
  console.log('Previous value was:', oldValue);
  if (props.modelValue && props.categoryId) {
    applyFilters();
  }
}, { deep: true });

// Инициализация
onMounted(() => {
  // Очищаем данные при монтировании
  categoryTransactions.value = [];
  ensureStoresInitialized();
});

// Сбрасываем фильтры при размонтировании
onUnmounted(() => {
  resetFilters();
});
</script>

<style scoped>
.category-view-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  position: relative; /* Для корректного позиционирования элементов */
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
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  margin-top: 0px;
  padding: 0 10px;
  box-sizing: border-box;
}

.filter-badge {
  height: 28px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  gap: 10px;
}

.action-icon-wrapper {
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
  margin: 0 2px;
}

.action-icon-wrapper:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.action-icon-wrapper.active {
  opacity: 1;
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

/* Стили для календаря - эти стили могут быть переопределены в DateFilter.vue */
:deep(.calendar-container) {
  z-index: 1000;
}
</style>