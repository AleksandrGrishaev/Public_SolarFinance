// src/views/book/page/composables/useBookFinanceSummary.ts
import { ref, computed, watch } from 'vue';
import { useBookStore } from '@/stores/book';
import { useUserStore } from '@/stores/user';

export default function useBookFinanceSummary(bookId: string, emit: any) {
  // Хранилища
  const bookStore = useBookStore();
  const userStore = useUserStore();
  
  // Состояние
  const ownerDistribution = ref(50); // Начальное значение слайдера (50/50)
  const dateFilter = ref({
    period: 'monthly',
    date: new Date(),
    dateRange: [
      new Date(new Date().setDate(new Date().getDate() - 7)), 
      new Date()
    ]
  });
  
  // Получаем данные книги
  const bookData = computed(() => {
    const book = bookStore.getBookById(bookId);
    
    if (!book) {
      return {
        name: 'Unknown Book',
        incomeAmount: 0,
        expenseAmount: -11867,
        totalAmount: -11867,
        distributionRules: []
      };
    }
    
    // В реальном приложении эти значения должны рассчитываться на основе транзакций
    return {
      name: book.name,
      incomeAmount: 0,
      expenseAmount: -11867,
      totalAmount: -11867,
      distributionRules: book.distributionRules || []
    };
  });
  
  // Формируем данные владельцев для слайдера
  const ownerSides = computed(() => {
    if (!bookData.value.distributionRules || bookData.value.distributionRules.length < 2) {
      return [
        { name: 'Alex', id: 'me' },
        { name: 'Sasha Solar', id: 'other' }
      ];
    }
    
    return bookData.value.distributionRules.map(rule => {
      const user = userStore.getAllUsers().find(user => user.id === rule.ownerId);
      return {
        name: user ? user.name : 'Unknown',
        id: rule.ownerId
      };
    });
  });
  
  // Методы форматирования и вспомогательные функции
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '';
    
    // Убираем плюс для положительных значений в соответствии со скриншотом
    return `Rp ${Math.abs(amount).toLocaleString()}`;
  };
  
  const formatCurrency = (value) => {
    return `Rp ${Math.abs(value).toLocaleString()}`;
  };
  
  const getTotalClass = (amount) => {
    if (amount > 0) return 'amount-positive';
    if (amount < 0) return 'amount-negative';
    return '';
  };
  
  // Получение стиля для слайдера (градиент)
  const getSliderStyle = () => {
    const percentage = ownerDistribution.value;
    const leftColor = '#555555'; // Цвет для первого участника (темно-серый)
    const rightColor = '#4F9FC8'; // Цвет для второго участника (голубой)
    
    return {
      background: `linear-gradient(to right, ${leftColor} 0%, ${leftColor} ${percentage}%, ${rightColor} ${percentage}%, ${rightColor} 100%)`
    };
  };
  
  // Получение стиля для участника (соответствующий цвет)
  const getParticipantStyle = (index) => {
    const leftColor = '#555555'; // Цвет для первого участника
    const rightColor = '#4F9FC8'; // Цвет для второго участника
    
    return {
      color: index === 0 ? leftColor : rightColor
    };
  };
  
  // Расчет суммы для каждого участника
  const getParticipantAmount = (index) => {
    const totalAmount = Math.abs(bookData.value.totalAmount);
    const percentage = index === 0 ? ownerDistribution.value : 100 - ownerDistribution.value;
    
    return totalAmount * (percentage / 100);
  };
  
  // Обновление значения слайдера
  const updateOwnerDistribution = (event) => {
    ownerDistribution.value = parseInt(event.target.value);
  };
  
  // Обработчики событий
  const onCalendarVisibilityChange = (isVisible) => {
    console.log('Calendar visibility changed:', isVisible);
  };
  
  // Отслеживаем изменения фильтра даты и пробрасываем их наверх
  watch(dateFilter, (newValue) => {
    emit('update:dateFilter', newValue);
  }, { deep: true });
  
  // Инициализация хранилищ
  const initStores = async () => {
    if (!bookStore.isInitialized) {
      await bookStore.init();
    }
    
    if (!userStore.isInitialized) {
      await userStore.init();
    }
  };
  
  return {
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
  };
}