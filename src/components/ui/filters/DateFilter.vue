<!-- src/components/ui/DateFilter.vue -->
<template>
    <div class="date-filter">
      <div class="fast-date">
        <div 
          v-for="option in periodOptions" 
          :key="option.value"
          class="date-option" 
          :class="{ 'active': modelValue.period === option.value }" 
          @click="updatePeriod(option.value)"
        >
          {{ option.label }}
        </div>
      </div>
      <div class="date-selector" @click="showDatePicker = true">
        <div class="date-nav" @click.stop="navigateDate(-1)">&lt;</div>
        <div class="date-value">{{ formattedDate }}</div>
        <div class="date-nav" @click.stop="navigateDate(1)">&gt;</div>
      </div>
  
      <!-- Date Picker from Naive UI -->
      <n-date-picker 
        v-model:value="pickerValue"
        :type="pickerType"
        :show="showDatePicker"
        :actions="['confirm', 'clear']"
        @update:show="showDatePicker = $event"
        @confirm="onConfirmDate"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { NDatePicker } from 'naive-ui';
  
  const props = defineProps({
    modelValue: {
      type: Object,
      default: () => ({
        period: 'monthly',
        date: new Date()
      })
    }
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  // Опции периодов
  const periodOptions = [
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' }
  ];
  
  // Состояние DatePicker
  const showDatePicker = ref(false);
  const pickerValue = ref(new Date(props.modelValue.date));
  
  // Тип DatePicker в зависимости от выбранного периода
  const pickerType = computed(() => {
    switch (props.modelValue.period) {
      case 'weekly':
        return 'date';
      case 'monthly':
        return 'month';
      case 'yearly':
        return 'year';
      default:
        return 'date';
    }
  });
  
  // Форматирование даты в зависимости от периода
  const formattedDate = computed(() => {
    const date = new Date(props.modelValue.date);
    
    switch (props.modelValue.period) {
      case 'weekly': {
        // Получаем номер недели в году
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        
        return `W${weekNumber}/${date.getFullYear()}`;
      }
      case 'monthly': {
        const month = date.getMonth() + 1;
        return `${month}/${date.getFullYear()}`;
      }
      case 'yearly': {
        return `${date.getFullYear()}`;
      }
      default:
        return date.toLocaleDateString();
    }
  });
  
  // Обработчики событий
  const updatePeriod = (period) => {
    emit('update:modelValue', {
      ...props.modelValue,
      period
    });
  };
  
  const navigateDate = (direction) => {
    const date = new Date(props.modelValue.date);
    
    switch (props.modelValue.period) {
      case 'weekly':
        date.setDate(date.getDate() + direction * 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + direction);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + direction);
        break;
    }
    
    emit('update:modelValue', {
      ...props.modelValue,
      date
    });
  };
  
  const onConfirmDate = () => {
    emit('update:modelValue', {
      ...props.modelValue,
      date: new Date(pickerValue.value)
    });
    
    showDatePicker.value = false;
  };
  
  // Обновление значения DatePicker при изменении внешних данных
  watch(() => props.modelValue.date, (newDate) => {
    pickerValue.value = new Date(newDate);
  });
  </script>
  
  <style scoped>
  .date-filter {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    border-radius: 32px;
  }
  
  .fast-date {
    display: flex;
    padding: 6px 10px;
    border-radius: 28px;
    align-items: center;
    gap: 3px;
  }
  
  .date-option {
    height: 28px;
    padding: 0 16px;
    border-radius: 34px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 10px;
    font-weight: 600;
    line-height: 12px;
    background: #949496;
    cursor: pointer;
  }
  
  .date-option.active {
    background: #46484A;
  }
  
  .date-selector {
    height: 28px;
    padding: 0 16px;
    background: #949496;
    border-radius: 34px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }
  
  .date-nav {
    color: white;
    font-size: 10px;
    font-weight: 600;
    line-height: 12px;
    cursor: pointer;
  }
  
  .date-value {
    color: white;
    font-size: 10px;
    font-weight: 600;
    line-height: 12px;
  }
  
  /* Стили для DatePicker */
  :deep(.n-date-picker) {
    position: absolute;
    top: 40px;
    right: 0;
    z-index: 1000;
  }
  
  :deep(.n-date-panel-month .n-date-panel-month__cell.n-date-panel-date--selected) {
    background-color: #53B794;
  }
  
  :deep(.n-date-panel-year .n-date-panel-year__cell.n-date-panel-date--selected) {
    background-color: #53B794;
  }
  </style>