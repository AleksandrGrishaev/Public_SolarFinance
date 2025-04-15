// src/composables/useDateFilter.ts
import { ref, computed, watch} from 'vue';

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
  const selectedDate = ref<Date>(props.modelValue.date || new Date());
  const dateRange = ref<[Date, Date]>(props.modelValue.dateRange || [
    new Date(new Date().setDate(new Date().getDate() - 7)), 
    new Date()
  ]);
  const showCalendar = ref<boolean>(false);
  const currentViewDate = ref<Date>(new Date());
  const tempRange = ref<[Date | null, Date | null]>([null, null]); // Временное хранение выбора диапазона

  // Дни недели
  const weekDays: string[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Названия месяцев
  const monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Заголовок календаря
  const calendarTitle = computed<string>(() => {
    const date = currentViewDate.value;
    if (currentPeriod.value === 'yearly') {
      const decade = Math.floor(date.getFullYear() / 10) * 10;
      return `${decade} - ${decade + 9}`;
    }
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  });

  // Список годов для выбора (декада)
  const yearsList = computed<number[]>(() => {
    const year = currentViewDate.value.getFullYear();
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
        return 'Select range';
      }
      
      const formatDate = (date: Date): string => {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        return `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${date.getFullYear()}`;
      };
      
      return `${formatDate(dateRange.value[0])} - ${formatDate(dateRange.value[1])}`;
    } else if (currentPeriod.value === 'monthly') {
      return `${monthNames[selectedDate.value.getMonth()]} ${selectedDate.value.getFullYear()}`;
    } else {
      return `${selectedDate.value.getFullYear()}`;
    }
  });

  // Генерирует массив дней для текущего месяца в календаре
  const calendarDays = computed<CalendarDay[]>(() => {
    const year = currentViewDate.value.getFullYear();
    const month = currentViewDate.value.getMonth();
    
    // Первый день месяца
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    
    // Последний день месяца
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Дни предыдущего месяца
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
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
      return !!(dateRange.value && dateRange.value[0] && 
        date.getDate() === dateRange.value[0].getDate() && 
        date.getMonth() === dateRange.value[0].getMonth() && 
        date.getFullYear() === dateRange.value[0].getFullYear());
    }
    
    return !!(tempRange.value[0] && 
      date.getDate() === tempRange.value[0].getDate() && 
      date.getMonth() === tempRange.value[0].getMonth() && 
      date.getFullYear() === tempRange.value[0].getFullYear());
  };

  // Проверка, является ли дата концом выбранного диапазона
  const isSelectedEnd = (date: Date): boolean => {
    if (!tempRange.value[0] || !tempRange.value[1]) {
      return !!(dateRange.value && dateRange.value[1] && 
        date.getDate() === dateRange.value[1].getDate() && 
        date.getMonth() === dateRange.value[1].getMonth() && 
        date.getFullYear() === dateRange.value[1].getFullYear());
    }
    
    return !!(tempRange.value[1] && 
      date.getDate() === tempRange.value[1].getDate() && 
      date.getMonth() === tempRange.value[1].getMonth() && 
      date.getFullYear() === tempRange.value[1].getFullYear());
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
    
    const time = date.getTime();
    return time > start.getTime() && time < end.getTime();
  };

  // Проверка, является ли дата сегодняшней
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  // Проверка, является ли месяц выбранным
  const isSelectedMonth = (month: number): boolean => {
    return selectedDate.value.getMonth() === month && 
           selectedDate.value.getFullYear() === currentViewDate.value.getFullYear();
  };

  // Проверка, является ли год выбранным
  const isSelectedYear = (year: number): boolean => {
    return selectedDate.value.getFullYear() === year;
  };

  // Методы
  const setPeriod = (period: 'daily' | 'monthly' | 'yearly'): void => {
    currentPeriod.value = period;
    
    // Обновляем состояние в соответствии с выбранным периодом
    if (period === 'daily') {
      if (!props.modelValue.dateRange) {
        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateRange.value = [weekAgo, today];
      } else {
        dateRange.value = [new Date(props.modelValue.dateRange[0]), new Date(props.modelValue.dateRange[1])];
      }
    } else {
      if (!props.modelValue.date) {
        if (period === 'monthly') {
          const now = new Date();
          selectedDate.value = new Date(now.getFullYear(), now.getMonth(), 1);
        } else {
          const now = new Date();
          selectedDate.value = new Date(now.getFullYear(), 0, 1);
        }
      } else {
        selectedDate.value = new Date(props.modelValue.date);
      }
    }
    
    // Обновляем currentViewDate для правильного отображения календаря
    if (period === 'daily') {
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
      
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      startDate.setDate(startDate.getDate() + direction * diffDays);
      endDate.setDate(endDate.getDate() + direction * diffDays);
      
      dateRange.value = [startDate, endDate];
      currentViewDate.value = new Date(startDate);
    } else if (currentPeriod.value === 'monthly') {
      // Для monthly перемещаемся по месяцам
      const date = new Date(selectedDate.value);
      date.setMonth(date.getMonth() + direction);
      selectedDate.value = date;
      currentViewDate.value = new Date(date);
    } else {
      // Для yearly перемещаемся по годам
      const date = new Date(selectedDate.value);
      date.setFullYear(date.getFullYear() + direction);
      selectedDate.value = date;
      currentViewDate.value = new Date(date);
    }
    
    updateModelValue();
  };

  const navigateMonth = (direction: number): void => {
    const date = new Date(currentViewDate.value);
    
    if (currentPeriod.value === 'yearly') {
      // Для yearly перемещаемся по декадам
      date.setFullYear(date.getFullYear() + direction * 10);
    } else {
      // Для остальных по месяцам
      date.setMonth(date.getMonth() + direction);
    }
    
    currentViewDate.value = date;
  };

  const selectDate = (date: Date): void => {
    if (currentPeriod.value !== 'daily') return;
    
    // В режиме диапазона
    if (!tempRange.value[0]) {
      // Первый выбор
      tempRange.value = [new Date(date), null];
    } else if (!tempRange.value[1]) {
      // Второй выбор
      const firstDate = tempRange.value[0]!;
      
      // Убедимся, что даты в правильном порядке
      if (date < firstDate) {
        tempRange.value = [new Date(date), new Date(firstDate)];
      } else {
        tempRange.value = [new Date(firstDate), new Date(date)];
      }
    } else {
      // Сброс и начало нового выбора
      tempRange.value = [new Date(date), null];
    }
  };

  const selectMonth = (month: number): void => {
    const date = new Date(currentViewDate.value);
    date.setMonth(month);
    selectedDate.value = date;
    currentViewDate.value = date;
    
    updateModelValue();
    hideCalendar();
  };

  const selectYear = (year: number): void => {
    const date = new Date(selectedDate.value);
    date.setFullYear(year);
    selectedDate.value = date;
    currentViewDate.value = date;
    
    updateModelValue();
    hideCalendar();
  };

  const confirmSelection = (): void => {
    if (tempRange.value[0] && tempRange.value[1]) {
      dateRange.value = [
        new Date(tempRange.value[0]),
        new Date(tempRange.value[1])
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
      dateRange.value = [new Date(newValue.dateRange[0]), new Date(newValue.dateRange[1])];
    } else if (newValue.date) {
      selectedDate.value = new Date(newValue.date);
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