<!-- src/views/TransactionView.vue -->
<template>
  <div class="transaction-view">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">Загрузка...</div>
    </div>
    
    <div class="body-container" v-else>
      <!-- Секция отображения суммы с поддержкой конвертации валют -->
      <amount-section
  ref="amountSectionRef"
  :amount="amount"
  :source-currency-symbol="sourceCurrencySymbol"
  :destination-currency-symbol="destinationCurrencySymbol"
  :converted-amount="convertedAmount"
  :is-transfer-with-different-currencies="isTransferWithDifferentCurrencies"
  :use-smaller-destination-font="true"
  @source-active="handleSourceAmountActive"
  @destination-active="handleDestinationAmountActive"
  @update-destination-amount="handleUpdateDestinationAmount"
  class="amount-display"
/>
      
      <!-- Селектор книги, отображается, если это не перевод -->
      <book-selector 
        v-if="selectedType !== 'transfer'"
        v-model="selectedBook"
        class="book-selector"
      />
      
      <div class="filter-group">
        <transaction-type-selector 
          v-model="selectedType" 
        />
        
        <!-- Используем фильтрованные счета на основе выбранной книги -->
        <account-selector 
          :accounts="filteredAccounts" 
          v-model="selectedAccount"
          :is-transfer="selectedType === 'transfer'"
          :destination-account-id="destinationAccount"
          @update:destination-account-id="handleDestinationAccountChange"
        />
        
        <!-- Слайдер отображается только если есть правила распределения в книге и это не перевод -->
        <percentage-slider 
          :owners="distributionOwners" 
          v-model="distributionPercentage"
          :total-amount="parseFloat(amount) || 0"
          :class="{ 'invisible': !shouldShowDistribution }"
        />
      </div>
      
      <div class="keypad-container">
        <number-keypad 
          @input="handleKeypadInput" 
          @add="handleAddTransaction" 
          @delete="deleteLastDigit" 
        />
      </div>
    </div>

   <!-- Selector popup -->
   <category-selector
    v-model="showCategorySelector"
    :categories="filteredCategories"
    :bookId="selectedBook"
    :transactionType="selectedType"
    @select="handleCategorySelect"
    @add="handleAddCategory"
    @edit="handleOpenCategoryList"
  />
    
    <!-- List/Edit popup -->
    <category-list-popup
      v-model="showCategoryList"
      :initialBook="selectedBook"
      :initialType="selectedType === 'transfer' ? 'expense' : selectedType"
      @select="handleCategoryListSelect"
      @add="handleAddCategoryFromList"
      @reorder="handleCategoriesReordered"
      @toggleActive="handleToggleActiveCategory"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref, computed } from 'vue';
import BookSelector from '../components/transactions/BookSelector.vue';
import TransactionTypeSelector from '../components/transactions/TransactionTypeSelector.vue';
import AccountSelector from '../components/transactions/AccountSelector.vue';
import PercentageSlider from '../components/transactions/PercentageSlider.vue';
import NumberKeypad from '../components/transactions/NumberKeypad.vue';
import CategorySelector from '../components/categories/CategorySelector.vue';
import CategoryListPopup from '../components/categories/CategoryListPopup.vue';
import AmountSection from '../components/transactions/AmountSection.vue';

// Импортируем хуки
import { useTransaction } from '../composables/transaction';
import { useAccount } from '../composables/transaction/useAccount';
import { useCurrency } from '../composables/transaction/useCurrency';

// Определяем события для emit
const emit = defineEmits(['update:showMenu']);

// Состояние для управления вводом суммы
const isSourceAmountActive = ref(true);
const manualDestinationAmount = ref('0');
const amountSectionRef = ref(null);

// Инициализируем основной хук, но не деструктурируем методы, которые будем переопределять
const transactionState = useTransaction(emit);
// Деструктурируем только нужные переменные и методы
const {
  // State
  isLoading,
  amount,
  selectedBook,
  selectedType,
  
  // From useAccount
  selectedAccount,
  destinationAccount,
  filteredAccounts,
  
  // From useCategory
  showCategorySelector,
  showCategoryList,
  selectedCategory,
  filteredCategories,
  
  // From useDistribution
  distributionPercentage,
  shouldShowDistribution,
  distributionOwners,
  
  // Methods
  initAllStores,
  handleAddTransaction,
  
  // Category handlers
  handleCategorySelect,
  handleAddCategory,
  handleOpenCategoryList,
  handleCategoryListSelect,
  handleAddCategoryFromList,
  handleCategoriesReordered,
  handleToggleActiveCategory
} = transactionState;

// Инициализируем хук для работы с валютами
const {
  sourceCurrencySymbol,
  destinationCurrencySymbol,
  isTransferWithDifferentCurrencies,
  convertedAmount,
  initCurrencyStore
} = useCurrency(selectedAccount, destinationAccount, selectedType, amount);

// Обработчик изменения аккаунта назначения
const handleDestinationAccountChange = (accountId: string) => {
  destinationAccount.value = accountId;
};

// Обработчики для режима редактирования разных сумм
const handleSourceAmountActive = () => {
  isSourceAmountActive.value = true;
};

const handleDestinationAmountActive = (value: string) => {
  isSourceAmountActive.value = false;
  manualDestinationAmount.value = value;
};

const handleUpdateDestinationAmount = (value: string) => {
  manualDestinationAmount.value = value;
};

// Переопределяем обработчик ввода с клавиатуры
const handleKeypadInput = (value: string) => {
  // Проверяем, нужно ли обрабатывать ввод для второй суммы
  if (isTransferWithDifferentCurrencies.value && !isSourceAmountActive.value) {
    // Если вводим сумму назначения
    if (value === '.' && manualDestinationAmount.value.includes('.')) {
      return;
    }
    
    if (manualDestinationAmount.value === '0' && value !== '.') {
      manualDestinationAmount.value = value;
    } else {
      manualDestinationAmount.value += value;
    }
    
    // Обновляем значение в компоненте AmountSection
    if (amountSectionRef.value) {
      amountSectionRef.value.updateManualAmount(manualDestinationAmount.value);
    }
  } else {
    // Используем оригинальный обработчик для суммы источника
    transactionState.handleKeypadInput(value);
  }
};

// Переопределяем обработчик удаления
const deleteLastDigit = () => {
  if (isTransferWithDifferentCurrencies.value && !isSourceAmountActive.value) {
    // Для суммы назначения
    if (manualDestinationAmount.value.length > 1) {
      manualDestinationAmount.value = manualDestinationAmount.value.slice(0, -1);
    } else {
      manualDestinationAmount.value = '0';
    }
    
    // Обновляем значение в компоненте
    if (amountSectionRef.value) {
      amountSectionRef.value.updateManualAmount(manualDestinationAmount.value);
    }
  } else {
    // Для суммы источника
    transactionState.deleteLastDigit();
  }
};

// Инициализируем хранилища и сообщаем макету, что нужно показать меню
onMounted(async () => {
  emit('update:showMenu', true);
  await initAllStores();
  
  // Инициализируем хранилище валют
  await initCurrencyStore();
});

// Следим за изменениями типа транзакции для обновления интерфейса
watch(() => selectedType.value, (newType) => {
  // При смене типа транзакции сбрасываем к стандартному режиму
  isSourceAmountActive.value = true;
  manualDestinationAmount.value = '0';
  
  // При смене типа транзакции с перевода на другой тип, сбрасываем сумму
  if (newType !== 'transfer' && isTransferWithDifferentCurrencies.value) {
    amount.value = '0';
  }
});

// Сброс ручной суммы при изменении валют или счетов
watch([selectedAccount, destinationAccount, convertedAmount], () => {
  if (isTransferWithDifferentCurrencies.value) {
    manualDestinationAmount.value = convertedAmount.value;
    
    // Обновляем значение в компоненте
    if (amountSectionRef.value && amountSectionRef.value.updateManualAmount) {
      amountSectionRef.value.updateManualAmount(convertedAmount.value);
    }
  }
});
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

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
}

.loading-spinner {
  color: white;
  font-size: 18px;
}

.body-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  /* Добавляем отступы согласно требованиям */
  padding: 16px 16px 0;
  box-sizing: border-box;
  /* Используем распределение пространства для flex-контейнера */
  justify-content: flex-end;
  /* Добавляем отступ снизу для меню из макета */
  padding-bottom: 70px;
  /* Устанавливаем промежуток между элементами на 15px */
  gap: 15px;
}

.book-selector {
  margin: 16px 0;
}

.amount-display {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 74px; /* Отступ сверху экрана */
}

.filter-group {
  display: flex;
  flex-direction: column;
  /* Промежуток между фильтрами 16px */
  gap: 16px;
  width: 100%;
  /* Зафиксируем позицию, чтобы избежать смещения при изменении размера блоков */
  position: relative;
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