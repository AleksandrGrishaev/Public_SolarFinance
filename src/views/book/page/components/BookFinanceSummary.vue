<!-- src/views/book/page/components/BookFinanceSummary.vue -->
<template>
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
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useBookStore } from '@/stores/book';
  import { useUserStore } from '@/stores/user';
  import BasePercentageSlider from '@/components/ui/views/BasePercentageSlider.vue';
  import DateFilter from '@/components/ui/filters/DateFilter.vue';
  
  const props = defineProps({
    bookId: {
      type: String,
      required: true
    }
  });
  
  const emit = defineEmits(['update:dateFilter']);
  
  // Хранилища
  const bookStore = useBookStore();
  const userStore = useUserStore();
  
  // Состояние компонента
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
  
  // Методы форматирования и вспомогательные функции
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '';
    
    const prefix = amount > 0 ? '+' : '';
    return `${prefix}Rp ${Math.abs(amount).toLocaleString()}`;
  };
  
  const formatCurrency = (value, side) => {
    return `Rp ${Math.abs(value).toLocaleString()}`;
  };
  
  const getTotalClass = (amount) => {
    if (amount > 0) return 'amount-positive';
    if (amount < 0) return 'amount-negative';
    return '';
  };
  
  // Обработчики событий
  const onCalendarVisibilityChange = (isVisible) => {
    console.log('Calendar visibility changed:', isVisible);
  };
  
  // Отслеживаем изменения фильтра даты и пробрасываем их наверх
  watch(dateFilter, (newValue) => {
    emit('update:dateFilter', newValue);
  }, { deep: true });
  
  // Инициализация компонента
  onMounted(async () => {
    // Инициализируем хранилища, если они еще не инициализированы
    if (!bookStore.isInitialized) {
      await bookStore.init();
    }
    
    if (!userStore.isInitialized) {
      await userStore.init();
    }
  });
  </script>
  
  <style scoped>
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
  </style>