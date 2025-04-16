<!-- src/views/TransactionView.vue -->
<template>
  <div class="transaction-view">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">Загрузка...</div>
    </div>
    
    <div class="body-container" v-else>
      <div class="amount-section">
        <div class="currency-symbol">{{ currentCurrencySymbol }}</div>
        <div class="amount-input">{{ amount }}</div>
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
          @update:destination-account-id="destinationAccount = $event"
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
import { ref, computed, onMounted, watch } from 'vue';
import BookSelector from '../components/transactions/BookSelector.vue';
import TransactionTypeSelector from '../components/transactions/TransactionTypeSelector.vue';
import AccountSelector from '../components/transactions/AccountSelector.vue';
import PercentageSlider from '../components/transactions/PercentageSlider.vue';
import NumberKeypad from '../components/transactions/NumberKeypad.vue';
import CategorySelector from '../components/categories/CategorySelector.vue';
import CategoryListPopup from '../components/categories/CategoryListPopup.vue';

// Импортируем хранилища
import { useCategoryStore } from '../stores/category';
import { useAccountStore } from '../stores/account';
import { useBookStore } from '../stores/book';
import { useSystemStore } from '../stores/system';
import { useCurrencyStore } from '../stores/currency'; // Импорт хранилища валют

const categoryStore = useCategoryStore();
const accountStore = useAccountStore();
const bookStore = useBookStore();
const systemStore = useSystemStore();
const currencyStore = useCurrencyStore(); // Инициализируем хранилище валют

// Состояние загрузки
const isLoading = ref(true);

// Data models
const amount = ref('255');
const selectedBook = ref('family');
const selectedType = ref('expense');
const selectedAccount = ref('');
const destinationAccount = ref('');
const distributionPercentage = ref(50);
const showCategorySelector = ref(false);
const showCategoryList = ref(false);
const selectedCategory = ref(null);

// Инициализируем хранилища и сообщаем макету, что нужно показать меню
onMounted(async () => {
  emit('update:showMenu', true);
  await initAllStores();
});

const emit = defineEmits(['update:showMenu']);

// Инициализируем все хранилища сразу при создании компонента
const initAllStores = async () => {
  try {
    isLoading.value = true;
    console.log('[TransactionView] Initializing stores...');
    
    // Инициализируем все хранилища последовательно для надежности
    if (!bookStore.isInitialized) {
      console.log('[TransactionView] Initializing book store...');
      await bookStore.init();
      console.log('[TransactionView] Book store initialized:', bookStore.books.map(b => b.id));
    }
    
    if (!accountStore.isInitialized) {
      console.log('[TransactionView] Initializing account store...');
      await accountStore.init();
      console.log('[TransactionView] Account store initialized with', accountStore.accounts.length, 'accounts');
      console.log('[TransactionView] Account IDs:', accountStore.accounts.map(a => a.id));
    }
    
    if (currencyStore.init) {
      await currencyStore.init();
    }
    
    // Устанавливаем начальное значение selectedBook, если оно не соответствует ни одной из имеющихся книг
    if (bookStore.books.length > 0) {
      if (!bookStore.books.some(book => book.id === selectedBook.value)) {
        selectedBook.value = bookStore.books[0].id;
        console.log('[TransactionView] Set initial book to:', selectedBook.value);
      }
    } else {
      console.warn('[TransactionView] No books available in store');
    }
    
    console.log('[TransactionView] Filtered accounts:', filteredAccounts.value.map(a => a.id));
    
    // Проверяем, есть ли отфильтрованные счета
    if (filteredAccounts.value.length > 0) {
      // Если выбранный счет не установлен или не найден среди отфильтрованных, выбираем первый доступный
      if (!selectedAccount.value || !filteredAccounts.value.some(account => account.id === selectedAccount.value)) {
        selectedAccount.value = filteredAccounts.value[0].id;
        console.log('[TransactionView] Set account to first filtered account:', selectedAccount.value);
      }
    } else if (accountStore.activeAccounts.length > 0) {
      // Если нет отфильтрованных счетов, но есть активные, выбираем первый активный
      selectedAccount.value = accountStore.activeAccounts[0].id;
      console.log('[TransactionView] No filtered accounts, set to first active account:', selectedAccount.value);
    } else if (accountStore.accounts.length > 0) {
      // Если нет активных счетов, но есть счета в хранилище, выбираем первый счет
      selectedAccount.value = accountStore.accounts[0].id;
      console.log('[TransactionView] No active accounts, set to first account:', selectedAccount.value);
    } else {
      console.warn('[TransactionView] No accounts available in store');
    }
    
    // Установим destinationAccount, если нужно
    if (selectedType.value === 'transfer' && accountStore.accounts.length > 1) {
      // Выбираем любой счет, отличный от selectedAccount
      const otherAccount = accountStore.accounts.find(acc => acc.id !== selectedAccount.value && acc.isActive);
      if (otherAccount) {
        destinationAccount.value = otherAccount.id;
        console.log('[TransactionView] Set destination account to:', destinationAccount.value);
      } else {
        // Если нет другого активного счета, просто берем любой отличный от selectedAccount
        const anyOtherAccount = accountStore.accounts.find(acc => acc.id !== selectedAccount.value);
        if (anyOtherAccount) {
          destinationAccount.value = anyOtherAccount.id;
          console.log('[TransactionView] Set destination to available account:', destinationAccount.value);
        }
      }
    }
    
    console.log('[TransactionView] All stores initialized successfully');
    
    // Отладочная информация
    console.log('[TransactionView] Selected book:', selectedBook.value);
    console.log('[TransactionView] All accounts count:', accountStore.accounts.length);
    console.log('[TransactionView] Active accounts count:', accountStore.activeAccounts.length);
    console.log('[TransactionView] Filtered accounts count:', filteredAccounts.value.length);
    console.log('[TransactionView] Filtered accounts:', filteredAccounts.value.map(a => ({ id: a.id, name: a.name })));
  } catch (error) {
    console.error('[TransactionView] Error initializing stores:', error);
  } finally {
    isLoading.value = false;
  }
};

// Фильтруем счета по выбранной книге
const filteredAccounts = computed(() => {
  // Если хранилища не инициализированы, вернуть пустой массив
  if (!accountStore.isInitialized || !bookStore.isInitialized) {
    console.log('[TransactionView] Stores not initialized yet');
    return [];
  }
  
  // Если нет активных счетов, вернуть пустой массив
  if (!accountStore.activeAccounts.length) {
    console.log('[TransactionView] No active accounts available');
    return [];
  }
  
  // Если тип транзакции перевод, показываем все счета
  if (selectedType.value === 'transfer') {
    console.log('[TransactionView] Transfer mode - showing all active accounts');
    return accountStore.activeAccounts;
  }
  
  // Если выбранная книга не существует, возвращаем все активные счета
  const selectedBookExists = bookStore.books.some(book => book.id === selectedBook.value);
  if (!selectedBookExists) {
    console.log('[TransactionView] Selected book does not exist, showing all active accounts');
    return accountStore.activeAccounts;
  }
  
  console.log('[TransactionView] Filtering accounts for book:', selectedBook.value);
  
  // Иначе фильтруем счета по выбранной книге
  const filtered = accountStore.activeAccounts.filter(account => {
    // Проверяем наличие счета в выбранной книге через bookIds
    if (account.bookIds && account.bookIds.includes(selectedBook.value)) {
      return true;
    }
    
    // Если у счета нет привязки к книгам, ищем по владельцу книги
    if (!account.bookIds || account.bookIds.length === 0) {
      const book = bookStore.getBookById(selectedBook.value);
      if (book && book.ownerIds && account.ownerId && book.ownerIds.includes(account.ownerId)) {
        return true;
      }
    }
    
    return false;
  });
  
  return filtered;
});

// Вычисляемое свойство для определения показывать ли слайдер распределения
const shouldShowDistribution = computed(() => {
  // Для переводов не показываем
  if (selectedType.value === 'transfer') return false;
  
  // Проверяем наличие правил распределения в выбранной книге
  const book = bookStore.getBookById(selectedBook.value);
  return book && book.distributionRules && book.distributionRules.length > 0;
});

// Получение данных владельцев для распределения
const distributionOwners = computed(() => {
  const book = bookStore.getBookById(selectedBook.value);
  if (!book || !book.distributionRules) return [];
  
  // Получаем данные пользователей для слайдера на основе правил распределения
  return book.distributionRules.map(rule => {
    const owner = systemStore.getOwnerById(rule.ownerId);
    return {
      id: rule.ownerId,
      name: owner ? owner.name : 'Unknown',
      percentage: rule.percentage
    };
  });
});

// Наблюдатель за изменением книги
watch(selectedBook, (newBookId) => {
  console.log('[TransactionView] Book changed to:', newBookId);
  
  // Проверяем, есть ли выбранный счет в новой книге
  const isAccountInNewBook = filteredAccounts.value.some(account => account.id === selectedAccount.value);
  
  // Если счет не найден в новой книге, выбираем первый доступный
  if (!isAccountInNewBook && filteredAccounts.value.length > 0) {
    selectedAccount.value = filteredAccounts.value[0].id;
    console.log('[TransactionView] Changed selected account to:', selectedAccount.value);
  }
  
  // Обновляем процент распределения
  const book = bookStore.getBookById(newBookId);
  if (book && book.distributionRules && book.distributionRules.length >= 2) {
    // Устанавливаем процент первого владельца из правил
    distributionPercentage.value = book.distributionRules[0].percentage;
  }
});

// Наблюдатель за изменением отфильтрованных счетов
watch(filteredAccounts, (newAccounts) => {
  if (newAccounts.length > 0 && !newAccounts.some(account => account.id === selectedAccount.value)) {
    selectedAccount.value = newAccounts[0].id;
    console.log('[TransactionView] Selected account updated to:', selectedAccount.value);
  }
}, { immediate: true });

// Вычисляемое свойство для получения символа валюты с использованием currencyStore
const currentCurrencySymbol = computed(() => {
  // Если счет не выбран или не удалось получить данные, возвращаем символ валюты по умолчанию
  if (!selectedAccount.value) {
    return currencyStore.getCurrency(currencyStore.appBaseCurrency)?.symbol || '$';
  }
  
  // Получаем выбранный счет
  const account = accountStore.getAccountById(selectedAccount.value);
  if (!account) {
    return currencyStore.getCurrency(currencyStore.appBaseCurrency)?.symbol || '$';
  }
  
  // Получаем код валюты из счета
  const currencyCode = account.currency;
  
  // Пытаемся получить валюту из хранилища валют
  const currency = currencyStore.getCurrency(currencyCode);
  if (currency) {
    return currency.symbol;
  }
  
  // Если валюта не найдена в хранилище, используем символ из счета или символ по умолчанию
  return account.symbol || currencyStore.getCurrency(currencyStore.appBaseCurrency)?.symbol || '$';
});

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
  if (newType === 'transfer' && accountStore.accounts.length > 1) {
    if (selectedAccount.value === destinationAccount.value || !destinationAccount.value) {
      // Устанавливаем другой счет в качестве получателя
      const otherAccounts = accountStore.accounts.filter(acc => 
        acc.id !== selectedAccount.value && acc.isActive
      );
      
      if (otherAccounts.length > 0) {
        destinationAccount.value = otherAccounts[0].id;
      } else {
        // Если нет других активных счетов, используем первый неактивный, отличный от выбранного
        const anyOtherAccount = accountStore.accounts.find(acc => acc.id !== selectedAccount.value);
        if (anyOtherAccount) {
          destinationAccount.value = anyOtherAccount.id;
        }
      }
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

// Получаем код валюты для выбранного счета
const getAccountCurrencyCode = (accountId: string): string => {
  const account = accountStore.getAccountById(accountId);
  if (!account) return currencyStore.appBaseCurrency;
  
  return account.currency;
};

const saveTransaction = () => {
  // Here we would save the transaction to the store/backend
  const sourceAccount = accountStore.getAccountById(selectedAccount.value);
  if (!sourceAccount) {
    console.error('[TransactionView] Cannot save transaction: source account not found');
    return;
  }
  
  const transactionData = {
    amount: parseFloat(amount.value),
    book: selectedBook.value,
    type: selectedType.value,
    account: selectedAccount.value,
    currency: sourceAccount.currency
  };
  
  // Добавляем дополнительную информацию в зависимости от типа транзакции
  if (selectedType.value === 'transfer') {
    transactionData.destinationAccount = destinationAccount.value;
    
    // Добавляем информацию о валюте счета-получателя
    const destAccount = accountStore.getAccountById(destinationAccount.value);
    if (destAccount) {
      transactionData.destinationCurrency = destAccount.currency;
    }
  } else {
    // Добавляем информацию о распределении только если оно доступно
    if (shouldShowDistribution.value) {
      transactionData.distribution = distributionPercentage.value;
    }
    transactionData.category = selectedCategory.value;
  }
  
  console.log('[TransactionView] Saving transaction:', transactionData);
  
  // Reset the form or navigate back
  amount.value = '0';
  selectedCategory.value = null;
};

const handleCategorySelect = (category) => {
  if (category) {
    selectedCategory.value = category;
    saveTransaction();
  } else {
    console.warn('[TransactionView] Attempted to select null category');
  }
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
  if (category) {
    selectedCategory.value = category;
    showCategoryList.value = false;
    showCategorySelector.value = true;
  }
};

const handleAddCategoryFromList = (data) => {
  // Здесь должен быть код для добавления новой категории
  console.log('[TransactionView] Adding new category with data:', data);
  // Потенциально здесь можно открыть третий попап для добавления категории
  // или реализовать эту логику в самом списке категорий
};

const handleCategoriesReordered = (reorderedCategories) => {
  console.log('[TransactionView] Categories reordered:', reorderedCategories);
  // Здесь мы должны обновить порядок категорий в хранилище
  // Но для демонстрации просто логируем новый порядок
  
  // В реальном приложении это могло бы выглядеть так:
  // categoryStore.updateCategoriesOrder(reorderedCategories);
};

// Обработка изменения активности категории
const handleToggleActiveCategory = ({ category, isActive, bookId }) => {
  if (!category || !bookId) {
    console.warn('[TransactionView] Invalid category toggle parameters', { category, isActive, bookId });
    return;
  }
  
  console.log(`[TransactionView] Category ${category.name} is now ${isActive ? 'active' : 'inactive'} in book ${bookId}`);
  
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