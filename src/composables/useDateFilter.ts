// src/composables/useDateFilter.ts
import { ref, computed, watch } from 'vue';
import { 
  format, 
  startOfDay, 
  endOfDay, 
  startOfMonth, 
  startOfYear, 
  addDays, 
  addMonths, 
  addYears, 
  isSameDay, 
  isWithinInterval, 
  isToday as isTodayFn, 
  isSameMonth, 
  isSameYear, 
  getDate, 
  getMonth,
  getYear,
  parseISO, 
  differenceInDays
} from 'date-fns';
import { ru } from 'date-fns/locale';

interface DateFilterModelValue {
  period?: 'daily' | 'monthly' | 'yearly';
  date?: Date;
  dateRange?: [Date, Date];
  dateFrom?: Date;
  dateTo?: Date;
}

interface DateFilterProps {
  modelValue: DateFilterModelValue;
}

interface CalendarDay {
  date: Date;
  dayNumber: number;
  currentMonth: boolean;
}

type EmitFunction = (event: 'update:modelValue', value: DateFilterModelValue) => void;

export function useDateFilter(props: DateFilterProps, emit: EmitFunction) {
  // Состояние
  const currentPeriod = ref<'daily' | 'monthly' | 'yearly'>(props.modelValue.period || 'monthly');
  
  // Нормализуем даты через date-fns
  const normalizeDate = (date: Date | string | undefined): Date => {
    if (!date) return new Date();
    return typeof date === 'string' ? parseISO(date) : new Date(date);
  };
  
  const selectedDate = ref<Date>(normalizeDate(props.modelValue.date));
  
  const normalizeDateRange = (range?: [Date | string, Date | string]): [Date, Date] => {
    if (!range) {
      const today = new Date();
      const weekAgo = addDays(today, -7);
      return [startOfDay(weekAgo), endOfDay(today)];
    }
    return [
      startOfDay(normalizeDate(range[0])), 
      endOfDay(normalizeDate(range[1]))
    ];
  };
  
  const dateRange = ref<[Date, Date]>(normalizeDateRange(props.modelValue.dateRange));
  const showCalendar = ref<boolean>(false);
  const currentViewDate = ref<Date>(normalizeDate(
    currentPeriod.value === 'daily' && dateRange.value ? 
    dateRange.value[0] : 
    props.modelValue.date
  ));
  const tempRange = ref<[Date | null, Date | null]>([null, null]);

  // Дни недели (можно использовать локализацию date-fns)
  const weekDays: string[] = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  // Названия месяцев (используем локализацию date-fns)
  const monthNames: string[] = Array.from({ length: 12 }, (_, i) => 
    format(new Date(2000, i, 1), 'LLLL', { locale: ru })
      .charAt(0).toUpperCase() + format(new Date(2000, i, 1), 'LLLL', { locale: ru }).slice(1)
  );

  // Заголовок календаря
  const calendarTitle = computed<string>(() => {
    const date = currentViewDate.value;
    if (currentPeriod.value === 'yearly') {
      const decade = Math.floor(getYear(date) / 10) * 10;
      return `${decade} - ${decade + 9}`;
    }
    return format(date, 'LLLL yyyy', { locale: ru });
  });

  // Список годов для выбора (декада)
  const yearsList = computed<number[]>(() => {
    const year = getYear(currentViewDate.value);
    const decade = Math.floor(year / 10) * 10;
    const years: number[] = [];
    for (let i = decade - 1; i <= decade + 10; i++) {
      years.push(i);
    }
    return years;
  });

  // Форматированное значение даты для отображения
  const formattedDateValue = computed<string>(() => {
    if (currentPeriod.value === 'daily') {
      if (!dateRange.value || !dateRange.value[0] || !dateRange.value[1]) {
        return 'Выберите диапазон';
      }
      
      return `${format(dateRange.value[0], 'dd.MM.yyyy')} - ${format(dateRange.value[1], 'dd.MM.yyyy')}`;
    } else if (currentPeriod.value === 'monthly') {
      return format(selectedDate.value, 'LLLL yyyy', { locale: ru });
    } else {
      return format(selectedDate.value, 'yyyy');
    }
  });

  // Генерирует массив дней для текущего месяца в календаре
  const calendarDays = computed<CalendarDay[]>(() => {
    const year = getYear(currentViewDate.value);
    const month = getMonth(currentViewDate.value);
    
    // Первый день месяца
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    
    // Последний день месяца
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = getDate(lastDay);
    
    // Дни предыдущего месяца
    const prevMonthLastDay = getDate(new Date(year, month, 0));
    
    const days: CalendarDay[] = [];
    
    // Добавляем дни из предыдущего месяца
    for (let i = 0; i < firstDayOfWeek; i++) {
      const day = prevMonthLastDay - firstDayOfWeek + i + 1;
      days.push({
        date: new Date(year, month - 1, day),
        dayNumber: day,
        currentMonth: false
      });
    }
    
    // Добавляем дни текущего месяца
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        dayNumber: i,
        currentMonth: true
      });
    }
    
    // Добавляем дни следующего месяца
    const remainingCells = 42 - days.length; // 6 строк по 7 дней
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        dayNumber: i,
        currentMonth: false
      });
    }
    
    return days;
  });

  // Проверка, является ли дата началом выбранного диапазона
  const isSelectedStart = (date: Date): boolean => {
    if (!tempRange.value[0] || !tempRange.value[1]) {
      return !!(dateRange.value && dateRange.value[0] && isSameDay(date, dateRange.value[0]));
    }
    
    return !!(tempRange.value[0] && isSameDay(date, tempRange.value[0]));
  };

  // Проверка, является ли дата концом выбранного диапазона
  const isSelectedEnd = (date: Date): boolean => {
    if (!tempRange.value[0] || !tempRange.value[1]) {
      return !!(dateRange.value && dateRange.value[1] && isSameDay(date, dateRange.value[1]));
    }
    
    return !!(tempRange.value[1] && isSameDay(date, tempRange.value[1]));
  };

  // Проверка, входит ли дата в выбранный диапазон
  const isInRange = (date: Date): boolean => {
    if (currentPeriod.value !== 'daily') return false;
    
    let start: Date, end: Date;
    
    if (tempRange.value[0] && tempRange.value[1]) {
      start = tempRange.value[0];
      end = tempRange.value[1];
    } else if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
      start = dateRange.value[0];
      end = dateRange.value[1];
    } else {
      return false;
    }
    
    return isWithinInterval(date, { start, end });
  };

  // Проверка, является ли дата сегодняшней
  const isToday = (date: Date): boolean => {
    return isTodayFn(date);
  };

  // Проверка, является ли месяц выбранным
  const isSelectedMonth = (month: number): boolean => {
    return isSameMonth(
      selectedDate.value, 
      new Date(getYear(currentViewDate.value), month, 1)
    );
  };

  // Проверка, является ли год выбранным
  const isSelectedYear = (year: number): boolean => {
    return isSameYear(selectedDate.value, new Date(year, 0, 1));
  };

  // Методы
  const setPeriod = (period: 'daily' | 'monthly' | 'yearly'): void => {
    currentPeriod.value = period;
    
    // Обновляем состояние в соответствии с выбранным периодом
    if (period === 'daily') {
      if (!props.modelValue.dateRange) {
        const today = new Date();
        const weekAgo = addDays(today, -7);
        dateRange.value = [startOfDay(weekAgo), endOfDay(today)];
      } else {
        dateRange.value = [
          startOfDay(normalizeDate(props.modelValue.dateRange[0])), 
          endOfDay(normalizeDate(props.modelValue.dateRange[1]))
        ];
      }
    } else if (period === 'monthly') {
      selectedDate.value = props.modelValue.date 
        ? startOfMonth(normalizeDate(props.modelValue.date))
        : startOfMonth(new Date());
    } else {
      selectedDate.value = props.modelValue.date 
        ? startOfYear(normalizeDate(props.modelValue.date))
        : startOfYear(new Date());
    }
    
    // Обновляем currentViewDate для правильного отображения календаря
    if (period === 'daily' && dateRange.value && dateRange.value[0]) {
      currentViewDate.value = new Date(dateRange.value[0]);
    } else {
      currentViewDate.value = new Date(selectedDate.value);
    }
    
    // Обновляем модель
    updateModelValue();
  };

  const toggleCalendar = (): void => {
    showCalendar.value = !showCalendar.value;
    
    if (showCalendar.value) {
      // Сброс временного выбора при открытии календаря
      tempRange.value = [null, null];
    }
  };

  const hideCalendar = (): void => {
    showCalendar.value = false;
    tempRange.value = [null, null];
  };

  const navigateDate = (direction: number): void => {
    if (currentPeriod.value === 'daily') {
      // Для daily перемещаем весь диапазон
      const startDate = new Date(dateRange.value[0]);
      const endDate = new Date(dateRange.value[1]);
      
      const diffDays = differenceInDays(endDate, startDate) + 1;
      
      const newStartDate = addDays(startDate, direction * diffDays);
      const newEndDate = addDays(endDate, direction * diffDays);
      
      dateRange.value = [startOfDay(newStartDate), endOfDay(newEndDate)];
      currentViewDate.value = new Date(newStartDate);
    } else if (currentPeriod.value === 'monthly') {
      // Для monthly перемещаемся по месяцам
      const newDate = addMonths(selectedDate.value, direction);
      selectedDate.value = startOfMonth(newDate);
      currentViewDate.value = new Date(selectedDate.value);
    } else {
      // Для yearly перемещаемся по годам
      const newDate = addYears(selectedDate.value, direction);
      selectedDate.value = startOfYear(newDate);
      currentViewDate.value = new Date(selectedDate.value);
    }
    
    updateModelValue();
  };

  const navigateMonth = (direction: number): void => {
    if (currentPeriod.value === 'yearly') {
      // Для yearly перемещаемся по декадам
      currentViewDate.value = addYears(currentViewDate.value, direction * 10);
    } else {
      // Для остальных по месяцам
      currentViewDate.value = addMonths(currentViewDate.value, direction);
    }
  };

  const selectDate = (date: Date): void => {
    if (currentPeriod.value !== 'daily') return;
    
    // В режиме диапазона
    if (!tempRange.value[0]) {
      // Первый выбор
      tempRange.value = [startOfDay(date), null];
    } else if (!tempRange.value[1]) {
      // Второй выбор
      const firstDate = tempRange.value[0]!;
      
      // Убедимся, что даты в правильном порядке
      if (date < firstDate) {
        tempRange.value = [startOfDay(date), endOfDay(firstDate)];
      } else {
        tempRange.value = [startOfDay(firstDate), endOfDay(date)];
      }
    } else {
      // Сброс и начало нового выбора
      tempRange.value = [startOfDay(date), null];
    }
  };

  const selectMonth = (month: number): void => {
    const newDate = new Date(getYear(currentViewDate.value), month, 1);
    selectedDate.value = startOfMonth(newDate);
    currentViewDate.value = new Date(selectedDate.value);
    
    updateModelValue();
    hideCalendar();
  };

  const selectYear = (year: number): void => {
    const newDate = new Date(year, getMonth(selectedDate.value), 1);
    selectedDate.value = startOfMonth(newDate);
    currentViewDate.value = new Date(selectedDate.value);
    
    updateModelValue();
    hideCalendar();
  };

  const confirmSelection = (): void => {
    if (tempRange.value[0] && tempRange.value[1]) {
      dateRange.value = [
        startOfDay(tempRange.value[0]),
        endOfDay(tempRange.value[1])
      ];
      
      tempRange.value = [null, null];
      updateModelValue();
      hideCalendar();
    }
  };

  const updateModelValue = (): void => {
    if (currentPeriod.value === 'daily') {
      // Для режима по дням передаем как dateRange, так и dateFrom/dateTo
      const model = {
        period: currentPeriod.value,
        dateRange: dateRange.value,
        dateFrom: dateRange.value[0],
        dateTo: dateRange.value[1]
      };
      console.log('Emitting daily filter update:', model);
      emit('update:modelValue', model);
    } else {
      emit('update:modelValue', {
        period: currentPeriod.value,
        date: selectedDate.value
      });
    }
  };

  // Следим за изменениями props
  watch(() => props.modelValue, (newValue) => {
    if (newValue.period && newValue.period !== currentPeriod.value) {
      currentPeriod.value = newValue.period;
    }
    
    if (newValue.period === 'daily' && newValue.dateRange) {
      dateRange.value = [
        startOfDay(normalizeDate(newValue.dateRange[0])), 
        endOfDay(normalizeDate(newValue.dateRange[1]))
      ];
    } else if (newValue.date) {
      selectedDate.value = normalizeDate(newValue.date);
      
      // Нормализация даты в соответствии с периодом
      if (currentPeriod.value === 'monthly') {
        selectedDate.value = startOfMonth(selectedDate.value);
      } else if (currentPeriod.value === 'yearly') {
        selectedDate.value = startOfYear(selectedDate.value);
      }
    }
    
    // Обновляем текущую отображаемую дату
    if (currentPeriod.value === 'daily' && dateRange.value && dateRange.value[0]) {
      currentViewDate.value = new Date(dateRange.value[0]);
    } else {
      currentViewDate.value = new Date(selectedDate.value);
    }
  }, { deep: true });

  // Возвращаем состояние и методы
  return {
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
    toggleCalendar,
    hideCalendar,
    navigateDate,
    navigateMonth,
    selectDate,
    selectMonth,
    selectYear,
    confirmSelection,
    updateModelValue
  };
}