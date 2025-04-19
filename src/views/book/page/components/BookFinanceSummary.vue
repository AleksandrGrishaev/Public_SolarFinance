<!-- Обновленный компонент BookFinanceSummary.vue с исправленными процентами -->
<template>
  <div class="financial-info">
    <!-- Состояние загрузки -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading data...</p>
    </div>
    
    <!-- Загруженные данные -->
    <div v-else>
      <!-- Верхняя строка с суммами -->
      <div class="header-container">
        <div class="summary-row">
          <!-- Общая сумма - используем форматирование balance -->
          <div class="summary-total">
            <div class="amount" :class="getTotalClass(bookData?.totalAmount || 0)">
              {{ formatBalanceAmount(bookData?.totalAmount || 0) }}
            </div>
            <div class="label">Total</div>
          </div>
          
          <!-- Доход - используем форматирование balance -->
          <div class="summary-income">
            <div class="amount amount-positive">
              {{ formatBalanceAmount(bookData?.incomeAmount || 0) }}
            </div>
            <div class="label">Income</div>
          </div>
          
          <!-- Расход - используем форматирование balance -->
          <div class="summary-expense">
            <div class="amount amount-negative">
              {{ formatBalanceAmount(bookData?.expenseAmount || 0) }}
            </div>
            <div class="label">Expense</div>
          </div>
        </div>
      </div>
      
      <!-- Секция распределения между владельцами (слайдер) -->
      <div v-if="shouldShowDistribution">
        <!-- Удалена надпись "Expense Distribution" -->
        
        <!-- Слайдер (только для отображения) -->
        <div class="slider-container">
  <input 
    type="range" 
    class="slider" 
    :value="actualPercentages ? actualPercentages[0] : actualOwnerDistribution"
    @input="updateOwnerDistribution"
    min="0" 
    max="100" 
    step="1"
    :style="getSliderStyle()"
    disabled
  />
</div>
        
        <!-- Информация о владельцах -->
        <div class="distribution-info">
          <!-- Левый владелец -->
          <div 
            class="owner-info left-owner"
            :style="getParticipantStyle(0)"
          >
            <div class="owner-name">{{ ownerSides[0]?.name || 'No data' }}</div>
            <div class="owner-details">
              <!-- Вместо плановых процентов используем фактические -->
              <span class="owner-percentage">{{ actualPercentages ? actualPercentages[0] : Math.round(ownerSides[0]?.percentage || 0) }}%</span>
              <span class="owner-amount">{{ formatBalanceAmount(getParticipantAmount(0)) }}</span>
            </div>
          </div>
          
          <!-- Правый владелец -->
          <div 
            class="owner-info right-owner"
            :style="getParticipantStyle(1)"
          >
            <div class="owner-name">{{ ownerSides[1]?.name || 'No data' }}</div>
            <div class="owner-details">
              <span class="owner-amount">{{ formatBalanceAmount(getParticipantAmount(1)) }}</span>
              <!-- Вместо плановых процентов используем фактические -->
              <span class="owner-percentage">{{ actualPercentages ? actualPercentages[1] : Math.round(ownerSides[1]?.percentage || 0) }}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Фильтр даты -->
      <div class="date-filter-wrapper">
        <DateFilter 
          v-model="localDateFilter" 
          @update:modelValue="onDateFilterChange" 
          @calendar-visibility-change="onCalendarVisibilityChange" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import DateFilter from '@/components/ui/filters/DateFilter.vue';
import { useBookFinanceSummary } from '../composables/useBookFinanceSummary';
import { usePercentageSlider } from '../composables/usePercentageSlider';
import { useFormatBalance } from '@/composables/transaction/useFormatBalance';
import { useBookContext } from '../composables/useBookContext';

console.log('[BookFinanceSummary] Component setup started');

// Получаем bookContext напрямую для отладки
const bookContext = useBookContext();
console.log('[BookFinanceSummary] Direct bookContext.currentBook:', 
  bookContext.currentBook.value ? {
    id: bookContext.currentBook.value.id,
    name: bookContext.currentBook.value.name,
    currency: bookContext.currentBook.value.currency
  } : 'null');

// Используем composables для финансовой сводки
const {
  bookData,
  isLoading,
  dateFilter,
  formatAmount,
  formatCurrency,
  getTotalClass,
  onCalendarVisibilityChange,
  hasDistributionRules,
  updateDateFilter
} = useBookFinanceSummary();

// Добавим отладочную информацию о bookData
console.log('[BookFinanceSummary] Initial bookData:', bookData.value ? {
  name: bookData.value.name,
  currency: bookData.value.currency,
  incomeAmount: bookData.value.incomeAmount,
  expenseAmount: bookData.value.expenseAmount,
  totalAmount: bookData.value.totalAmount
} : 'null');

// Импортируем и используем composable для форматирования баланса
const { formatBalance, getCurrencySymbol } = useFormatBalance();

// Создаем функцию форматирования с использованием нашего нового composable
const formatBalanceAmount = (amount) => {
  const currency = bookData.value?.currency || 'Unknown';
  
  // Используем обновленную функцию с нужными настройками
  return formatBalance(amount, 0, currency, {
    useAbbreviations: true,
    minValueToAbbreviate: 1000000, // Сокращать от миллиона
    symbolAfterNegative: true      // Знак минус перед символом валюты
  });
};

// Создаем локальную копию фильтра для v-model
const localDateFilter = ref(JSON.parse(JSON.stringify(dateFilter.value)));

// Синхронизируем локальный фильтр с глобальным
watch(() => dateFilter.value, (newValue) => {
  console.log('[BookFinanceSummary] Global filter changed, updating local filter');
  localDateFilter.value = JSON.parse(JSON.stringify(newValue));
}, { deep: true });

// Используем composable для слайдера процентов
const {
  ownerSides,
  actualOwnerDistribution,
  actualPercentages, // Добавляем фактические проценты
  getParticipantAmount,
  getSliderStyle,
  getParticipantStyle,
  updateOwnerDistribution
} = usePercentageSlider();

// Выводим actualPercentages при инициализации для отладки
console.log('[BookFinanceSummary] Initial actualPercentages:', actualPercentages?.value);

// Отслеживаем изменения в actualPercentages для отладки
watch(() => actualPercentages.value, (newValue) => {
  console.log('[BookFinanceSummary] actualPercentages changed:', newValue);
}, { immediate: true });

// Решаем, показывать ли секцию распределения
const shouldShowDistribution = computed(() => {
  // Проверяем условие: нет загрузки и есть правила распределения
  const result = hasDistributionRules.value && !isLoading.value;
  
  console.log('[BookFinanceSummary] shouldShowDistribution check:');
  console.log('[BookFinanceSummary] - hasDistributionRules:', hasDistributionRules.value);
  console.log('[BookFinanceSummary] - isLoading:', isLoading.value);
  console.log('[BookFinanceSummary] - result:', result);
  console.log('[BookFinanceSummary] - bookData distributionRules:', 
    bookData.value?.distributionRules ? 
    `Array with ${bookData.value.distributionRules.length} items` : 
    'undefined or empty');
  console.log('[BookFinanceSummary] - actualPercentages:', actualPercentages.value);
  
  return result;
});

// Отслеживаем изменения в bookData
watch(() => bookData.value, (newData, oldData) => {
  console.log('[BookFinanceSummary] bookData changed:', {
    name: newData?.name,
    fromCurrency: oldData?.currency,
    toCurrency: newData?.currency,
    incomeAmount: newData?.incomeAmount,
    expenseAmount: newData?.expenseAmount,
    totalAmount: newData?.totalAmount
  });
}, { deep: true, immediate: true });

// Добавим наблюдение за currentBook из контекста напрямую
watch(() => bookContext.currentBook.value, (newBook) => {
  console.log('[BookFinanceSummary] bookContext.currentBook changed:', newBook ? {
    id: newBook.id,
    name: newBook.name,
    currency: newBook.currency
  } : 'null');
}, { immediate: true });

// Добавим наблюдение за selectedBookIds
watch(() => bookContext.selectedBookIds.value, (newSelection) => {
  console.log('[BookFinanceSummary] bookContext.selectedBookIds changed:', newSelection);
}, { immediate: true });

const onDateFilterChange = (newFilterValue) => {
  console.log('[BookFinanceSummary] Date filter input received:', newFilterValue);
  
  // Вместо обновления локального состояния сразу передаем в глобальный контекст
  // Сериализация/десериализация не нужна, так как в updateDateFilter 
  // уже есть правильная обработка нормализации дат
  updateDateFilter(newFilterValue);
};

onMounted(() => {
  console.log('[BookFinanceSummary] Component mounted');
  
  // При монтировании обеспечиваем синхронизацию локального фильтра с глобальным
  localDateFilter.value = JSON.parse(JSON.stringify(dateFilter.value));
  
  // Выводим информацию о текущих данных для отладки
  console.log('[BookFinanceSummary] At mount - bookData:', bookData.value ? {
    name: bookData.value.name,
    currency: bookData.value.currency,
    totalAmount: bookData.value.totalAmount
  } : 'null');
  
  console.log('[BookFinanceSummary] At mount - currentBook:', bookContext.currentBook.value ? {
    id: bookContext.currentBook.value.id,
    name: bookContext.currentBook.value.name,
    currency: bookContext.currentBook.value.currency
  } : 'null');
  
  // Дополнительно выводим actualPercentages при монтировании
  console.log('[BookFinanceSummary] At mount - actualPercentages:', actualPercentages.value);
  
  // Принудительно запрашиваем значения для обоих участников при монтировании
  // для гарантии расчета фактических процентов
  setTimeout(() => {
    const amount0 = getParticipantAmount(0);
    const amount1 = getParticipantAmount(1);
    console.log(`[BookFinanceSummary] Forced participant amounts - [0]: ${amount0}, [1]: ${amount1}`);
  }, 500);
});
</script>

<style scoped>
.financial-info {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-xxxl);
  background-color: #F7F9F8; /* --bg-superlight как запрошено */
}

/* Состояние загрузки */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--text-grey);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-sm);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Контейнер для верхней строки */
.header-container {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-sm);
}

.summary-row {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  align-items: flex-end;
}

.summary-total, .summary-income, .summary-expense {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.amount {
  font-size: var(--font-subheading-size);
  font-weight: 500;
  color: var(--text-grey);
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
  cursor: default;
}

.slider:disabled {
  opacity: 1;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  cursor: default;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  cursor: default;
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
  max-width: 45%;
}

.left-owner {
  align-items: flex-start;
  text-align: left;
}

.right-owner {
  align-items: flex-end;
  text-align: right;
}

.owner-name {
  font-size: var(--font-small-size);
  font-weight: 500;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.owner-details {
  font-size: var(--font-small-size);
  display: flex;
  gap: 8px;
}

.owner-percentage {
  font-weight: 500;
}

/* Убираем нижний отступ у DateFilter */
.date-filter-wrapper {
  margin-bottom: 0;
}

.date-filter-wrapper :deep(.date-filter) {
  margin-bottom: 0;
  padding-bottom: 0;
}
</style>