<!-- src/views/book/page/components/BookFinanceSummary.vue -->
<template>
  <div class="financial-info">
    <!-- Контейнер для верхней строки с суммами и иконкой -->
    <div class="header-container">
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
      </div>
      
      <!-- Иконка редактирования -->
      <div class="summary-edit">
        <BaseIcon 
          :icon="IconPencil" 
          size="lg"
          color="#808080"
          :customStyle="{backgroundColor: '#F7F9F8'}"
          clickable
          @click="handleEditClick"
        />
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
        <!-- Левый пользователь -->
        <div 
          class="owner-info left-owner"
          :style="getParticipantStyle(0)"
        >
          <div class="owner-name">{{ ownerSides[0]?.name }}</div>
          <div class="owner-details">
            <span class="owner-percentage">{{ ownerDistribution }}%</span>
            <span class="owner-amount">{{ formatCurrency(getParticipantAmount(0)) }}</span>
          </div>
        </div>
        
        <!-- Правый пользователь -->
        <div 
          class="owner-info right-owner"
          :style="getParticipantStyle(1)"
        >
          <div class="owner-name">{{ ownerSides[1]?.name }}</div>
          <div class="owner-details">
            <span class="owner-amount">{{ formatCurrency(getParticipantAmount(1)) }}</span>
            <span class="owner-percentage">{{ 100 - ownerDistribution }}%</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Фильтр даты -->
    <div class="date-filter-wrapper">
      <DateFilter v-model="dateFilter" @calendar-visibility-change="onCalendarVisibilityChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { IconPencil } from '@tabler/icons-vue';
import BaseIcon from '@/components/ui/icons/BaseIcon.vue';
import DateFilter from '@/components/ui/filters/DateFilter.vue';
import useBookFinanceSummary from '../composables/useBookFinanceSummary';

const props = defineProps({
  bookId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:dateFilter']);

// Используем композабл вместо локальной логики
const {
  ownerDistribution,
  dateFilter,
  bookData,
  ownerSides,
  formatAmount,
  formatCurrency,
  getTotalClass,
  getSliderStyle,
  getParticipantStyle,
  getParticipantAmount,
  updateOwnerDistribution,
  onCalendarVisibilityChange,
  initStores
} = useBookFinanceSummary(props.bookId, emit);

// Обработчик клика по иконке редактирования
const handleEditClick = () => {
  console.log('Edit button clicked');
  // Здесь можно добавить логику редактирования
};

// Инициализация компонента
onMounted(async () => {
  await initStores();
});
</script>

<style scoped>
.financial-info {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-xxxl);
  background-color: #F7F9F8; /* --bg-superlight как запрошено */
}

/* Контейнер для верхней строки и иконки */
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.summary-row {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  align-items: flex-end;
  flex: 1;
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