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
      
      <!-- Иконка редактирования -->
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
      <!-- Слайдер -->
      <div class="slider-container">
        <input 
          type="range" 
          class="slider" 
          :value="ownerDistribution"
          @input="updateOwnerDistribution"
          min="0" 
          max="100" 
          step="1"
          :style="getSliderStyle()"
        />
      </div>
      
      <!-- Информация об участниках -->
      <div class="distribution-info">
        <div 
          v-for="(side, index) in ownerSides" 
          :key="side.id"
          class="owner-info"
          :style="getParticipantStyle(index)"
        >
          <div class="owner-name">{{ side.name }}{{ index === 0 ? ownerDistribution : 100 - ownerDistribution }}%</div>
          <div class="owner-amount">{{ formatCurrency(getParticipantAmount(index)) }}</div>
        </div>
      </div>
    </div>
    
    <!-- Фильтр даты -->
    <DateFilter v-model="dateFilter" @calendar-visibility-change="onCalendarVisibilityChange" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useBookStore } from '@/stores/book';
import { useUserStore } from '@/stores/user';
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
      { name: 'Alex', id: 'me' },
      { name: 'Sasha Solar', id: 'other' }
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
  
  // Убираем плюс для положительных значений в соответствии со скриншотом
  return `Rp ${Math.abs(amount).toLocaleString()}`;
};

const formatCurrency = (value) => {
  return `Rp ${Math.abs(value).toLocaleString()}`;
};

const getTotalClass = (amount) => {
  if (amount > 0) return 'amount-positive';
  if (amount < 0) return 'amount-negative';
  return '';
};

// Получение стиля для слайдера (градиент)
const getSliderStyle = () => {
  const percentage = ownerDistribution.value;
  const leftColor = '#555555'; // Цвет для первого участника (темно-серый)
  const rightColor = '#4F9FC8'; // Цвет для второго участника (голубой)
  
  return {
    background: `linear-gradient(to right, ${leftColor} 0%, ${leftColor} ${percentage}%, ${rightColor} ${percentage}%, ${rightColor} 100%)`
  };
};

// Получение стиля для участника (соответствующий цвет)
const getParticipantStyle = (index) => {
  const leftColor = '#555555'; // Цвет для первого участника
  const rightColor = '#4F9FC8'; // Цвет для второго участника
  
  return {
    color: index === 0 ? leftColor : rightColor
  };
};

// Расчет суммы для каждого участника
const getParticipantAmount = (index) => {
  const totalAmount = Math.abs(bookData.value.totalAmount);
  const percentage = index === 0 ? ownerDistribution.value : 100 - ownerDistribution.value;
  
  return totalAmount * (percentage / 100);
};

// Обновление значения слайдера
const updateOwnerDistribution = (event) => {
  ownerDistribution.value = parseInt(event.target.value);
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
  border-radius: var(--border-radius-xxxl);
  background-color: #404040;
}

.summary-row {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  align-items: flex-end;
  margin-bottom: var(--spacing-md);
  position: relative;
}

.summary-total, .summary-income, .summary-expense {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.amount {
  font-size: var(--font-subheading-size);
  font-weight: 500;
  color: var(--text-usual);
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

.summary-edit {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.edit-button {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--border-radius-xxxl);
  cursor: pointer;
}

/* Стили для слайдера */
.slider-container {
  width: 100%;
  position: relative;
  margin-bottom: var(--spacing-sm);
}

.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  outline: none;
  transition: opacity 0.2s;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* Стили для распределения владельцев */
.distribution-info {
  display: flex;
  justify-content: space-between;
  margin: var(--spacing-sm) 0 var(--spacing-md) 0;
}

.owner-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.owner-info:last-child {
  align-items: flex-end;
}

.owner-name {
  font-size: var(--font-small-size);
  font-weight: 500;
}

.owner-amount {
  font-size: var(--font-small-size);
  margin-top: 2px;
}
</style>