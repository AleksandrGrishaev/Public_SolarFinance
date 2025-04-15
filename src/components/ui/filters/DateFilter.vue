<!-- src/components/ui/CustomDateFilter.vue -->
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
    
    <!-- Календарь -->
    <div v-if="showCalendar" class="calendar-container" v-click-outside="hideCalendar">
      <!-- Навигация по месяцам и годам -->
      <div class="calendar-header">
        <button class="nav-button" @click="navigateMonth(-1)">&lt;&lt;</button>
        <button class="nav-button" @click="navigateMonth(-1)">&lt;</button>
        <span class="calendar-title">{{ calendarTitle }}</span>
        <button class="nav-button" @click="navigateMonth(1)">&gt;</button>
        <button class="nav-button" @click="navigateMonth(1)">&gt;&gt;</button>
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
          <button class="action-button cancel" @click="hideCalendar">Cancel</button>
          <button class="action-button confirm" @click="confirmSelection">Confirm</button>
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
import { onMounted } from 'vue';
import { useDateFilter } from '@/composables/useDateFilter';
import { vClickOutside } from '@/directives/vClickOutside';

interface DateFilterModelValue {
  period?: 'daily' | 'monthly' | 'yearly';
  date?: Date;
  dateRange?: [Date, Date];
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

const emit = defineEmits<{
  (e: 'update:modelValue', value: DateFilterModelValue): void
}>();

// Используем composable
const {
  // Состояние
  currentPeriod,
  showCalendar,
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
  toggleCalendar,
  hideCalendar,
  navigateDate,
  navigateMonth,
  selectDate,
  selectMonth,
  selectYear,
  confirmSelection,
} = useDateFilter(props, emit);

// Инициализация при монтировании
onMounted(() => {
  if (!props.modelValue.period) {
    setPeriod('monthly');
  } else {
    setPeriod(props.modelValue.period as 'daily' | 'monthly' | 'yearly');
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
  max-width: calc(100vw - 40px);
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
  right: 0;
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