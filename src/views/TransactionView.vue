<!-- src/views/TransactionView.vue -->
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
          :books="categoryStore.allBooks" 
          v-model="selectedBook"
          :class="{ 'invisible': selectedType === 'transfer' }"
        />
        
        <transaction-type-selector 
          :types="categoryStore.allTransactionTypes" 
          v-model="selectedType" 
        />
        
        <account-selector 
          :accounts="categoryStore.accounts" 
          v-model="selectedAccount"
          :is-transfer="selectedType === 'transfer'"
          :destination-account-id="destinationAccount"
          @update:destination-account-id="destinationAccount = $event"
        />
        
        <!-- Слайдер всегда остается, но может быть невидимым -->
        <percentage-slider 
          :owners="categoryStore.owners" 
          v-model="distributionPercentage"
          :total-amount="parseFloat(amount) || 0"
          :class="{ 'invisible': selectedType === 'transfer' }"
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
import { ref, computed, onMounted, watch } from 'vue';
import BookSelector from '../components/transactions/BookSelector.vue';
import TransactionTypeSelector from '../components/transactions/TransactionTypeSelector.vue';
import AccountSelector from '../components/transactions/AccountSelector.vue';
import PercentageSlider from '../components/transactions/PercentageSlider.vue';
import NumberKeypad from '../components/transactions/NumberKeypad.vue';
import CategorySelector from '../components/categories/CategorySelector.vue';
import CategoryListPopup from '../components/categories/CategoryListPopup.vue';

// Импортируем данные из нового хранилища категорий
import { useCategoryStore } from '../stores/category';

const categoryStore = useCategoryStore();

const emit = defineEmits(['update:showMenu']);

// Сообщаем макету, что нужно показать меню
onMounted(() => {
  emit('update:showMenu', true);
});

// Data models
const amount = ref('255');
const selectedBook = ref('family');
const selectedType = ref('expense');
const selectedAccount = ref('dollar');
const destinationAccount = ref('bank2');
const distributionPercentage = ref(50);
const showCategorySelector = ref(false);
const showCategoryList = ref(false);
const selectedCategory = ref(null);

// Вычисляемое свойство для получения категорий
const filteredCategories = computed(() => {
  if (selectedType.value === 'transfer') {
    return [];
  }
  
  // Получаем категории для выбранной книги и типа транзакции
  return categoryStore.getCategoriesForBookAndType(selectedBook.value, selectedType.value);
});


// Устанавливаем наблюдение за изменением типа транзакции
watch(selectedType, (newType) => {
  // Если тип изменился на "transfer", убедимся что оба счета различны
  if (newType === 'transfer' && selectedAccount.value === destinationAccount.value && categoryStore.accounts.length > 1) {
    // Устанавливаем другой счет в качестве получателя
    const otherAccount = categoryStore.accounts.find(acc => acc.id !== selectedAccount.value);
    if (otherAccount) {
      destinationAccount.value = otherAccount.id;
    }
  }
  
  // Сбрасываем выбранную категорию, если тип изменился
  if (newType !== 'transfer' && selectedCategory.value && selectedCategory.value.type !== newType) {
    selectedCategory.value = null;
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

const handleAddTransaction = () => {
  // For expenses and incomes, we need to select a category first
  if (selectedType.value !== 'transfer' && !selectedCategory.value) {
    showCategorySelector.value = true;
    return;
  }
  
  saveTransaction();
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
    transactionData.category = selectedCategory.value;
  }
  
  console.log('Saving transaction:', transactionData);
  
  // Reset the form or navigate back
  amount.value = '0';
  selectedCategory.value = null;
};

const handleCategorySelect = (category) => {
  selectedCategory.value = category;
  saveTransaction();
};

const handleAddCategory = () => {
  // Закрываем селектор категорий и открываем список категорий
  showCategorySelector.value = false;
  showCategoryList.value = true;
};

const handleOpenCategoryList = () => {
  // Закрываем селектор категорий и открываем список категорий
  showCategorySelector.value = false;
  showCategoryList.value = true;
};

const handleCategoryListSelect = (category) => {
  // Выбор категории из списка возвращает нас к первому попапу
  selectedCategory.value = category;
  showCategoryList.value = false;
  showCategorySelector.value = true;
};

const handleAddCategoryFromList = (data) => {
  // Здесь должен быть код для добавления новой категории
  console.log('Adding new category with data:', data);
  // Потенциально здесь можно открыть третий попап для добавления категории
  // или реализовать эту логику в самом списке категорий
};

const handleCategoriesReordered = (reorderedCategories) => {
  console.log('Categories reordered:', reorderedCategories);
  // Здесь мы должны обновить порядок категорий в хранилище
  // Но для демонстрации просто логируем новый порядок
  
  // В реальном приложении это могло бы выглядеть так:
  // store.dispatch('categories/updateOrder', reorderedCategories);
};

// Обработка изменения активности категории
const handleToggleActiveCategory = ({ category, isActive, bookId }) => {
  console.log(`Category ${category.name} is now ${isActive ? 'active' : 'inactive'} in book ${bookId}`);
  
  // Используем методы store для обновления
  if (isActive) {
    categoryStore.addCategoryToBook(category.id, bookId);
  }
  
  // Обновляем статус активности
  categoryStore.toggleCategoryActive(category.id, isActive);
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