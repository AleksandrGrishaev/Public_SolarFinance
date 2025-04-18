<!-- src/views/book/page/components/DashBoardBook.vue -->
<template>
    <div class="dashboard-book">
      <!-- Финансовая информация (верхнее поле) -->
      <div class="financial-info bg-contrast">
        <div class="summary-row">
          <!-- Итоговая сумма -->
          <div class="summary-total">
            <div class="amount" :class="getTotalClass(bookData.totalAmount)">{{ formatAmount(bookData.totalAmount) }}</div>
            <div class="label">Total</div>
          </div>
          
          <!-- Доход -->
          <div class="summary-income">
            <div class="amount amount-positive">{{ formatAmount(bookData.incomeAmount) }}</div>
            <div class="label">Income</div>
          </div>
          
          <!-- Расход -->
          <div class="summary-expense">
            <div class="amount amount-negative">{{ formatAmount(bookData.expenseAmount) }}</div>
            <div class="label">Expense</div>
          </div>
          
          <!-- Иконка редактирования/настройки -->
          <div class="summary-edit">
            <button class="edit-button">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.36 3.52L12.48 6.64L4.88 14.24H1.76V11.12L9.36 3.52ZM9.36 2.1L1.04 10.42V14.96H5.58L13.9 6.64L9.36 2.1ZM10.86 5.14L10.14 4.42L11.76 6.06L12.48 5.34L10.86 3.74L11.58 4.44L10.86 5.14Z" fill="#808080"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Слайдер распределения между владельцами -->
        <div v-if="bookData.distributionRules && bookData.distributionRules.length > 1">
          <BasePercentageSlider
            v-model="ownerDistribution"
            :sides="ownerSides"
            :totalValue="bookData.totalAmount"
            :valueFormatter="formatCurrency"
          />
        </div>
        
        <!-- Фильтр даты -->
        <DateFilter v-model="dateFilter" @calendar-visibility-change="onCalendarVisibilityChange" />
      </div>
      
      <!-- Список транзакций -->
      <div class="transactions-list bg-contrast">
        <div class="list-header">
          <h3 class="en-subheading text-header">Recent Transactions</h3>
        </div>
        
        <div v-if="loading" class="loading-state">
          <p class="text-grey">Loading transactions...</p>
        </div>
        
        <div v-else-if="transactions.length === 0" class="empty-state">
          <p class="text-grey">No transactions found</p>
        </div>
        
        <div v-else class="transaction-items">
          <div 
            v-for="transaction in transactions" 
            :key="transaction.id" 
            class="transaction-item"
          >
            <div class="transaction-date">
              {{ formatDate(transaction.date) }}
            </div>
            
            <div class="transaction-content">
              <div class="transaction-info">
                <div class="transaction-description">{{ transaction.description || 'Unnamed transaction' }}</div>
                <div class="transaction-owner">{{ getOwnerName(transaction.executedByOwnerId) }}</div>
              </div>
              
              <div class="transaction-amount" :class="getAmountClass(transaction)">
                {{ formatAmount(transaction.amount) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useBookStore } from '@/stores/book';
  import { useTransactionStore } from '@/stores/transaction';
  import { useUserStore } from '@/stores/user';
  import BasePercentageSlider from '@/components/ui/views/BasePercentageSlider.vue';
  import DateFilter from '@/components/ui/filters/DateFilter.vue';
  
  const props = defineProps({
    bookId: {
      type: String,
      required: true
    }
  });
  
  // Хранилища
  const bookStore = useBookStore();
  const transactionStore = useTransactionStore();
  const userStore = useUserStore();
  
  // Состояние компонента
  const loading = ref(true);
  const ownerDistribution = ref(50); // Начальное значение слайдера (50/50)
  const dateFilter = ref({
    period: 'monthly',
    date: new Date(),
    dateRange: [
      new Date(new Date().setDate(new Date().getDate() - 7)), 
      new Date()
    ]
  });
  
  // Получаем данные книги
  const bookData = computed(() => {
    const book = bookStore.getBookById(props.bookId);
    
    if (!book) {
      return {
        name: 'Unknown Book',
        incomeAmount: 0,
        expenseAmount: -11867,
        totalAmount: -11867,
        distributionRules: []
      };
    }
    
    // В реальном приложении эти значения должны рассчитываться на основе транзакций
    return {
      name: book.name,
      incomeAmount: 0,
      expenseAmount: -11867,
      totalAmount: -11867,
      distributionRules: book.distributionRules || []
    };
  });
  
  // Формируем данные владельцев для слайдера
  const ownerSides = computed(() => {
    if (!bookData.value.distributionRules || bookData.value.distributionRules.length < 2) {
      return [
        { name: 'Me', id: 'me' },
        { name: 'Other', id: 'other' }
      ];
    }
    
    return bookData.value.distributionRules.map(rule => {
      const user = userStore.getAllUsers().find(user => user.id === rule.ownerId);
      return {
        name: user ? user.name : 'Unknown',
        id: rule.ownerId
      };
    });
  });
  
  // Получаем отфильтрованные транзакции
  const transactions = computed(() => {
    // Фильтруем транзакции по книге и дате
    let filtered = transactionStore.transactions.filter(
      transaction => transaction.bookId === props.bookId
    );
    
    // Применяем фильтр даты
    if (dateFilter.value.period === 'daily') {
      if (dateFilter.value.dateFrom && dateFilter.value.dateTo) {
        const fromTime = new Date(dateFilter.value.dateFrom).getTime();
        const toTime = new Date(dateFilter.value.dateTo).getTime();
        
        filtered = filtered.filter(transaction => {
          const transactionTime = new Date(transaction.date).getTime();
          return transactionTime >= fromTime && transactionTime <= toTime;
        });
      }
    } else if (dateFilter.value.date) {
      const filterDate = new Date(dateFilter.value.date);
      
      if (dateFilter.value.period === 'monthly') {
        // Фильтр по месяцу и году
        filtered = filtered.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return transactionDate.getMonth() === filterDate.getMonth() && 
                 transactionDate.getFullYear() === filterDate.getFullYear();
        });
      } else if (dateFilter.value.period === 'yearly') {
        // Фильтр только по году
        filtered = filtered.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return transactionDate.getFullYear() === filterDate.getFullYear();
        });
      }
    }
    
    // Сортируем по дате (сначала новые)
    return filtered.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });
  
  // Методы форматирования и вспомогательные функции
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '';
    
    const prefix = amount > 0 ? '+' : '';
    return `${prefix}Rp ${Math.abs(amount).toLocaleString()}`;
  };
  
  const formatCurrency = (value, side) => {
    return `Rp ${Math.abs(value).toLocaleString()}`;
  };
  
  const formatDate = (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };
  
  const getOwnerName = (ownerId) => {
    const user = userStore.getAllUsers().find(user => user.id === ownerId);
    return user ? user.name : 'Unknown';
  };
  
  const getTotalClass = (amount) => {
    if (amount > 0) return 'amount-positive';
    if (amount < 0) return 'amount-negative';
    return '';
  };
  
  const getAmountClass = (transaction) => {
    if (transaction.type === 'income') {
      return 'amount-positive';
    } else if (transaction.type === 'expense') {
      return 'amount-negative';
    }
    return '';
  };
  
  // Обработчики событий
  const onCalendarVisibilityChange = (isVisible) => {
    console.log('Calendar visibility changed:', isVisible);
  };
  
  // Инициализация компонента
  onMounted(async () => {
    // Инициализируем хранилища, если они еще не инициализированы
    if (!bookStore.isInitialized) {
      await bookStore.init();
    }
    
    if (!transactionStore.isInitialized) {
      await transactionStore.init();
    }
    
    if (!userStore.isInitialized) {
      await userStore.init();
    }
    
    loading.value = false;
  });
  
  // Отслеживание изменений bookId
  watch(() => props.bookId, () => {
    loading.value = true;
    
    // Имитация загрузки данных
    setTimeout(() => {
      loading.value = false;
    }, 300);
  });
  </script>
  
  <style scoped>
  .dashboard-book {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .financial-info {
    padding: var(--spacing-md);
    border-radius: var(--border-radius-md);
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: var(--spacing-md);
  }
  
  .summary-total, .summary-income, .summary-expense {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .amount {
    font-size: var(--font-heading-size);
    font-weight: 600;
  }
  
  .amount-positive {
    color: var(--color-success);
  }
  
  .amount-negative {
    color: var(--color-warning);
  }
  
  .label {
    font-size: var(--font-small-size);
    color: var(--text-grey);
  }
  
  .edit-button {
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
  }
  
  .transactions-list {
    padding: var(--spacing-md);
    border-radius: var(--border-radius-md);
  }
  
  .list-header {
    margin-bottom: var(--spacing-md);
  }
  
  .loading-state, .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    padding: var(--spacing-md);
    text-align: center;
  }
  
  .transaction-items {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  
  .transaction-item {
    display: flex;
    flex-direction: column;
    padding: var(--spacing-sm);
    border-bottom: 1px solid var(--border-color);
  }
  
  .transaction-date {
    font-size: var(--font-small-size);
    color: var(--text-grey);
    margin-bottom: var(--spacing-xs);
  }
  
  .transaction-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .transaction-info {
    display: flex;
    flex-direction: column;
  }
  
  .transaction-description {
    font-size: var(--font-body-size);
    color: var(--text-usual);
  }
  
  .transaction-owner {
    font-size: var(--font-small-size);
    color: var(--text-grey);
  }
  
  .transaction-amount {
    font-size: var(--font-body-size);
    font-weight: 500;
  }
  </style>