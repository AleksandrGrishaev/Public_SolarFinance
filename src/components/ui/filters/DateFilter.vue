<!-- src/components/ui/DateFilter.vue -->
<template>
  <div class="date-filter">
    <!-- Переключатели периодов в новом дизайне D-M-Y -->
    <div class="periods-container">
      <div class="fast-date">
        <div 
          class="date-option"
          :class="{ 'active': modelValue.period === 'daily' }" 
          @click="updatePeriod('daily')"
        >
          D
        </div>
        <div 
          class="date-option"
          :class="{ 'active': modelValue.period === 'monthly' }" 
          @click="updatePeriod('monthly')"
        >
          M
        </div>
        <div 
          class="date-option"
          :class="{ 'active': modelValue.period === 'yearly' }" 
          @click="updatePeriod('yearly')"
        >
          Y
        </div>
      </div>
    </div>
    
    <!-- Контейнер для селектора даты, выровненный по центру -->
    <div class="selector-container">
      <!-- Селектор для одиночной даты (месяц/год) -->
      <n-date-picker 
        v-if="modelValue.period !== 'daily'"
        v-model:value="pickerValue"
        :type="pickerType"
        :actions="null"
        placement="bottom"
        trigger="click"
        :show="showPicker"
        @update:show="showPicker = $event"
        @update:value="onSelectDate"
      >
        <div class="date-selector">
          <div class="date-nav" @click.stop="navigateDate(-1)">&lt;</div>
          <div class="date-value">{{ formattedDate }}</div>
          <div class="date-nav" @click.stop="navigateDate(1)">&gt;</div>
        </div>
      </n-date-picker>
      
      <!-- Селектор для диапазона дат в режиме Daily -->
      <n-date-picker 
        v-else
        v-model:value="rangeValue"
        type="daterange"
        :actions="['confirm']"
        placement="bottom"
        trigger="click"
        :show="showPicker"
        :is-date-disabled="isDateDisabled"
        @update:show="showPicker = $event"
        @confirm="onConfirmDateRange"
      >
        <div class="date-selector">
          <div class="date-nav" @click.stop="navigateDateRange(-1)">&lt;</div>
          <div class="date-value">{{ formattedDateRange }}</div>
          <div class="date-nav" @click.stop="navigateDateRange(1)">&gt;</div>
        </div>
      </n-date-picker>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { NDatePicker } from 'naive-ui';

// Функция для получения начала текущего месяца
const getCurrentMonthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

// Функция для получения начала текущего года
const getCurrentYearStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1);
};

// Функция для проверки, входит ли дата в соседний месяц
const isDateDisabled = (ts: number) => {
  if (!rangeValue.value || !rangeValue.value[0]) return false;
  
  const date = new Date(ts);
  const firstDate = new Date(rangeValue.value[0]);
  
  // Сравниваем месяцы - запрещаем выбор дат из другого месяца
  return date.getMonth() !== firstDate.getMonth();
};

// Функция для получения дефолтной даты в зависимости от периода
const getDefaultDateForPeriod = (period) => {
  switch (period) {
    case 'daily': {
      // Для daily возвращаем диапазон - сегодня и 7 дней назад
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return [weekAgo, today];
    }
    case 'monthly':
      return getCurrentMonthStart();
    case 'yearly':
      return getCurrentYearStart();
    default:
      return new Date();
  }
};

// Используем defineProps без обращения к внешним переменным
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      period: 'monthly',
      date: new Date(), // Для режимов monthly/yearly
      dateRange: [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()] // Диапазон для daily
    })
  }
});

const emit = defineEmits(['update:modelValue']);

// Вычисляем начальное значение для picker на основе props
const initialPickerValue = () => {
  if (props.modelValue.date) {
    return new Date(props.modelValue.date);
  }
  return getCurrentMonthStart();
};

// Состояние DatePicker
const pickerValue = ref(initialPickerValue());

// Начальное значение для диапазона в режиме Daily
const initialRangeValue = () => {
  if (props.modelValue.dateRange && Array.isArray(props.modelValue.dateRange) && props.modelValue.dateRange.length === 2) {
    return [new Date(props.modelValue.dateRange[0]), new Date(props.modelValue.dateRange[1])];
  }
  // По умолчанию: от недели назад до сегодня
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return [weekAgo, today];
};

const rangeValue = ref(initialRangeValue());
const showPicker = ref(false);

// Тип DatePicker в зависимости от выбранного периода
const pickerType = computed(() => {
  switch (props.modelValue.period) {
    case 'daily':
      return 'daterange';
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
  if (!props.modelValue.date) return '';
  
  const date = new Date(props.modelValue.date);
  
  switch (props.modelValue.period) {
    case 'monthly': {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
      return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    }
    case 'yearly': {
      return `${date.getFullYear()}`;
    }
    default:
      return date.toLocaleDateString();
  }
});

// Форматирование диапазона дат для режима Daily
const formattedDateRange = computed(() => {
  if (!props.modelValue.dateRange || !Array.isArray(props.modelValue.dateRange) || props.modelValue.dateRange.length !== 2) {
    return 'Select range';
  }
  
  const startDate = new Date(props.modelValue.dateRange[0]);
  const endDate = new Date(props.modelValue.dateRange[1]);
  
  // Форматирование дат в формате ДД.ММ.ГГГГ
  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${date.getFullYear()}`;
  };
  
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
});

// Обработчики событий
const updatePeriod = (period) => {
  // Установка дефолтных значений для выбранного периода
  if (period === 'daily') {
    // Для daily устанавливаем диапазон дат
    const defaultRange = getDefaultDateForPeriod(period);
    emit('update:modelValue', {
      ...props.modelValue,
      period,
      dateRange: defaultRange
    });
  } else {
    // Для остальных режимов устанавливаем соответствующую дату
    const defaultDate = getDefaultDateForPeriod(period);
    emit('update:modelValue', {
      ...props.modelValue,
      period,
      date: defaultDate
    });
  }
  
  // Показываем календарь при смене периода
  setTimeout(() => {
    showPicker.value = true;
  }, 100);
};

const navigateDate = (direction) => {
  // Навигация для месяц/год режимов
  const date = new Date(props.modelValue.date);
  
  switch (props.modelValue.period) {
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

const navigateDateRange = (direction) => {
  // Навигация для диапазона дат (daily режим)
  if (!props.modelValue.dateRange || !Array.isArray(props.modelValue.dateRange) || props.modelValue.dateRange.length !== 2) {
    return;
  }
  
  const startDate = new Date(props.modelValue.dateRange[0]);
  const endDate = new Date(props.modelValue.dateRange[1]);
  
  // Вычисляем разницу в днях между датами
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Смещаем даты на количество дней
  startDate.setDate(startDate.getDate() + direction * diffDays);
  endDate.setDate(endDate.getDate() + direction * diffDays);
  
  emit('update:modelValue', {
    ...props.modelValue,
    dateRange: [startDate, endDate]
  });
};

const onSelectDate = (value) => {
  if (value) {
    emit('update:modelValue', {
      ...props.modelValue,
      date: new Date(value)
    });
    
    // Закрываем селектор после выбора даты
    setTimeout(() => {
      showPicker.value = false;
    }, 100);
  }
};

const onConfirmDateRange = () => {
  if (rangeValue.value && Array.isArray(rangeValue.value) && rangeValue.value.length === 2) {
    emit('update:modelValue', {
      ...props.modelValue,
      dateRange: [new Date(rangeValue.value[0]), new Date(rangeValue.value[1])]
    });
    
    // Закрываем селектор после подтверждения
    setTimeout(() => {
      showPicker.value = false;
    }, 100);
  }
};

// Обновление значений при изменении внешних данных
watch(() => props.modelValue.date, (newDate) => {
  if (newDate) {
    pickerValue.value = new Date(newDate);
  }
});

watch(() => props.modelValue.dateRange, (newRange) => {
  if (newRange && Array.isArray(newRange) && newRange.length === 2) {
    rangeValue.value = [new Date(newRange[0]), new Date(newRange[1])];
  }
});

// Автоматически показывать календарь при переключении режима
watch(() => props.modelValue.period, (newPeriod) => {
  // Подождем немного перед открытием, чтобы компонент успел обновиться
  setTimeout(() => {
    showPicker.value = true;
  }, 100);
});

// При инициализации установим дефолтную дату для выбранного периода
onMounted(() => {
  // Убедимся, что у нас установлен правильный период по умолчанию (месяц)
  if (!props.modelValue.period || props.modelValue.period !== 'monthly') {
    updatePeriod('monthly');
  }
  
  // Если нет даты для месяц/год режимов
  if ((props.modelValue.period === 'monthly' || props.modelValue.period === 'yearly') && !props.modelValue.date) {
    const defaultDate = getDefaultDateForPeriod(props.modelValue.period);
    emit('update:modelValue', {
      ...props.modelValue,
      date: defaultDate
    });
  }
  
  // Если выбран daily режим, но не установлен диапазон
  if (props.modelValue.period === 'daily' && 
      (!props.modelValue.dateRange || !Array.isArray(props.modelValue.dateRange) || props.modelValue.dateRange.length !== 2)) {
    const defaultRange = getDefaultDateForPeriod('daily');
    emit('update:modelValue', {
      ...props.modelValue,
      dateRange: defaultRange
    });
  }
});
</script>

<style scoped>
.date-filter {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  gap: 12px;
  justify-content: space-between;
}

.periods-container {
  display: flex;
  justify-content: flex-start;
}

.fast-date {
  display: flex;
  padding: 2px 10px;
  border-radius: 28px;
  align-items: center;
  gap: 3px;
  background: #949496;
}

.selector-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.date-option {
  height: 28px;
  padding: 0 7px;
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
  min-width: 150px;
  max-width: calc(100vw - 40px); /* Ограничение по ширине экрана */
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Стили для DatePicker */
:deep(.n-date-picker-trigger) {
  width: auto;
}

/* Ограничение ширины календаря */
:deep(.n-date-panel-month),
:deep(.n-date-panel-year),
:deep(.n-date-panel-date) {
  width: 280px;
  max-width: calc(100vw - 32px);
}

:deep(.n-date-panel-daterange) {
  width: 280px !important;
  max-width: calc(100vw - 32px) !important;
}

:deep(.n-date-panel-month-calendar),
:deep(.n-date-panel-date-calendar) {
  width: 280px !important;
  max-width: 100% !important;
}

:deep(.n-date-panel-calendar-month),
:deep(.n-date-panel-calendar-year),
:deep(.n-date-panel-calendar-date) {
  max-width: 100% !important;
}

:deep(.n-date-panel-month .n-date-panel-month__cell.n-date-panel-date--selected) {
  background-color: #53B794;
}

:deep(.n-date-panel-year .n-date-panel-year__cell.n-date-panel-date--selected) {
  background-color: #53B794;
}

:deep(.n-date-panel-date .n-date-panel-date__cell.n-date-panel-date--selected) {
  background-color: #53B794;
}

:deep(.n-date-panel-daterange .n-date-panel-date__cell.n-date-panel-date--selected) {
  background-color: #53B794;
}

:deep(.n-date-panel-date__cell.n-date-panel-date--selected-start),
:deep(.n-date-panel-date__cell.n-date-panel-date--selected-end) {
  background-color: #53B794 !important;
}

:deep(.n-date-panel-date__cell.in-range) {
  background-color: rgba(83, 183, 148, 0.2) !important;
}

:deep(.n-button--primary-type) {
  background-color: #53B794 !important;
  border-color: #53B794 !important;
}

:deep(.n-date-panel) {
  z-index: 1000 !important;
}
</style>