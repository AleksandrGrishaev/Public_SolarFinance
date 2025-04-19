<!-- src/components/ui/filters/DateFilter.vue с использованием date-fns -->
<template>
  <div class="date-filter">
    <!-- Переключатели D-M-Y слева -->
    <div class="periods-container">
      <div class="fast-date">
        <div 
          class="date-option"
          :class="{ 'active': currentPeriod === 'daily' }" 
          @click="setPeriod('daily')"
        >
          D
        </div>
        <div 
          class="date-option"
          :class="{ 'active': currentPeriod === 'monthly' }" 
          @click="setPeriod('monthly')"
        >
          M
        </div>
        <div 
          class="date-option"
          :class="{ 'active': currentPeriod === 'yearly' }" 
          @click="setPeriod('yearly')"
        >
          Y
        </div>
      </div>
    </div>
    
    <!-- Селектор даты справа -->
    <div class="date-selector" @click="toggleCalendar">
      <div class="date-nav" @click.stop="navigateDate(-1)">&lt;</div>
      <div class="date-value">{{ formattedDateValue }}</div>
      <div class="date-nav" @click.stop="navigateDate(1)">&gt;</div>
    </div>
    
    <!-- Календарь с ручным управлением кликами -->
    <div v-if="showCalendar" class="calendar-container" ref="calendarContainerRef">
      <!-- Навигация по месяцам и годам -->
      <div class="calendar-header">
        <button class="nav-button" @click="navigateMonth(-12)">&lt;&lt;</button>
        <button class="nav-button" @click="navigateMonth(-1)">&lt;</button>
        <span class="calendar-title">{{ calendarTitle }}</span>
        <button class="nav-button" @click="navigateMonth(1)">&gt;</button>
        <button class="nav-button" @click="navigateMonth(12)">&gt;&gt;</button>
      </div>
      
      <!-- Календарь для Daily -->
      <div v-if="currentPeriod === 'daily'" class="calendar daily-calendar">
        <!-- Дни недели -->
        <div class="weekday-header">
          <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
        </div>
        
        <!-- Дни месяца -->
        <div class="days-grid">
          <div 
            v-for="(day, index) in calendarDays" 
            :key="index" 
            class="day-cell"
            :class="{
              'outside-month': !day.currentMonth,
              'selected-start': isSelectedStart(day.date),
              'selected-end': isSelectedEnd(day.date),
              'in-range': isInRange(day.date),
              'today': isToday(day.date)
            }"
            @click="selectDate(day.date)"
          >
            {{ day.dayNumber }}
          </div>
        </div>
        
        <!-- Кнопки действий -->
        <div class="calendar-footer">
          <button class="action-button cancel" @click="hideCalendar">Отмена</button>
          <button class="action-button confirm" @click="confirmSelection">Применить</button>
        </div>
      </div>
      
      <!-- Выбор месяца -->
      <div v-else-if="currentPeriod === 'monthly'" class="calendar month-calendar">
        <div class="months-grid">
          <div 
            v-for="(month, index) in monthNames" 
            :key="index" 
            class="month-cell"
            :class="{ 'selected': isSelectedMonth(index) }"
            @click="selectMonth(index)"
          >
            {{ month }}
          </div>
        </div>
      </div>
      
      <!-- Выбор года -->
      <div v-else-if="currentPeriod === 'yearly'" class="calendar year-calendar">
        <div class="years-grid">
          <div 
            v-for="year in yearsList" 
            :key="year" 
            class="year-cell"
            :class="{ 'selected': isSelectedYear(year) }"
            @click="selectYear(year)"
          >
            {{ year }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref, onUnmounted } from 'vue';
import { useDateFilter } from '@/composables/useDateFilter';

interface DateFilterModelValue {
  period?: 'daily' | 'monthly' | 'yearly';
  date?: Date;
  dateRange?: [Date, Date];
  dateFrom?: Date;
  dateTo?: Date;
}

const props = defineProps({
  modelValue: {
    type: Object as () => DateFilterModelValue,
    default: () => ({
      period: 'monthly',
      date: new Date(),
      dateRange: [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()]
    })
  }
});

// Добавляем новое событие для уведомления о видимости календаря
const emit = defineEmits<{
  (e: 'update:modelValue', value: DateFilterModelValue): void,
  (e: 'calendar-visibility-change', isVisible: boolean): void
}>();

// Ссылка на контейнер календаря
const calendarContainerRef = ref(null);
const dateFilterRef = ref(null);

// Используем composable с расширенными функциями
const {
  // Состояние
  currentPeriod,
  selectedDate,
  dateRange,
  showCalendar,
  currentViewDate,
  tempRange,
  weekDays,
  monthNames,
  
  // Вычисляемые свойства
  calendarTitle,
  yearsList,
  formattedDateValue,
  calendarDays,
  
  // Методы проверки
  isSelectedStart,
  isSelectedEnd,
  isInRange,
  isToday,
  isSelectedMonth,
  isSelectedYear,
  
  // Методы управления
  setPeriod,
  toggleCalendar: originalToggleCalendar,
  hideCalendar: originalHideCalendar,
  navigateDate,
  navigateMonth,
  selectDate,
  selectMonth,
  selectYear,
  confirmSelection: originalConfirmSelection,
  updateModelValue
} = useDateFilter(props, emit);

// Переопределяем методы с дополнительной эмиссией события о видимости
const toggleCalendar = () => {
  originalToggleCalendar();
  emit('calendar-visibility-change', showCalendar.value);
};

const hideCalendar = () => {
  originalHideCalendar();
  emit('calendar-visibility-change', false);
};

const confirmSelection = () => {
  originalConfirmSelection();
  emit('calendar-visibility-change', false);
};

// Предоставляем метод для внешнего закрытия календаря
const forceCloseCalendar = () => {
  hideCalendar();
};

// Инициализация и управление кликами
onMounted(() => {
  if (!props.modelValue.period) {
    setPeriod('monthly');
  } else {
    setPeriod(props.modelValue.period as 'daily' | 'monthly' | 'yearly');
  }
  
  // Убедимся, что календарь закрыт при старте
  emit('calendar-visibility-change', false);
  
  // Добавляем глобальный обработчик кликов
  const handleDocumentClick = (event: MouseEvent) => {
    // Если календарь не виден, игнорируем
    if (!showCalendar.value || !calendarContainerRef.value) return;
    
    const calendar = calendarContainerRef.value as HTMLElement;
    const target = event.target as HTMLElement;
    
    // Пропускаем, если клик внутри календаря
    if (calendar.contains(target)) return;
    
    // Проверяем, не является ли целью переключатель даты или его дочерние элементы
    const isDateSelector = 
      target.classList.contains('date-selector') || 
      target.closest('.date-selector') ||
      target.classList.contains('date-option') || 
      target.closest('.date-option') ||
      target.classList.contains('date-nav') || 
      target.closest('.date-nav') ||
      target.classList.contains('date-value') || 
      target.closest('.date-value');
    
    // Если клик не на дате-селекторе, закрываем календарь
    if (!isDateSelector) {
      console.log('Click outside calendar detected, closing calendar');
      hideCalendar();
    }
  };
  
  // Прикрепляем прослушиватель с фазой захвата
  document.addEventListener('click', handleDocumentClick, true);
  
  // Удаляем прослушиватель при размонтировании
  onUnmounted(() => {
    document.removeEventListener('click', handleDocumentClick, true);
  });
});

// Отладочный вывод для отслеживания изменений модели
watch(() => props.modelValue, (newValue) => {
  console.log('Model changed in DateFilter:', newValue);
}, { deep: true });

// Экспортируем метод для внешнего доступа
defineExpose({
  forceCloseCalendar
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
  justify-content: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
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
  padding: 2px 12px;
  background: #949496;
  border-radius: 34px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  min-width: 150px;
  max-width: calc(100vw - 40px);
  position: relative;
  z-index: 10; /* Повышаем z-index для корректной работы кликов */
}

.date-nav {
  color: white;
  font-size: 11px;
  font-weight: 600;
  line-height: 11px;
  cursor: pointer;
}

.date-value {
  color: white;
  font-size: 11px;
  font-weight: 600;
  line-height: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Календарь */
.calendar-container {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: #333;
  border-radius: 8px;
  width: 280px;
  max-width: calc(100vw - 32px);
  z-index: 1000;
  overflow: visible;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  animation: calendar-appear 0.2s ease-out;
  transform-origin: top right;
}

@keyframes calendar-appear {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #444;
  color: white;
}

.calendar-title {
  font-size: 14px;
  font-weight: 600;
}

.nav-button {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
}

.calendar {
  padding: 8px;
}

/* Daily календарь */
.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  color: #ccc;
  padding: 4px 0;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.day-cell {
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}

.day-cell:hover {
  background-color: #555;
}

.day-cell.outside-month {
  color: #777;
}

.day-cell.today {
  font-weight: bold;
  box-shadow: inset 0 0 0 1px #53B794;
}

.day-cell.selected-start,
.day-cell.selected-end {
  background-color: #53B794;
  color: white;
}

.day-cell.in-range {
  background-color: rgba(83, 183, 148, 0.2);
}

/* Месячный и годовой календари */
.months-grid, .years-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.month-cell, .year-cell {
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}

.month-cell:hover, .year-cell:hover {
  background-color: #555;
}

.month-cell.selected, .year-cell.selected {
  background-color: #53B794;
  color: white;
}

/* Кнопки действий */
.calendar-footer {
  display: flex;
  justify-content: flex-end;
  padding: 8px;
  gap: 8px;
  margin-top: 8px;
}

.action-button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.action-button.cancel {
  background-color: #666;
  color: white;
}

.action-button.confirm {
  background-color: #53B794;
  color: white;
}
</style>