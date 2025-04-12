<!-- /Users/peaker/dev/solar-finance/src/views/TransactionView.vue -->
<template>
  <div class="transaction-view">
    <div class="body-container">
      <div class="amount-section">
        <div class="currency-symbol">$</div>
        <div class="amount-input">{{ amount }}</div>
      </div>
      
      <div class="filter-group">
        <!-- Селектор книги всегда на экране, но может быть невидимым -->
        <book-selector 
          :books="availableBooks" 
          v-model="selectedBook"
          :class="{ 'invisible': selectedType === 'transfer' }"
        />
        
        <transaction-type-selector 
          :types="transactionTypes" 
          v-model="selectedType" 
        />
        
        <account-selector 
          :accounts="availableAccounts" 
          v-model="selectedAccount"
          :is-transfer="selectedType === 'transfer'"
          :destination-account-id="destinationAccount"
          @update:destination-account-id="destinationAccount = $event"
        />
        
        <!-- Слайдер всегда остается, но может быть невидимым -->
        <percentage-slider 
          :owners="owners" 
          v-model="distributionPercentage"
          :total-amount="parseFloat(amount) || 0"
          :class="{ 'invisible': selectedType === 'transfer' }"
        />
      </div>
            
      <div class="keypad-container">
        <number-keypad 
          @input="handleKeypadInput" 
          @add="saveTransaction" 
          @delete="deleteLastDigit" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import BookSelector from '../components/transactions/BookSelector.vue';
import TransactionTypeSelector from '../components/transactions/TransactionTypeSelector.vue';
import AccountSelector from '../components/transactions/AccountSelector.vue';
import PercentageSlider from '../components/transactions/PercentageSlider.vue';
import NumberKeypad from '../components/transactions/NumberKeypad.vue';

// Сообщаем макету, что нужно показать меню
onMounted(() => {
  // Этот код нужно будет включить в реальном приложении, 
  // если вы используете событие для управления меню через макет
  // emit('update:showMenu', true);
});

// Data models
const amount = ref('255');
const selectedBook = ref('family');
const selectedType = ref('expense');
const selectedAccount = ref('dollar');
const destinationAccount = ref('bank2');
const distributionPercentage = ref(50);

// Mock data
const availableBooks = [
  { id: 'my', name: 'My' },
  { id: 'family', name: 'Family' },
  { id: 'wife', name: 'Wife' }
];

const transactionTypes = [
  { id: 'expense', name: 'Expense' },
  { id: 'income', name: 'Income' },
  { id: 'transfer', name: 'Transfer' }
];

const availableAccounts = [
  { id: 'dollar', name: 'Dollar', currency: 'USD', color: '#BE9A40', symbol: 'D' },
  { id: 'bank2', name: 'Bank 2', currency: 'USD', color: '#B46B66', symbol: 'B' }
];

const owners = [
  { id: 'alex', name: 'Alex' },
  { id: 'wife', name: 'Wife' }
];

// Устанавливаем наблюдение за изменением типа транзакции
watch(selectedType, (newType) => {
  // Если тип изменился на "transfer", убедимся что оба счета различны
  if (newType === 'transfer' && selectedAccount.value === destinationAccount.value && availableAccounts.length > 1) {
    // Устанавливаем другой счет в качестве получателя
    const otherAccount = availableAccounts.find(acc => acc.id !== selectedAccount.value);
    if (otherAccount) {
      destinationAccount.value = otherAccount.id;
    }
  }
});

// Methods
const handleKeypadInput = (value: string) => {
  if (value === '.' && amount.value.includes('.')) {
    return;
  }
  
  if (amount.value === '0' && value !== '.') {
    amount.value = value;
  } else {
    amount.value += value;
  }
};

const deleteLastDigit = () => {
  if (amount.value.length > 1) {
    amount.value = amount.value.slice(0, -1);
  } else {
    amount.value = '0';
  }
};

const saveTransaction = () => {
  // Here we would save the transaction to the store/backend
  const transactionData = {
    amount: parseFloat(amount.value),
    book: selectedBook.value,
    type: selectedType.value,
    account: selectedAccount.value
  };
  
  // Добавляем дополнительную информацию в зависимости от типа транзакции
  if (selectedType.value === 'transfer') {
    transactionData.destinationAccount = destinationAccount.value;
  } else {
    transactionData.distribution = distributionPercentage.value;
  }
  
  console.log('Saving transaction:', transactionData);
  
  // Reset the form or navigate back
  amount.value = '0';
};
</script>

<style scoped>
.transaction-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #121212; /* Черный фон */
  box-sizing: border-box;
  /* Предотвращаем скролл */
  overflow: hidden;
  /* Позиционируем содержимое вниз */
  justify-content: flex-end;
}

.body-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  /* Добавляем отступы согласно требованиям */
  padding: 74px 16px 0;
  box-sizing: border-box;
  /* Используем распределение пространства для flex-контейнера */
  justify-content: flex-end;
  /* Добавляем отступ снизу для меню из макета */
  padding-bottom: 70px;
  /* Устанавливаем промежуток между элементами на 15px */
  gap: 15px;
}

.amount-section {
  display: flex;
  align-items: center;
  justify-content: center;
  /* Верхний и нижний отступы для amount-section */
  padding: 20px 0 25px;
  gap: 10px;
}

.currency-symbol {
  color: white;
  font-size: 28px;
  font-weight: 300;
  line-height: 28px;
}

.amount-input {
  color: white;
  font-size: 72px;
  font-weight: 300;
  line-height: 72px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  /* Промежуток между фильтрами 16px */
  gap: 16px;
  width: 100%;
}

/* Делаем элемент невидимым, но сохраняем его размеры */
.invisible {
  visibility: hidden;
  opacity: 0;
  /* Сохраняем размеры, чтобы не было смещения других элементов */
  pointer-events: none;
  /* Элемент не реагирует на клики */
}

.keypad-container {
  margin-top: auto;
  padding-left: 8px;
  padding-right: 8px;
  /* Убедимся, что клавиатура занимает доступное пространство */
  flex-shrink: 0;
}
</style>