<!-- src/components/categories/view/CategoryDateFilters.vue -->
<template>
    <div class="date-filters-container">
      <!-- Фильтр периода с обработчиком видимости календаря -->
      <DateFilter 
        ref="dateFilterRef"
        v-model="dateFilterModel" 
        @update:modelValue="handleDateFilterChange"
        @calendar-visibility-change="handleCalendarVisibilityChange" 
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import DateFilter from '../../ui/filters/DateFilter.vue';
  
  const props = defineProps({
    dateFilter: {
      type: Object,
      default: () => ({
        period: 'monthly',
        date: new Date(),
        dateRange: [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()]
      })
    },
    isVisible: {
      type: Boolean,
      default: false
    },
    categoryId: {
      type: String,
      default: ''
    }
  });
  
  const emit = defineEmits([
    'update:dateFilter', 
    'calendar-visibility-change',
    'apply-filters'
  ]);
  
  // Ссылка на компонент DateFilter
  const dateFilterRef = ref(null);
  
  // Модель для двустороннего связывания
  const dateFilterModel = computed({
    get: () => props.dateFilter,
    set: (value) => emit('update:dateFilter', value)
  });
  
  // Обработчик изменения фильтра дат
  const handleDateFilterChange = (value) => {
    console.log('CategoryDateFilters received date filter:', value);
    console.log('Filter period:', value.period);
    console.log('Filter date:', value.date);
    console.log('Filter dateRange:', value.dateRange);
  
    // Отправляем событие для применения фильтров в родительском компоненте
    emit('apply-filters');
  };
  
  // Обработчик события изменения видимости календаря
  const handleCalendarVisibilityChange = (isVisible) => {
    console.log('Calendar visibility changed:', isVisible);
    emit('calendar-visibility-change', isVisible);
  };
  
  // Метод для программного закрытия календаря
  const forceCloseCalendar = () => {
    if (dateFilterRef.value && typeof dateFilterRef.value.forceCloseCalendar === 'function') {
      dateFilterRef.value.forceCloseCalendar();
    }
  };
  
  // Отслеживаем изменения в самом объекте dateFilter
  watch(() => props.dateFilter, (newValue, oldValue) => {
    console.log('DateFilter object changed:', newValue);
    console.log('Previous value was:', oldValue);
    if (props.isVisible && props.categoryId) {
      emit('apply-filters');
    }
  }, { deep: true });
  
  // Экспортируем методы для родительского компонента
  defineExpose({
    forceCloseCalendar
  });
  </script>
  
  <style scoped>
  .date-filters-container {
    width: 100%;
  }
  
  /* Стили для календаря */
  :deep(.calendar-container) {
    z-index: 1000;
  }
  </style>