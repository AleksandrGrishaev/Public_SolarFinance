<!-- src/views/debt/components/DebtList.vue -->
<template>
    <div class="debt-list">
      <div v-if="isLoading" class="debt-list__loading">
        <div class="spinner">Loading...</div>
      </div>
      
      <div v-else-if="!debts.length" class="debt-list__empty">
        <p>{{ emptyMessage }}</p>
      </div>
      
      <div v-else class="debt-list__content">
        <!-- Группируем долги по валютам -->
        <template v-for="currency in usedCurrencies" :key="currency">
          <div class="currency-group">
            <div class="currency-header">
              <div class="currency-name">{{ getCurrencyName(currency) }}</div>
              <div class="currency-balance" :class="getBalanceClass(getBalanceForCurrency(currency))">
                {{ formatCurrencyBalance(getBalanceForCurrency(currency), currency) }}
              </div>
            </div>
            
            <!-- Выводим долги для данной валюты -->
            <div class="debt-items">
              <base-transaction-group
                v-for="(group, status) in groupDebtsByStatus(debtsForCurrency(currency))"
                :key="status"
                :title="getStatusTitle(status)"
                :amount="getTotalAmountForGroup(group, status)"
                :amountType="getAmountTypeForStatus(status)"
                :currency="currency"
              >
                <base-transaction-item
                  v-for="debt in group"
                  :key="debt.id"
                  :title="getDebtTitle(debt)"
                  :description="debt.description"
                  :subtitle="getDebtSubtitle(debt)"
                  :amount="getDisplayAmount(debt)"
                  :currency="debt.currency"
                  :amountType="getAmountTypeForDebt(debt)"
                  :icon="getIconForDebt(debt)"
                  :iconColor="getColorForDebt(debt)"
                  :info="getDebtInfo(debt)"
                  @click="selectDebt(debt)"
                />
              </base-transaction-group>
            </div>
          </div>
        </template>
      </div>
      
      <!-- Кнопка добавления нового долга -->
      <div v-if="showAddButton" class="debt-list__add-button" @click="onAddDebt">
        <IconPlus size="24" />
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, PropType, computed } from 'vue';
  import { IconPlus, IconCash, IconCashBanknote, IconArrowRight, IconArrowLeft } from '@tabler/icons-vue';
  import type { Debt, DebtStatus } from '@/stores/debt/types';
  import BaseTransactionGroup from '@/components/ui/views/BaseTransactionGroup.vue';
  import BaseTransactionItem from '@/components/ui/views/BaseTransactionItem.vue';
  import { useDebts } from '@/views/debt/composables/useDebts';
  import { useCurrencyStore } from '@/stores/currency';
  
  export default defineComponent({
    name: 'DebtList',
    components: {
      BaseTransactionGroup,
      BaseTransactionItem,
      IconPlus
    },
    props: {
      debts: {
        type: Array as PropType<Debt[]>,
        required: true
      },
      isLoading: {
        type: Boolean,
        default: false
      },
      showAddButton: {
        type: Boolean,
        default: true
      },
      filterByCurrentUser: {
        type: Boolean,
        default: false
      },
      emptyMessage: {
        type: String,
        default: 'Нет долгов для отображения'
      },
      onlyActive: {
        type: Boolean,
        default: true
      }
    },
    emits: ['select-debt', 'add-debt'],
    setup(props, { emit }) {
      const { getUserName, formatAmount } = useDebts();
      const currencyStore = useCurrencyStore();
      
      // Получение всех используемых валют
      const usedCurrencies = computed(() => {
        const currencies = new Set<string>();
        props.debts.forEach(debt => currencies.add(debt.currency));
        return Array.from(currencies);
      });
      
      // Долги для конкретной валюты
      const debtsForCurrency = (currency: string) => {
        return props.debts.filter(debt => debt.currency === currency);
      };
      
      // Группировка долгов по статусу
      const groupDebtsByStatus = (debts: Debt[]) => {
        const groups: Record<DebtStatus, Debt[]> = {
          'active': [],
          'partially_paid': [],
          'paid': [],
          'cancelled': []
        };
        
        debts.forEach(debt => {
          groups[debt.status].push(debt);
        });
        
        // Если нужны только активные, удаляем оплаченные и отмененные
        if (props.onlyActive) {
          delete groups['paid'];
          delete groups['cancelled'];
        }
        
        // Удаляем пустые группы
        Object.keys(groups).forEach(key => {
          if (groups[key as DebtStatus].length === 0) {
            delete groups[key as DebtStatus];
          }
        });
        
        return groups;
      };
      
      // Получение текстового представления статуса
      const getStatusTitle = (status: string) => {
        const statusMap: Record<string, string> = {
          'active': 'Активные долги',
          'partially_paid': 'Частично оплаченные',
          'paid': 'Оплаченные',
          'cancelled': 'Отмененные'
        };
        
        return statusMap[status] || status;
      };
      
      // Получение общей суммы для группы долгов
      const getTotalAmountForGroup = (debts: Debt[], status: string) => {
        if (status === 'paid' || status === 'cancelled') return 0;
        
        return debts.reduce((sum, debt) => {
          // Для внутренних долгов учитываем знак
          if (debt.type === 'internal') {
            // Если это долг текущего пользователя кому-то
            if (debt.fromUserId === 'user_1') { // Hardcoded currentUserId
              return sum - debt.remainingAmount;
            }
            // Если это долг кого-то текущему пользователю
            else if (debt.toUserId === 'user_1') { // Hardcoded currentUserId
              return sum + debt.remainingAmount;
            }
          }
          
          // Для внешних долгов всегда отрицательные
          if (debt.type === 'external') {
            return sum - debt.remainingAmount;
          }
          
          return sum;
        }, 0);
      };
      
      // Определение типа суммы для отображения
      const getAmountTypeForStatus = (status: string) => {
        if (status === 'active' || status === 'partially_paid') {
          return getTotalAmountForGroup(
            props.debts.filter(d => d.status === status as DebtStatus), 
            status
          ) >= 0 ? 'positive' : 'negative';
        }
        
        return 'neutral';
      };
      
      // Заголовок для отображения долга
      const getDebtTitle = (debt: Debt) => {
        if (debt.type === 'internal') {
          if (debt.fromUserId === 'user_1') { // Hardcoded currentUserId
            return `Должен ${getUserName(debt.toUserId!)}`;
          } else {
            return `${getUserName(debt.fromUserId!)} должен вам`;
          }
        } else if (debt.type === 'external') {
          return `Долг: ${debt.creditorName || 'Внешний'}`;
        }
        
        return 'Долг';
      };
      
      // Подзаголовок для долга
      const getDebtSubtitle = (debt: Debt) => {
        if (debt.dueDate) {
          const dueDate = new Date(debt.dueDate);
          return `До: ${dueDate.toLocaleDateString()}`;
        }
        
        if (debt.source === 'transaction') {
          return 'Из транзакции';
        }
        
        return '';
      };
      
      // Дополнительная информация
      const getDebtInfo = (debt: Debt) => {
        if (debt.paymentHistory && debt.paymentHistory.length > 0) {
          return `Платежей: ${debt.paymentHistory.length}`;
        }
        
        if (debt.interestRate) {
          return `Ставка: ${debt.interestRate}%`;
        }
        
        return '';
      };
      
      // Сумма для отображения
      const getDisplayAmount = (debt: Debt) => {
        if (debt.type === 'internal') {
          if (debt.fromUserId === 'user_1') { // Hardcoded currentUserId
            return -debt.remainingAmount;
          } else {
            return debt.remainingAmount;
          }
        }
        
        return -debt.remainingAmount;
      };
      
      // Тип суммы (положительная/отрицательная)
      const getAmountTypeForDebt = (debt: Debt) => {
        if (debt.status === 'paid' || debt.status === 'cancelled') {
          return 'neutral';
        }
        
        const amount = getDisplayAmount(debt);
        return amount >= 0 ? 'positive' : 'negative';
      };
      
      // Иконка для долга
      const getIconForDebt = (debt: Debt) => {
        if (debt.type === 'internal') {
          return debt.fromUserId === 'user_1' ? IconArrowRight : IconArrowLeft;
        } else if (debt.source === 'credit') {
          return IconCashBanknote;
        }
        
        return IconCash;
      };
      
      // Цвет иконки
      const getColorForDebt = (debt: Debt) => {
        if (debt.status === 'paid') return '#53B794'; // success color
        if (debt.status === 'cancelled') return '#949496'; // neutral color
        
        if (debt.type === 'internal') {
          return debt.fromUserId === 'user_1' ? '#A44942' : '#53B794';
        }
        
        return '#7B61FF'; // default color for external debts
      };
      
      // Получение названия валюты
      const getCurrencyName = (code: string) => {
        const currency = currencyStore.getCurrency(code);
        return currency ? currency.name : code;
      };
      
      // Получение баланса для валюты
      const getBalanceForCurrency = (currency: string) => {
        return props.debts
          .filter(debt => debt.currency === currency && (debt.status === 'active' || debt.status === 'partially_paid'))
          .reduce((balance, debt) => {
            const amount = getDisplayAmount(debt);
            return balance + amount;
          }, 0);
      };
      
      // Класс для баланса (для стилизации)
      const getBalanceClass = (balance: number) => {
        if (balance > 0) return 'positive-balance';
        if (balance < 0) return 'negative-balance';
        return '';
      };
      
      // Форматирование баланса валюты
      const formatCurrencyBalance = (balance: number, currency: string) => {
        const prefix = balance > 0 ? '+' : '';
        return `${prefix}${formatAmount(balance, currency)}`;
      };
      
      // Выбор долга
      const selectDebt = (debt: Debt) => {
        emit('select-debt', debt);
      };
      
      // Добавление нового долга
      const onAddDebt = () => {
        emit('add-debt');
      };
      
      return {
        usedCurrencies,
        debtsForCurrency,
        groupDebtsByStatus,
        getStatusTitle,
        getTotalAmountForGroup,
        getAmountTypeForStatus,
        getDebtTitle,
        getDebtSubtitle,
        getDebtInfo,
        getDisplayAmount,
        getAmountTypeForDebt,
        getIconForDebt,
        getColorForDebt,
        getCurrencyName,
        getBalanceForCurrency,
        getBalanceClass,
        formatCurrencyBalance,
        selectDebt,
        onAddDebt
      };
    }
  });
  </script>
  
  <style scoped>
  .debt-list {
    width: 100%;
    position: relative;
    padding-bottom: 80px; /* Space for add button */
  }
  
  .debt-list__loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 0;
  }
  
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid var(--accent-color);
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .debt-list__empty {
    text-align: center;
    padding: 40px 0;
    color: var(--text-secondary);
  }
  
  .debt-list__content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .currency-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .currency-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background-color: var(--bg-light);
    border-radius: 8px;
  }
  
  .currency-name {
    font-weight: 600;
    color: var(--text-header);
  }
  
  .currency-balance {
    font-weight: 600;
  }
  
  .positive-balance {
    color: var(--color-success);
  }
  
  .negative-balance {
    color: var(--color-warning);
  }
  
  .debt-list__add-button {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: var(--accent-color);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    z-index: 100;
  }
  
  .debt-list__add-button:hover {
    transform: scale(1.05);
  }
  
  /* Dark mode compatibility */
  @media (prefers-color-scheme: dark) {
    .debt-list__add-button {
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
    }
  }
  </style>