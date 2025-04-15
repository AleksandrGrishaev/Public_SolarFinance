<!-- src/components/ui/DateFilter.vue -->
<template>
  <div class="date-filter">
    <!-- Контейнер для компактного отображения по центру -->
    <div class="filter-container">
      <!-- Переключатели D-M-Y -->
      <div class="fast-date">
        <div 
          class="date-option"
          :class="{ 'active': dateFilter.currentPeriod === 'daily' }" 
          @click="dateFilter.setPeriod('daily')"
        >
          D
        </div>
        <div 
          class="date-option"
          :class="{ 'active': dateFilter.currentPeriod === 'monthly' }" 
          @click="dateFilter.setPeriod('monthly')"
        >
          M
        </div>
        <div 
          class="date-option"
          :class="{ 'active': dateFilter.currentPeriod === 'yearly' }" 
          @click="dateFilter.setPeriod('yearly')"
        >
          Y
        </div>
      </div>
      
      <!-- Селектор даты -->
      <div class="date-selector" @click="dateFilter.toggleCalendar">
        <div class="date-nav" @click.stop="dateFilter.navigateDate(-1)">&lt;</div>
        <div class="date-value">{{ dateFilter.formattedDateValue }}</div>
        <div class="date-nav" @click.stop="dateFilter.navigateDate(1)">&gt;</div>
      </div>
    </div>
    
    <!-- Календарь -->
    <div v-if="dateFilter.showCalendar" class="calendar-container" v-click-outside="dateFilter.hideCalendar">
      <!-- Навигация по месяцам и годам -->
      <div class="calendar-header">
        <button class="nav-button" @click="dateFilter.navigateMonth(-1)">&lt;</button>
        <span class="calendar-title">{{ dateFilter.calendarTitle }}</span>
        <button class="nav-button" @click="dateFilter.navigateMonth(1)">&gt;</button>
      </div>
      
      <!-- Календарь для Daily -->
      <div v-if="dateFilter.currentPeriod === 'daily'" class="calendar daily-calendar">
        <!-- Дни недели -->
        <div class="weekday-header">
          <div v-for="day in dateFilter.weekDays" :key="day" class="weekday">{{ day }}</div>
        </div>
        
        <!-- Дни месяца -->
        <div class="days-grid">
          <div 
            v-for="(day, index) in dateFilter.calendarDays" 
            :key="index" 
            class="day-cell"
            :class="{
              'outside-month': !day.currentMonth,
              'selected-start': dateFilter.isSelectedStart(day.date),
              'selected-end': dateFilter.isSelectedEnd(day.date),
              'in-range': dateFilter.isInRange(day.date),
              'today': dateFilter.isToday(day.date)
            }"
            @click="dateFilter.selectDate(day.date)"
          >
            {{ day.dayNumber }}
          </div>
        </div>
        
        <!-- Кнопки действий -->
        <div class="calendar-footer">
          <button class="action-button cancel" @click="dateFilter.hideCalendar">Cancel</button>
          <button class="action-button confirm" @click="dateFilter.confirmSelection">Confirm</button>
        </div>
      </div>
      
      <!-- Выбор месяца -->
      <div v-else-if="dateFilter.currentPeriod === 'monthly'" class="calendar month-calendar">
        <div class="months-grid">
          <div 
            v-for="(month, index) in dateFilter.monthNames" 
            :key="index" 
            class="month-cell"
            :class="{ 'selected': dateFilter.isSelectedMonth(index) }"
            @click="dateFilter.selectMonth(index)"
          >
            {{ month.substring(0, 3) }}
          </div>
        </div>
      </div>
      
      <!-- Выбор года -->
      <div v-else-if="dateFilter.currentPeriod === 'yearly'" class="calendar year-calendar">
        <div class="years-grid">
          <div 
            v-for="year in dateFilter.yearsList" 
            :key="year" 
            class="year-cell"
            :class="{ 'selected': dateFilter.isSelectedYear(year) }"
            @click="dateFilter.selectYear(year)"
          >
            {{ year }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useDateFilter, type DateFilterState } from '@/composables/useDateFilter';

// Директива для закрытия календаря при клике вне него
const vClickOutside = {
  mounted(el: HTMLElement, binding: any) {
    el._clickOutside = (event: MouseEvent) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el._clickOutside);
  },
  unmounted(el: any) {
    document.removeEventListener('click', el._clickOutside);
  }
};

const props = defineProps<{
  modelValue: DateFilterState;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: DateFilterState): void;
}>();

// Используем composable для логики работы с датами
const dateFilter = useDateFilter(
  props.modelValue,
  (value) => { emit('update:modelValue', value); }
);

// Следим за изменениями в modelValue извне
watch(() => props.modelValue, (newValue) => {
  if (newValue && JSON.stringify(newValue) !== JSON.stringify({
    period: dateFilter.currentPeriod.value,
    date: dateFilter.currentPeriod.value !== 'daily' ? dateFilter.selectedDate.value : undefined,
    dateRange: dateFilter.currentPeriod.value === 'daily' ? dateFilter.dateRange.value : undefined
  })) {
    // Обновляем состояние если внешнее значение изменилось
    if (newValue.period) {
      dateFilter.setPeriod(newValue.period);
    }
    
    if (newValue.period === 'daily' && newValue.dateRange) {
      dateFilter.dateRange.value = [new Date(newValue.dateRange[0]), new Date(newValue.dateRange[1])];
    } else if (newValue.date) {
      dateFilter.selectedDate.value = new Date(newValue.date);
    }
  }
}, { deep: true });
</script>

<style scoped>
.date-filter {
  display: flex;
  justify-content: center;
  align-self: stretch;
  position: relative;
}

.filter-container {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 11px;
  border-radius: 32px;
}

.fast-date {
  display: flex;
  height: 28px;
  padding: 0 10px;
  background: #949496;
  border-radius: 28px;
  align-items: center;
  gap: 3px;
}

.date-option {
  height: 24px;
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
  overflow: hidden;
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
  overflow: hidden;
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

/* Календарь */
.calendar-container {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  background: #333;
  border-radius: 8px;
  width: 280px;
  max-width: calc(100vw - 32px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
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