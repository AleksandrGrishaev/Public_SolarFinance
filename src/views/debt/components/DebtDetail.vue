<!-- src/views/debt/components/DebtDetail.vue -->
<template>
    <div class="debt-detail">
      <div v-if="!debt" class="debt-detail__empty">
        <p>Выберите долг для просмотра деталей</p>
      </div>
      
      <div v-else class="debt-detail__content">
        <!-- Заголовок долга -->
        <div class="debt-detail__header">
          <div class="debt-icon" :style="{ backgroundColor: getIconColor(debt) }">
            <component :is="getIcon(debt)" size="24" color="white" />
          </div>
          <div class="debt-title">
            <h2>{{ getTitle(debt) }}</h2>
            <div class="debt-subtitle">{{ debt.description }}</div>
          </div>
        </div>
        
        <!-- Основная информация о долге -->
        <div class="debt-detail__info">
          <div class="info-row">
            <div class="info-label">Статус:</div>
            <div class="info-value">
              <span class="status-badge" :class="`status-${debt.status}`">
                {{ getStatusText(debt.status) }}
              </span>
            </div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Сумма:</div>
            <div class="info-value amount">
              {{ formatAmount(debt.amount, debt.currency) }}
            </div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Осталось:</div>
            <div class="info-value remaining" :class="getRemainingClass(debt)">
              {{ formatAmount(debt.remainingAmount, debt.currency) }}
            </div>
          </div>
          
          <div v-if="debt.dueDate" class="info-row">
            <div class="info-label">Срок:</div>
            <div class="info-value">
              {{ formatDate(debt.dueDate) }}
              <span v-if="isOverdue(debt)" class="overdue-tag">Просрочен</span>
            </div>
          </div>
          
          <div v-if="debt.type === 'external' && debt.creditorName" class="info-row">
            <div class="info-label">Кредитор:</div>
            <div class="info-value">{{ debt.creditorName }}</div>
          </div>
          
          <div v-if="debt.interestRate" class="info-row">
            <div class="info-label">Ставка:</div>
            <div class="info-value">{{ debt.interestRate }}%</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Книга:</div>
            <div class="info-value">{{ getBookName(debt.bookId) }}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Создан:</div>
            <div class="info-value">{{ formatDate(debt.createdAt) }}</div>
          </div>
          
          <div v-if="debt.updatedAt" class="info-row">
            <div class="info-label">Обновлен:</div>
            <div class="info-value">{{ formatDate(debt.updatedAt) }}</div>
          </div>
        </div>
        
        <!-- История платежей -->
        <div v-if="debt.paymentHistory?.length" class="debt-detail__payments">
          <h3>История платежей</h3>
          <table class="payments-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Сумма</th>
                <th>Описание</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in debt.paymentHistory" :key="payment.id">
                <td>{{ formatDate(payment.date) }}</td>
                <td>{{ formatAmount(payment.amount, payment.currency) }}</td>
                <td>{{ payment.description || 'Нет описания' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Кнопки действий -->
        <div class="debt-detail__actions">
          <template v-if="debt.status === 'active' || debt.status === 'partially_paid'">
            <base-button 
              text="Внести платеж" 
              @click="onAddPayment"
              :class="'action-button primary-button'"
            />
            <base-button 
              text="Отменить долг" 
              @click="onCancelDebt"
              :class="'action-button warning-button'"
            />
          </template>
          <base-button 
            text="Закрыть" 
            @click="onClose"
            :class="'action-button secondary-button'"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, PropType } from 'vue';
  import { 
    IconCash, 
    IconCashBanknote, 
    IconArrowRight, 
    IconArrowLeft,
    IconCreditCard
  } from '@tabler/icons-vue';
  import type { Debt, DebtStatus } from '@/stores/debt/types';
  import BaseButton from '@/components/atoms/buttons/BaseButton.vue';
  import { useDebts } from '@/views/debt/composables/useDebts';
  
  export default defineComponent({
    name: 'DebtDetail',
    components: {
      BaseButton
    },
    props: {
      debt: {
        type: Object as PropType<Debt>,
        default: null
      }
    },
    emits: ['add-payment', 'cancel-debt', 'close'],
    setup(props, { emit }) {
      const { formatAmount, getUserName, getBookName } = useDebts();
      
      // Получение иконки для долга
      const getIcon = (debt: Debt) => {
        if (debt.type === 'internal') {
          return debt.fromUserId === 'user_1' ? IconArrowRight : IconArrowLeft;
        } else if (debt.source === 'credit') {
          return IconCreditCard;
        } else if (debt.source === 'mortgage') {
          return IconCashBanknote;
        }
        
        return IconCash;
      };
      
      // Получение цвета иконки
      const getIconColor = (debt: Debt) => {
        if (debt.status === 'paid') return '#53B794'; // success color
        if (debt.status === 'cancelled') return '#949496'; // neutral color
        
        if (debt.type === 'internal') {
          return debt.fromUserId === 'user_1' ? '#A44942' : '#53B794';
        }
        
        return '#7B61FF'; // default color for external debts
      };
      
      // Заголовок долга
      const getTitle = (debt: Debt) => {
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
      
      // Текстовое представление статуса
      const getStatusText = (status: DebtStatus) => {
        const statusMap: Record<DebtStatus, string> = {
          'active': 'Активный',
          'partially_paid': 'Частично оплачен',
          'paid': 'Оплачен',
          'cancelled': 'Отменен'
        };
        
        return statusMap[status];
      };
      
      // Класс для отображения оставшейся суммы
      const getRemainingClass = (debt: Debt) => {
        if (debt.status === 'paid' || debt.status === 'cancelled') {
          return 'paid';
        }
        
        if (debt.type === 'internal') {
          return debt.fromUserId === 'user_1' ? 'negative' : 'positive';
        }
        
        return 'negative';
      };
      
      // Форматирование даты
      const formatDate = (date: Date | string) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      };
      
      // Проверка на просроченность долга
      const isOverdue = (debt: Debt) => {
        if (!debt.dueDate || debt.status === 'paid' || debt.status === 'cancelled') {
          return false;
        }
        
        const dueDate = typeof debt.dueDate === 'string' 
          ? new Date(debt.dueDate) 
          : debt.dueDate;
        
        return dueDate < new Date();
      };
      
      // Обработчики событий
      const onAddPayment = () => {
        emit('add-payment', props.debt);
      };
      
      const onCancelDebt = () => {
        emit('cancel-debt', props.debt);
      };
      
      const onClose = () => {
        emit('close');
      };
      
      return {
        getIcon,
        getIconColor,
        getTitle,
        getStatusText,
        getRemainingClass,
        formatDate,
        formatAmount,
        getBookName,
        isOverdue,
        onAddPayment,
        onCancelDebt,
        onClose
      };
    }
  });
  </script>
  
  <style scoped>
  .debt-detail {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 16px;
    background-color: var(--bg-popup);
    border-radius: var(--border-radius-lg);
  }
  
  .debt-detail__empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: var(--text-secondary);
  }
  
  .debt-detail__content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .debt-detail__header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
  }
  
  .debt-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
  }
  
  .debt-title {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .debt-title h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-header);
  }
  
  .debt-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
  }
  
  .debt-detail__info {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .info-label {
    color: var(--text-secondary);
    font-size: 14px;
  }
  
  .info-value {
    font-weight: 500;
    color: var(--text-header);
  }
  
  .info-value.amount,
  .info-value.remaining {
    font-weight: 600;
    font-size: 16px;
  }
  
  .info-value.remaining.positive {
    color: var(--color-success);
  }
  
  .info-value.remaining.negative {
    color: var(--color-warning);
  }
  
  .info-value.remaining.paid {
    color: var(--text-secondary);
  }
  
  .status-badge {
    padding: 4px 8px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .status-active {
    background-color: var(--color-info-bg);
    color: var(--color-info);
  }
  
  .status-partially_paid {
    background-color: var(--color-info-bg);
    color: var(--color-info);
  }
  
  .status-paid {
    background-color: var(--color-success-bg);
    color: var(--color-success);
  }
  
  .status-cancelled {
    background-color: var(--color-warning-bg);
    color: var(--color-warning);
  }
  
  .overdue-tag {
    margin-left: 8px;
    padding: 2px 6px;
    border-radius: 4px;
    background-color: var(--color-warning-bg);
    color: var(--color-warning);
    font-size: 12px;
    font-weight: 500;
  }
  
  .debt-detail__payments {
    margin-top: 8px;
  }
  
  .debt-detail__payments h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    color: var(--text-header);
  }
  
  .payments-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .payments-table th,
  .payments-table td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  .payments-table th {
    color: var(--text-secondary);
    font-weight: 500;
    font-size: 14px;
  }
  
  .payments-table td {
    color: var(--text-usual);
    font-size: 14px;
  }
  
  .debt-detail__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 24px;
  }
  
  .action-button {
    flex: 1;
    min-width: 120px;
    text-align: center;
    padding: 10px 16px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .action-button.primary-button {
    background-color: var(--color-success);
    color: white;
  }
  
  .action-button.warning-button {
    background-color: var(--color-warning);
    color: white;
  }
  
  .action-button.secondary-button {
    background-color: var(--bg-light);
    color: var(--text-usual);
  }
  
  .action-button:hover {
    opacity: 0.9;
  }
  </style>