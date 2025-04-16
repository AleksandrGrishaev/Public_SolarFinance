<!-- src/views/TransactionView.vue -->
<template>
  <div class="transaction-view">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">Загрузка...</div>
    </div>
    
    <div class="body-container" v-else>
      <!-- Секция отображения суммы с поддержкой конвертации валют -->
      <div class="amount-section">
        <!-- Стандартное отображение для обычных транзакций -->
        <div v-if="!isTransferWithDifferentCurrencies" class="standard-amount">
          <div class="currency-symbol">{{ sourceCurrencySymbol }}</div>
          <div class="amount-input">{{ amount }}</div>
        </div>
        
        <!-- Отображение с конвертацией для переводов между разными валютами -->
        <div v-else class="currency-conversion">
          <!-- Исходная сумма (активная по умолчанию) -->
          <div 
            class="source-amount" 
            :class="{ 'active': isSourceAmountActive, 'inactive': !isSourceAmountActive }"
            @click="switchToSourceAmount"
          >
            <div class="currency-symbol" :class="{ 'active': isSourceAmountActive, 'inactive': !isSourceAmountActive }">
              {{ sourceCurrencySymbol }}
            </div>
            <div class="amount-input" :class="{ 'active': isSourceAmountActive, 'inactive': !isSourceAmountActive }">
              {{ amount }}
            </div>
          </div>
          
          <!-- Разделитель между суммами -->
          <div class="conversion-arrow">→</div>
          
          <!-- Конвертированная сумма (неактивная по умолчанию) -->
          <div 
            class="destination-amount" 
            :class="{ 'active': !isSourceAmountActive, 'inactive': isSourceAmountActive }"
            @click="switchToDestinationAmount"
          >
            <div class="currency-symbol" :class="{ 'active': !isSourceAmountActive, 'inactive': isSourceAmountActive }">
              {{ destinationCurrencySymbol }}
            </div>
            <div class="amount-input" :class="{ 'active': !isSourceAmountActive, 'inactive': isSourceAmountActive }">
              {{ isSourceAmountActive ? convertedAmount : manualDestinationAmount }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="filter-group">
        <!-- Селектор книги всегда на экране, но может быть невидимым -->
        <book-selector 
          v-model="selectedBook"
          :class="{ 'invisible': selectedType === 'transfer' }"
        />
        
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
import { onMounted, watch, ref } from 'vue';
import BookSelector from '../components/transactions/BookSelector.vue';
import TransactionTypeSelector from '../components/transactions/TransactionTypeSelector.vue';
import AccountSelector from '../components/transactions/AccountSelector.vue';
import PercentageSlider from '../components/transactions/PercentageSlider.vue';
import NumberKeypad from '../components/transactions/NumberKeypad.vue';
import CategorySelector from '../components/categories/CategorySelector.vue';
import CategoryListPopup from '../components/categories/CategoryListPopup.vue';

// Импортируем хуки
import { useTransaction } from '../composables/transaction';
import { useAccount } from '../composables/transaction/useAccount';
import { useCurrency } from '../composables/transaction/useCurrency';

// Определяем события для emit
const emit = defineEmits(['update:showMenu']);

// Состояние для управления вводом суммы
const isSourceAmountActive = ref(true);
const manualDestinationAmount = ref('0');

// Инициализируем основной хук, но не деструктурируем методы, которые будем переопределять
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
  
  // Methods (не включаем handleKeypadInput и deleteLastDigit)
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
} = useTransaction(emit);

// Отдельно получаем методы, которые будем переопределять
const transactionHelpers = useTransaction(emit);
const originalHandleKeypadInput = transactionHelpers.handleKeypadInput;
const originalDeleteLastDigit = transactionHelpers.deleteLastDigit;

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

// Переключение к вводу исходной суммы
const switchToSourceAmount = () => {
  isSourceAmountActive.value = true;
};

// Переключение к вводу суммы назначения
const switchToDestinationAmount = () => {
  isSourceAmountActive.value = false;
  
  // При первом переключении установим текущее конвертированное значение
  if (manualDestinationAmount.value === '0') {
    manualDestinationAmount.value = convertedAmount.value;
  }
};

// Создаем собственные улучшенные обработчики
const handleKeypadInput = (value: string) => {
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
  } else {
    // Используем оригинальный обработчик для суммы источника
    originalHandleKeypadInput(value);
  }
};

// Создаем собственный обработчик удаления
const deleteLastDigit = () => {
  if (isTransferWithDifferentCurrencies.value && !isSourceAmountActive.value) {
    // Для суммы назначения
    if (manualDestinationAmount.value.length > 1) {
      manualDestinationAmount.value = manualDestinationAmount.value.slice(0, -1);
    } else {
      manualDestinationAmount.value = '0';
    }
  } else {
    // Для суммы источника
    originalDeleteLastDigit();
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* Верхний и нижний отступы для amount-section */
  padding: 20px 0 25px;
  /* Фиксированная высота, чтобы предотвратить "прыжки" интерфейса */
  min-height: 180px;
}

/* Стандартное отображение суммы */
.standard-amount {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

/* Стили для конвертации валют */
.currency-conversion {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  /* Использовать абсолютное позиционирование, чтобы не влиять на другие элементы */
  position: relative;
  width: 100%;
}

.source-amount, .destination-amount {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.conversion-arrow {
  color: #949496;
  font-size: 24px;
}

/* Стили для активной суммы */
.currency-symbol.active, .amount-input.active {
  color: white;
}

.currency-symbol.inactive, .amount-input.inactive {
  color: #949496;
}

.currency-symbol {
  font-size: 28px;
  font-weight: 300;
  line-height: 28px;
  transition: color 0.2s ease;
}

.amount-input {
  font-size: 64px;
  font-weight: 300;
  line-height: 64px;
  transition: color 0.2s ease;
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