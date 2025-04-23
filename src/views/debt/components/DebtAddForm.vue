<!-- src/views/debt/components/DebtAddForm.vue -->
<template>
    <div class="debt-add-form">
      <h2 class="form-title">{{ title }}</h2>
      
      <div class="form-section">
        <h3 class="section-title">Основная информация</h3>
        
        <div class="form-row">
          <label class="form-label" for="debt-type">Тип долга:</label>
          <div class="select-container">
            <select id="debt-type" v-model="debtData.type" class="form-select" @change="handleTypeChange">
              <option value="internal">Внутренний (между пользователями)</option>
              <option value="external">Внешний (кредит, займ)</option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <label class="form-label" for="debt-amount">Сумма долга:</label>
          <div class="amount-input-container">
            <input
              id="debt-amount"
              v-model.number="debtData.amount"
              type="number"
              class="form-input"
              min="0"
              step="1"
              placeholder="Введите сумму"
              required
            />
            <div class="select-container currency-select">
              <select id="debt-currency" v-model="debtData.currency" class="form-select">
                <option v-for="currency in availableCurrencies" :key="currency.code" :value="currency.code">
                  {{ currency.code }} ({{ currency.symbol }})
                </option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="form-row">
          <label class="form-label" for="debt-book">Книга учета:</label>
          <div class="select-container">
            <select id="debt-book" v-model="debtData.bookId" class="form-select">
              <option v-for="book in availableBooks" :key="book.id" :value="book.id">
                {{ book.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="form-row">
          <label class="form-label" for="debt-description">Описание:</label>
          <textarea
            id="debt-description"
            v-model="debtData.description"
            class="form-textarea"
            rows="2"
            placeholder="Укажите детали долга"
            required
          ></textarea>
        </div>
        
        <!-- Поля для внутреннего долга -->
        <template v-if="debtData.type === 'internal'">
          <div class="form-row">
            <label class="form-label" for="debt-from-user">Кто должен:</label>
            <div class="select-container">
              <select id="debt-from-user" v-model="debtData.fromUserId" class="form-select">
                <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <label class="form-label" for="debt-to-user">Кому должен:</label>
            <div class="select-container">
              <select id="debt-to-user" v-model="debtData.toUserId" class="form-select">
                <option v-for="user in availableUsers" :key="user.id" :value="user.id"
                  :disabled="user.id === debtData.fromUserId">
                  {{ user.name }}
                </option>
              </select>
            </div>
          </div>
        </template>
        
        <!-- Поля для внешнего долга -->
        <template v-else>
          <div class="form-row">
            <label class="form-label" for="debt-source">Источник долга:</label>
            <div class="select-container">
              <select id="debt-source" v-model="debtData.source" class="form-select">
                <option value="manual">Ручной ввод</option>
                <option value="credit">Кредит</option>
                <option value="mortgage">Ипотека</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <label class="form-label" for="debt-creditor">Кредитор:</label>
            <input
              id="debt-creditor"
              v-model="debtData.creditorName"
              type="text"
              class="form-input"
              placeholder="Название банка или организации"
              required
            />
          </div>
          
          <div class="form-row">
            <label class="form-label" for="debt-from-user">Заёмщик:</label>
            <div class="select-container">
              <select id="debt-from-user" v-model="debtData.fromUserId" class="form-select">
                <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <label class="form-label" for="debt-interest-rate">Процентная ставка (%):</label>
            <input
              id="debt-interest-rate"
              v-model.number="debtData.interestRate"
              type="number"
              class="form-input"
              min="0"
              step="0.01"
              placeholder="Например: 12.5"
            />
          </div>
        </template>
      </div>
      
      <div class="form-section">
        <h3 class="section-title">Дополнительно</h3>
        
        <div class="form-row">
          <label class="form-label" for="debt-due-date">Срок погашения:</label>
          <input
            id="debt-due-date"
            v-model="debtData.dueDate"
            type="date"
            class="form-input"
            :min="today"
          />
        </div>
        
        <!-- Привязка к транзакции (опционально) -->
        <div class="form-row" v-if="showTransactionLink">
          <label class="form-checkbox-label">
            <input
              type="checkbox"
              v-model="createTransaction"
              class="form-checkbox"
            />
            Создать транзакцию для этого долга
          </label>
        </div>
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
  import { defineComponent, ref, computed, onMounted } from 'vue';
  import { useDebts } from '@/views/debt/composables/useDebts';
  import { useUserStore } from '@/stores/user';
  import { useBookStore } from '@/stores/book';
  import { useCurrencyStore } from '@/stores/currency';
  import type { NewDebtPayload } from '@/stores/debt/types';
  
  export default defineComponent({
    name: 'DebtAddForm',
    props: {
      title: {
        type: String,
        default: 'Добавить долг'
      },
      submitLabel: {
        type: String,
        default: 'Сохранить'
      },
      showTransactionLink: {
        type: Boolean,
        default: true
      }
    },
    emits: ['submit', 'cancel'],
    setup(props, { emit }) {
      // Хранилища
      const userStore = useUserStore();
      const bookStore = useBookStore();
      const currencyStore = useCurrencyStore();
      const { formatAmount } = useDebts();
      
      // Текущая дата
      const today = new Date().toISOString().split('T')[0];
      
      // Состояние формы
      const debtData = ref<Partial<NewDebtPayload>>({
        amount: 0,
        currency: currencyStore.appBaseCurrency,
        type: 'internal',
        source: 'manual',
        description: '',
        bookId: '',
        fromUserId: userStore.currentUser?.id || '',
        toUserId: ''
      });
      
      // Опция создания транзакции
      const createTransaction = ref(false);
      
      // Предзаполнение формы
      onMounted(() => {
        // Устанавливаем текущего пользователя как заёмщика по умолчанию
        if (userStore.currentUser) {
          debtData.value.fromUserId = userStore.currentUser.id;
        }
        
        // Устанавливаем первую доступную книгу
        if (bookStore.books.length > 0) {
          debtData.value.bookId = bookStore.books[0].id;
        }
        
        // Если есть другие пользователи, устанавливаем первого из них как кредитора
        const otherUsers = userStore.users.filter(user => 
          user.id !== userStore.currentUser?.id
        );
        
        if (otherUsers.length > 0) {
          debtData.value.toUserId = otherUsers[0].id;
        }
      });
      
      // Вычисляемые свойства для выпадающих списков
      const availableUsers = computed(() => {
        return userStore.users.filter(user => user.isActive);
      });
      
      const availableBooks = computed(() => {
        return bookStore.books.filter(book => book.isActive);
      });
      
      const availableCurrencies = computed(() => {
        return currencyStore.currencies;
      });
      
      // Валидация формы
      const isFormValid = computed(() => {
        // Проверка обязательных полей
        if (
          !debtData.value.amount ||
          !debtData.value.currency ||
          !debtData.value.type ||
          !debtData.value.bookId ||
          !debtData.value.description
        ) {
          return false;
        }
        
        // Проверка полей для внутреннего долга
        if (debtData.value.type === 'internal') {
          if (
            !debtData.value.fromUserId ||
            !debtData.value.toUserId ||
            debtData.value.fromUserId === debtData.value.toUserId
          ) {
            return false;
          }
        }
        
        // Проверка полей для внешнего долга
        if (debtData.value.type === 'external' && !debtData.value.creditorName) {
          return false;
        }
        
        return true;
      });
      
      // Обработчики событий
      const handleTypeChange = () => {
        // Сбрасываем некоторые поля при изменении типа долга
        if (debtData.value.type === 'internal') {
          debtData.value.creditorName = undefined;
          debtData.value.interestRate = undefined;
          debtData.value.source = 'manual';
        } else {
          debtData.value.toUserId = undefined;
        }
      };
      
      const onSubmit = () => {
        if (!isFormValid.value) return;
        
        emit('submit', {
          ...debtData.value,
          createTransaction: createTransaction.value
        });
      };
      
      const onCancel = () => {
        emit('cancel');
      };
      
      return {
        debtData,
        createTransaction,
        today,
        availableUsers,
        availableBooks,
        availableCurrencies,
        isFormValid,
        formatAmount,
        handleTypeChange,
        onSubmit,
        onCancel
      };
    }
  });
  </script>
  
  <style scoped>
  .debt-add-form {
    width: 100%;
    max-width: 600px;
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
  
  .form-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
  }
  
  .form-section:last-child {
    border-bottom: none;
  }
  
  .section-title {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: var(--text-header);
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
  .form-textarea,
  .form-select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-md);
    background-color: var(--bg-field);
    color: var(--text-usual);
    font-size: 16px;
  }
  
  .form-input:focus,
  .form-textarea:focus,
  .form-select:focus {
    outline: none;
    border-color: var(--accent-color);
  }
  
  .select-container {
    position: relative;
  }
  
  .select-container::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 12px;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid var(--text-secondary);
    pointer-events: none;
  }
  
  .form-select {
    appearance: none;
    padding-right: 30px;
  }
  
  .amount-input-container {
    display: flex;
    gap: 8px;
  }
  
  .amount-input-container .form-input {
    flex: 3;
  }
  
  .currency-select {
    flex: 1;
    min-width: 100px;
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
  
  .form-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 24px;
  }
  
  .form-button {
    padding: 12px 20px;
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
  
  /* Dark mode compatibility */
  @media (prefers-color-scheme: dark) {
    .select-container::after {
      border-top-color: var(--text-secondary);
    }
  }
  </style>