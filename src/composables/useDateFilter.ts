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
  // Временный период (который еще не подтвержден)
  const tempPeriod = ref<'daily' | 'monthly' | 'yearly'>(props.modelValue.period || 'monthly');
  
  // Флаг, который указывает, что период был изменен, но выбор еще не подтвержден
  const periodChanged = ref<boolean>(false);
  
  // Нормализуем даты через date-fns
  const normalizeDate = (date: Date | string | undefined): Date => {
    if (!date) return new Date();
    return typeof date === 'string' ? parseISO(date) : new Date(date);
  };
  
  // Нормализация дат для корректного использования в компоненте
  const normalizeInitialDate = (date: Date | string | undefined, period: 'daily' | 'monthly' | 'yearly'): Date => {
    const normalDate = normalizeDate(date);
    
    if (period === 'monthly') {
      return startOfMonth(normalDate);
    } else if (period === 'yearly') {
      return startOfYear(normalDate);
    }
    
    return normalDate;
  };
  
  const selectedDate = ref<Date>(normalizeInitialDate(props.modelValue.date, props.modelValue.period || 'monthly'));
  
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
  
  // Инициализация даты просмотра в зависимости от периода
  const initialViewDate = (): Date => {
    const period = props.modelValue.period || 'monthly';
    
    if (period === 'daily' && props.modelValue.dateRange && props.modelValue.dateRange[0]) {
      return normalizeDate(props.modelValue.dateRange[0]);
    } else if (props.modelValue.date) {
      return normalizeInitialDate(props.modelValue.date, period);
    }
    
    return period === 'monthly' ? startOfMonth(new Date()) : 
           period === 'yearly' ? startOfYear(new Date()) : new Date();
  };
  
  const currentViewDate = ref<Date>(initialViewDate());
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
    if (tempPeriod.value === 'yearly') {
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
    if (tempPeriod.value !== 'daily') return false;
    
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
  // Устанавливаем период - теперь открывает календарь и не сразу применяет фильтр
  const setPeriod = (period: 'daily' | 'monthly' | 'yearly'): void => {
    console.log(`[useDateFilter] Setting period to ${period} (current is ${currentPeriod.value})`);
    
    // Если период изменился, сохраняем временно и открываем календарь
    if (period !== currentPeriod.value) {
      tempPeriod.value = period;
      periodChanged.value = true;
      
      // Открываем календарь для выбора конкретной даты/диапазона
      showCalendar.value = true;
      
      // Подготавливаем данные для выбора
      prepareTempPeriodData(period);
    } else {
      // Если период тот же, просто открываем/закрываем календарь
      toggleCalendar();
    }
  };
  
  // Подготовка данных для временного периода
  const prepareTempPeriodData = (period: 'daily' | 'monthly' | 'yearly'): void => {
    if (period === 'daily') {
      // Подготавливаем диапазон дат для daily
      if (!dateRange.value || !dateRange.value[0] || !dateRange.value[1]) {
        const today = new Date();
        const weekAgo = addDays(today, -7);
        tempRange.value = [startOfDay(weekAgo), endOfDay(today)];
      } else {
        tempRange.value = [dateRange.value[0], dateRange.value[1]];
      }
      
      // Устанавливаем текущую дату просмотра на начало диапазона
      currentViewDate.value = new Date(tempRange.value[0] || new Date());
    } else {
      // Для monthly и yearly используем текущую дату или сегодня
      const baseDate = selectedDate.value || new Date();
      
      if (period === 'monthly') {
        // Если переходим на monthly, устанавливаем на текущий месяц
        currentViewDate.value = startOfMonth(baseDate);
      } else {
        // Если переходим на yearly, устанавливаем на текущий год
        currentViewDate.value = startOfYear(baseDate);
      }
    }
  };

  const toggleCalendar = (): void => {
    showCalendar.value = !showCalendar.value;
    
    if (showCalendar.value) {
      // Сброс временного выбора при открытии календаря
      tempRange.value = [null, null];
      periodChanged.value = false;
      tempPeriod.value = currentPeriod.value;
    }
  };

  const hideCalendar = (): void => {
    showCalendar.value = false;
    tempRange.value = [null, null];
    
    // Сбрасываем временный период если пользователь отменил выбор
    if (periodChanged.value) {
      tempPeriod.value = currentPeriod.value;
      periodChanged.value = false;
    }
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
      
      // Автоматически обновляем модель при навигации
      updateModelValue();
    } else if (currentPeriod.value === 'monthly') {
      // Для monthly перемещаемся по месяцам
      const newDate = addMonths(selectedDate.value, direction);
      selectedDate.value = startOfMonth(newDate);
      currentViewDate.value = new Date(selectedDate.value);
      
      // Автоматически обновляем модель при навигации
      updateModelValue();
    } else {
      // Для yearly перемещаемся по годам
      const newDate = addYears(selectedDate.value, direction);
      selectedDate.value = startOfYear(newDate);
      currentViewDate.value = new Date(selectedDate.value);
      
      // Автоматически обновляем модель при навигации
      updateModelValue();
    }
  };

  const navigateMonth = (direction: number): void => {
    if (tempPeriod.value === 'yearly') {
      // Для yearly перемещаемся по декадам
      currentViewDate.value = addYears(currentViewDate.value, direction * 10);
    } else {
      // Для остальных по месяцам
      currentViewDate.value = addMonths(currentViewDate.value, direction);
    }
  };

  const selectDate = (date: Date): void => {
    if (tempPeriod.value !== 'daily') return;
    
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
    
    // Применяем период и обновляем модель
    applyPeriodAndUpdateModel();
  };

  const selectYear = (year: number): void => {
    const newDate = new Date(year, getMonth(selectedDate.value), 1);
    selectedDate.value = startOfMonth(newDate);
    currentViewDate.value = new Date(selectedDate.value);
    
    // Применяем период и обновляем модель
    applyPeriodAndUpdateModel();
  };

  // Подтверждение выбора и закрытие календаря
  const confirmSelection = (): void => {
    // Если выбор диапазона завершен
    if (tempPeriod.value === 'daily' && tempRange.value[0] && tempRange.value[1]) {
      dateRange.value = [
        startOfDay(tempRange.value[0]),
        endOfDay(tempRange.value[1])
      ];
      
      tempRange.value = [null, null];
    }
    
    // Применяем период и обновляем модель
    applyPeriodAndUpdateModel();
  };
  
  // Метод для применения периода и обновления модели
  const applyPeriodAndUpdateModel = (): void => {
    // Если период был изменен, применяем его
    if (periodChanged.value) {
      currentPeriod.value = tempPeriod.value;
      periodChanged.value = false;
    }
    
    // Обновляем модель и закрываем календарь
    updateModelValue();
    hideCalendar();
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
      tempPeriod.value = newValue.period;
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
    tempPeriod,
    periodChanged,
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
    updateModelValue,
    applyPeriodAndUpdateModel
  };
}