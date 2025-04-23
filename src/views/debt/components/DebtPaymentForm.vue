<!-- src/views/debt/components/DebtPaymentForm.vue -->
<template>
    <div class="payment-form">
      <h2 class="form-title">{{ title }}</h2>
      
      <div class="form-row">
        <label class="form-label">Оплачиваемый долг:</label>
        <div class="debt-info">
          <div class="debt-title">{{ getDebtTitle(debt) }}</div>
          <div class="debt-description">{{ debt.description }}</div>
        </div>
      </div>
      
      <div class="form-row">
        <label class="form-label">Остаток долга:</label>
        <div class="debt-amount" :class="debt.fromUserId === 'user_1' ? 'negative' : 'positive'">
          {{ formatAmount(debt.remainingAmount, debt.currency) }}
        </div>
      </div>
      
      <div class="form-row">
        <label class="form-label" for="payment-amount">Сумма платежа:</label>
        <input
          id="payment-amount"
          v-model.number="paymentData.amount"
          type="number"
          class="form-input"
          min="0"
          :max="debt.remainingAmount"
          step="1"
          :placeholder="`Макс: ${formatAmount(debt.remainingAmount, debt.currency)}`"
          required
        />
      </div>
      
      <div class="form-row">
        <label class="form-label" for="payment-date">Дата платежа:</label>
        <input
          id="payment-date"
          v-model="paymentData.date"
          type="date"
          class="form-input"
          :max="today"
          required
        />
      </div>
      
      <div class="form-row">
        <label class="form-label" for="payment-description">Описание:</label>
        <textarea
          id="payment-description"
          v-model="paymentData.description"
          class="form-textarea"
          rows="2"
          placeholder="Укажите детали платежа"
        ></textarea>
      </div>
      
      <!-- Привязка к транзакции (опционально) -->
      <div class="form-row" v-if="showTransactionLink">
        <label class="form-checkbox-label">
          <input
            type="checkbox"
            v-model="linkToTransaction"
            class="form-checkbox"
          />
          Создать транзакцию для этого платежа
        </label>
      </div>
      
      <div class="form-actions">
        <button class="form-button cancel-button" @click="onCancel">
          Отмена
        </button>
        <button 
          class="form-button submit-button" 
          @click="onSubmit"
          :disabled="!isFormValid"
        >
          {{ submitLabel }}
        </button>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, PropType, ref, computed, onMounted } from 'vue';
  import type { Debt } from '@/stores/debt/types';
  import { useDebts } from '@/views/debt/composables/useDebts';
  
  export default defineComponent({
    name: 'DebtPaymentForm',
    props: {
      debt: {
        type: Object as PropType<Debt>,
        required: true
      },
      title: {
        type: String,
        default: 'Внести платеж'
      },
      submitLabel: {
        type: String,
        default: 'Внести платеж'
      },
      showTransactionLink: {
        type: Boolean,
        default: false
      }
    },
    emits: ['submit', 'cancel'],
    setup(props, { emit }) {
      const { formatAmount, getUserName } = useDebts();
      
      // Текущая дата для ограничения выбора даты
      const today = new Date().toISOString().split('T')[0];
      
      // Состояние формы
      const paymentData = ref({
        amount: props.debt.remainingAmount,
        date: today,
        description: '',
        currency: props.debt.currency
      });
      
      // Опция создания транзакции
      const linkToTransaction = ref(false);
      
      // Валидация формы
      const isFormValid = computed(() => {
        return (
          paymentData.value.amount > 0 &&
          paymentData.value.amount <= props.debt.remainingAmount &&
          !!paymentData.value.date
        );
      });
      
      // Получение заголовка для долга
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
      
      // Обработчики событий
      const onSubmit = () => {
        if (!isFormValid.value) return;
        
        emit('submit', {
          ...paymentData.value,
          createTransaction: linkToTransaction.value
        });
      };
      
      const onCancel = () => {
        emit('cancel');
      };
      
      // Инициализация
      onMounted(() => {
        // Установить сумму равной оставшейся сумме долга по умолчанию
        paymentData.value.amount = props.debt.remainingAmount;
      });
      
      return {
        paymentData,
        linkToTransaction,
        today,
        isFormValid,
        getDebtTitle,
        formatAmount,
        onSubmit,
        onCancel
      };
    }
  });
  </script>
  
  <style scoped>
  .payment-form {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
    background-color: var(--bg-popup);
    border-radius: var(--border-radius-lg);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .form-title {
    margin: 0 0 24px 0;
    font-size: 20px;
    color: var(--text-header);
    text-align: center;
  }
  
  .form-row {
    margin-bottom: 16px;
  }
  
  .form-label {
    display: block;
    margin-bottom: 6px;
    font-size: 14px;
    color: var(--text-secondary);
  }
  
  .form-input,
  .form-textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-md);
    background-color: var(--bg-field);
    color: var(--text-usual);
    font-size: 16px;
  }
  
  .form-input:focus,
  .form-textarea:focus {
    outline: none;
    border-color: var(--accent-color);
  }
  
  .form-checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-usual);
  }
  
  .form-checkbox {
    margin-right: 8px;
  }
  
  .debt-info {
    padding: 10px;
    background-color: var(--bg-field);
    border-radius: var(--border-radius-md);
  }
  
  .debt-title {
    font-weight: 500;
    font-size: 16px;
    color: var(--text-header);
  }
  
  .debt-description {
    font-size: 14px;
    color: var(--text-secondary);
    margin-top: 4px;
  }
  
  .debt-amount {
    font-size: 18px;
    font-weight: 600;
  }
  
  .debt-amount.positive {
    color: var(--color-success);
  }
  
  .debt-amount.negative {
    color: var(--color-warning);
  }
  
  .form-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 24px;
  }
  
  .form-button {
    padding: 10px 16px;
    border: none;
    border-radius: var(--border-radius-md);
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    flex: 1;
    margin: 0 8px;
  }
  
  .form-button:first-child {
    margin-left: 0;
  }
  
  .form-button:last-child {
    margin-right: 0;
  }
  
  .submit-button {
    background-color: var(--color-success);
    color: white;
  }
  
  .submit-button:disabled {
    background-color: var(--bg-light);
    color: var(--text-secondary);
    cursor: not-allowed;
  }
  
  .cancel-button {
    background-color: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-usual);
  }
  
  .submit-button:not(:disabled):hover,
  .cancel-button:hover {
    opacity: 0.9;
  }
  </style>