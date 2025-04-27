// src/stores/debt/debtStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// Типы для долгов
export type DebtType = 'internal' | 'external' | 'family' | 'group';
export type DebtCategory = 'loan' | 'mortgage' | 'credit_card' | 'personal_loan' | 'family_debt' | 'group_debt' | 'book_balance';
export type DebtStatus = 'active' | 'partially_paid' | 'paid' | 'cancelled';
export type DebtSource = 'transaction' | 'manual' | 'credit' | 'mortgage';
export type DebtOwner = 'my' | 'family' | 'all';
export type DebtGroup = 'book' | 'person' | 'credit'; 

// Участник долгового отношения
export interface DebtParty {
  entityId: string;         // ID пользователя или группы
  entityType: 'user' | 'group'; // Тип участника
  percentage: number;       // Процент ответственности (0-100)
  name?: string;            // Имя участника
}

// Основная структура долга
export interface Debt {
  id: string;
  name: string;             // Название долга/кредита
  amount: number;           // Первоначальная сумма
  remainingAmount: number;  // Оставшаяся сумма
  currency: string;
  group: DebtGroup;         // Группа долга (book, person, credit)
  type: DebtType;           // Тип долга
  category: DebtCategory;   // Категория долга
  status: DebtStatus;       // Статус долга
  source: DebtSource;       // Источник возникновения
  
  createdAt: Date;
  updatedAt: Date;
  startDate: Date;          // Дата начала
  endDate?: Date;           // Дата планового окончания
  dueDate?: Date;           // Срок следующего платежа
  description?: string;
  bookId?: string;          // ID книги (для долгов из книг)
  
  // Для внешних долгов
  creditorType?: 'bank' | 'organization' | 'person';
  creditorId?: string;      // ID человека, если creditorType === 'person'
  creditorName?: string;    // Название банка или имя человека
  interestRate?: number;    // Процентная ставка
  totalInterest?: number;   // Общая сумма процентов за весь срок
  
  // Участники долга
  fromParties?: DebtParty[];// Кто должен (может быть несколько)
  toParties?: DebtParty[];  // Кому должен (может быть несколько)
  
  // Связь со счетом зачисления
  linkedAccountId?: string;
  
  // Дополнительные метаданные
  icon?: string;
  color?: string;
  subtitle?: string;        // Подзаголовок для отображения (например, "House" для "Mortgage")
}

export const useDebtStore = defineStore('debt', () => {
  // Состояние
  const debts = ref<Debt[]>([]);
  const selectedOwner = ref<DebtOwner>('my');
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  // Вычисляемые свойства
  const totalDebtAmount = computed(() => {
    return filteredDebts.value.reduce((sum, debt) => {
      // Если мы должны другим, это отрицательное значение
      const multiplier = isDebtOwed(debt) ? 1 : -1;
      return sum + (debt.remainingAmount * multiplier);
    }, 0);
  });
  
  // Функция определяет, является ли долг положительным для нас (нам должны)
  const isDebtOwed = (debt: Debt): boolean => {
    // Для демонстрации будем считать, что долг положительный, если его имя начинается с "Debt"
    return debt.name.startsWith('Debt');
  };
  
  // Группируем долги по категориям для отображения
  const debtsByGroup = computed(() => {
    const grouped: Record<string, Debt[]> = {
      'book': [],
      'person': [],
      'credit': []
    };
    
    filteredDebts.value.forEach(debt => {
      if (grouped[debt.group]) {
        grouped[debt.group].push(debt);
      }
    });
    
    return grouped;
  });
  
  // Общая сумма по группе долгов
  const totalByGroup = computed(() => {
    const totals: Record<string, number> = {
      'book': 0,
      'person': 0,
      'credit': 0
    };
    
    Object.keys(debtsByGroup.value).forEach(group => {
      debtsByGroup.value[group].forEach(debt => {
        const multiplier = isDebtOwed(debt) ? 1 : -1;
        totals[group] += debt.remainingAmount * multiplier;
      });
    });
    
    return totals;
  });
  
  // Отфильтрованные долги по выбранному владельцу
  const filteredDebts = computed(() => {
    if (selectedOwner.value === 'all') {
      return debts.value;
    }
    
    return debts.value.filter(debt => {
      if (selectedOwner.value === 'my') {
        // Проверяем, есть ли текущий пользователь в fromParties с 100% ответственностью
        return debt.fromParties?.some(party => 
          party.entityId === 'current_user_id' && party.percentage === 100
        );
      } else if (selectedOwner.value === 'family') {
        // Проверяем наличие других пользователей в fromParties
        return debt.fromParties?.some(party => party.entityId !== 'current_user_id');
      }
      
      return false;
    });
  });
  
  // Действия
  const fetchDebts = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // В реальном приложении здесь был бы API-запрос
      // Для демонстрации используем захардкоженные данные
      debts.value = getMockDebts();
    } catch (err) {
      console.error('Failed to fetch debts:', err);
      error.value = 'Failed to load debts';
    } finally {
      isLoading.value = false;
    }
  };
  
  const setSelectedOwner = (owner: DebtOwner) => {
    selectedOwner.value = owner;
  };
  
  const addDebt = (debt: Debt) => {
    debts.value.push(debt);
  };
  
  const updateDebt = (id: string, updates: Partial<Debt>) => {
    const index = debts.value.findIndex(d => d.id === id);
    if (index !== -1) {
      debts.value[index] = { ...debts.value[index], ...updates, updatedAt: new Date() };
    }
  };
  
  const deleteDebt = (id: string) => {
    debts.value = debts.value.filter(d => d.id !== id);
  };
  
  // Инициализация
  const init = async () => {
    await fetchDebts();
  };
  
  // Мок-данные для демонстрации
  const getMockDebts = (): Debt[] => {
    const now = new Date();
    
    return [
      {
        id: 'book-1',
        name: 'Family book',
        amount: 1145000,
        remainingAmount: 1145000,
        currency: 'IDR',
        group: 'book',
        type: 'family',
        category: 'book_balance',
        status: 'active',
        source: 'manual',
        createdAt: now,
        updatedAt: now,
        startDate: now,
        bookId: 'family-book',
        fromParties: [
          { entityId: 'current_user_id', entityType: 'user', percentage: 50, name: 'You' },
          { entityId: 'spouse', entityType: 'user', percentage: 50, name: 'Spouse' }
        ]
      },
      {
        id: 'person-1',
        name: 'Debt 1',
        amount: 2200000,
        remainingAmount: 2200000,
        currency: 'IDR',
        group: 'person',
        type: 'internal',
        category: 'personal_loan',
        status: 'active',
        source: 'manual',
        createdAt: now,
        updatedAt: now,
        startDate: now,
        subtitle: 'Ruka Pomoshi',
        fromParties: [
          { entityId: 'friend1', entityType: 'user', percentage: 100, name: 'Friend 1' }
        ],
        toParties: [
          { entityId: 'current_user_id', entityType: 'user', percentage: 100, name: 'You' }
        ]
      },
      {
        id: 'person-2',
        name: 'Debt 2',
        amount: 50000,
        remainingAmount: 50000,
        currency: 'RUB',
        group: 'person',
        type: 'internal',
        category: 'personal_loan',
        status: 'active',
        source: 'manual',
        createdAt: now,
        updatedAt: now,
        startDate: now,
        subtitle: 'Yakov',
        fromParties: [
          { entityId: 'current_user_id', entityType: 'user', percentage: 100, name: 'You' }
        ],
        toParties: [
          { entityId: 'friend2', entityType: 'user', percentage: 100, name: 'Friend 2' }
        ]
      },
      {
        id: 'person-3',
        name: 'Debt 3',
        amount: 1800,
        remainingAmount: 1800,
        currency: 'USD',
        group: 'person',
        type: 'internal',
        category: 'personal_loan',
        status: 'active',
        source: 'manual',
        createdAt: now,
        updatedAt: now,
        startDate: now,
        subtitle: 'Karl',
        fromParties: [
          { entityId: 'current_user_id', entityType: 'user', percentage: 100, name: 'You' }
        ],
        toParties: [
          { entityId: 'friend3', entityType: 'user', percentage: 100, name: 'Friend 3' }
        ]
      },
      {
        id: 'credit-1',
        name: 'Mortgage',
        amount: 34000,
        remainingAmount: 34000,
        currency: 'USD',
        group: 'credit',
        type: 'external',
        category: 'mortgage',
        status: 'active',
        source: 'mortgage',
        createdAt: now,
        updatedAt: now,
        startDate: now,
        endDate: new Date(now.getFullYear() + 15, now.getMonth(), now.getDate()),
        subtitle: 'House',
        creditorType: 'bank',
        creditorName: 'Bank',
        interestRate: 4.5,
        fromParties: [
          { entityId: 'current_user_id', entityType: 'user', percentage: 50, name: 'You' },
          { entityId: 'spouse', entityType: 'user', percentage: 50, name: 'Spouse' }
        ]
      },
      {
        id: 'credit-2',
        name: 'Car',
        amount: 12300,
        remainingAmount: 12300,
        currency: 'USD',
        group: 'credit',
        type: 'external',
        category: 'loan',
        status: 'active',
        source: 'credit',
        createdAt: now,
        updatedAt: now,
        startDate: now,
        endDate: new Date(now.getFullYear() + 3, now.getMonth(), now.getDate()),
        subtitle: 'Mazda CX5',
        creditorType: 'bank',
        creditorName: 'Auto Bank',
        interestRate: 6.7,
        fromParties: [
          { entityId: 'current_user_id', entityType: 'user', percentage: 100, name: 'You' }
        ]
      }
    ];
  };
  
  return {
    debts,
    selectedOwner,
    isLoading,
    error,
    totalDebtAmount,
    debtsByGroup,
    totalByGroup,
    filteredDebts,
    fetchDebts,
    setSelectedOwner,
    addDebt,
    updateDebt,
    deleteDebt,
    init,
    isDebtOwed
  };
});