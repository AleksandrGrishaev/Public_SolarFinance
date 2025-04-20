<!-- src/views/transaction/TransactionView.vue -->
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
        <!-- Используем новый TransactionTypeSelector из ./components/ -->
        <transaction-type-selector 
          v-model="selectedType" 
        />
        
        <!-- Используем фильтрованные счета на основе выбранной книги и передаем ID книги -->
        <account-selector 
      :accounts="filteredAccounts" 
      v-model="selectedAccount"
      :is-transfer="selectedType === 'transfer'"
      :destination-account-id="destinationAccount"
      :bookId="selectedBook"
      :showDistributionToggle="showDistributionToggle"
      :isDistributionVisible="isSliderVisible"
      @update:destination-account-id="handleDestinationAccountChange"
      @toggle-distribution="toggleDistributionVisibility"
    />
        
        <!-- Слайдер отображается только если есть правила распределения в книге и это не перевод -->
        <percentage-slider 
      :owners="distributionOwners" 
      v-model="distributionPercentage"
      :total-amount="parseFloat(amount) || 0"
      :currency="sourceCurrencySymbol"
      :class="{ 'invisible': !isSliderVisible }"
    />
      </div>
      
      <div class="keypad-container">
        <number-keypad 
          @input="handleKeypadInput" 
          @add="handleAddTransaction" 
          @delete="deleteLastDigit" 
          :is-loading="isSaving"
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
import BookSelector from '../../components/transactions/BookSelector.vue';
// Импортируем новый TransactionTypeSelector из директории components
import TransactionTypeSelector from './components/TransactionTypeSelector.vue';
import AccountSelector from '../../components/transactions/AccountSelector.vue';
import PercentageSlider from '../../components/transactions/PercentageSlider.vue';
import NumberKeypad from '../../components/transactions/NumberKeypad.vue';
import CategorySelector from '../../components/categories/CategorySelector.vue';
import CategoryListPopup from '../../components/categories/CategoryListPopup.vue';
import AmountSection from '../../components/transactions/AmountSection.vue';

// Импортируем хуки и сервисы
import { useTransaction } from './composables/useTransaction.ts';
import { useAccount } from './composables/useAccount';
import { useCurrency } from './composables';
import { useAccountStore } from '../../stores/account';
import { useTransactionStore } from '../../stores/transaction';
import { useUserStore } from '../../stores/user';
import { useBookStore } from '../../stores/book';
import { useCurrencyStore } from '../../stores/currency';
import { messageService } from '../../services/system/MessageService';
import { useDistributionControl } from './composables/useDistributionControl';


// Определяем события для emit
const emit = defineEmits(['update:showMenu']);

// Состояние для управления вводом суммы
const isSourceAmountActive = ref(true);
const manualDestinationAmount = ref('0');
const amountSectionRef = ref(null);
const isSaving = ref(false);

// Инициализируем хранилища
const accountStore = useAccountStore();
const transactionStore = useTransactionStore();
const userStore = useUserStore();
const bookStore = useBookStore();
const currencyStore = useCurrencyStore();

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
  
  // Category handlers
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

// Работа со слайдером
const {
  isSliderVisible,
  showDistributionToggle,
  toggleDistributionVisibility
} = useDistributionControl(shouldShowDistribution, selectedType);

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
    // Для суммы источника
    if (value === '.' && amount.value.includes('.')) {
      return;
    }
    
    if (amount.value === '0' && value !== '.') {
      amount.value = value;
    } else {
      amount.value += value;
    }
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
    if (amount.value.length > 1) {
      amount.value = amount.value.slice(0, -1);
    } else {
      amount.value = '0';
    }
  }
};

// Обработчик добавления категории
const handleAddCategory = () => {
  // Стандартное поведение - передаем управление в дочерний компонент
  // который откроет попап создания категории
  showCategorySelector.value = false;
  showCategoryList.value = true;
};

// Обработчик выбора категории
const handleCategorySelect = (category) => {
  if (category) {
    selectedCategory.value = category;
    
    // Автоматически сохраняем транзакцию после выбора категории
    saveRegularTransaction();
    
    return true; // Показываем компоненту, что успешно обработали выбор
  } else {
    console.warn('[TransactionView] Attempted to select null category');
    return false;
  }
};

// Проверка валидности транзакции для перевода
const validateTransferTransaction = () => {
  // Проверяем сумму
  const amountValue = parseFloat(amount.value);
  if (isNaN(amountValue) || amountValue === 0) {
    messageService.error('Сумма должна быть больше нуля');
    return false;
  }
  
  // Проверяем выбранный счет
  if (!selectedAccount.value) {
    messageService.error('Выберите счет для транзакции');
    return false;
  }
  
  // Проверяем выбранную книгу
  if (!selectedBook.value) {
    messageService.error('Выберите книгу для транзакции');
    return false;
  }
  
  // Проверяем счет назначения для перевода
  if (!destinationAccount.value) {
    messageService.error('Выберите счет назначения для перевода');
    return false;
  }
  
  return true;
};

// Проверка валидности транзакции для дохода/расхода
const validateRegularTransaction = () => {
  // Проверяем сумму
  const amountValue = parseFloat(amount.value);
  if (isNaN(amountValue) || amountValue === 0) {
    messageService.error('Сумма должна быть больше нуля');
    return false;
  }
  
  // Проверяем выбранный счет
  if (!selectedAccount.value) {
    messageService.error('Выберите счет для транзакции');
    return false;
  }
  
  // Проверяем выбранную книгу
  if (!selectedBook.value) {
    messageService.error('Выберите книгу для транзакции');
    return false;
  }
  
  return true;
};

// Основной обработчик добавления транзакции
const handleAddTransaction = async () => {
  if (selectedType.value === 'transfer') {
    // Для переводов выполняем валидацию и сразу сохраняем
    if (validateTransferTransaction()) {
      await saveTransferTransaction();
    }
  } else {
    // Для доходов и расходов проверяем базовые поля
    if (validateRegularTransaction()) {
      // Если категория уже выбрана, сохраняем транзакцию
      if (selectedCategory.value) {
        await saveRegularTransaction();
      } else {
        // Если категория не выбрана, открываем селектор категорий
        showCategorySelector.value = true;
      }
    }
  }
};

// Сохранение обычной транзакции (доход/расход)
const saveRegularTransaction = async () => {
  try {
    isSaving.value = true;
    
    // Проверяем наличие выбранной категории
    if (!selectedCategory.value) {
      messageService.error('Необходимо выбрать категорию');
      showCategorySelector.value = true;
      return;
    }
    
    // Конвертируем сумму в число
    const amountValue = parseFloat(amount.value);
    const finalAmount = selectedType.value === 'expense' 
      ? -Math.abs(amountValue) 
      : Math.abs(amountValue);
    
    // Получаем данные о выбранном счете
    const account = accountStore.getAccountById(selectedAccount.value);
    if (!account) {
      throw new Error(`Счет с ID ${selectedAccount.value} не найден`);
    }
    
    // Получаем данные о выбранной книге
    const book = bookStore.getBookById(selectedBook.value);
    if (!book) {
      throw new Error(`Книга с ID ${selectedBook.value} не найдена`);
    }
    
    // Получаем текущего пользователя
    const currentUser = userStore.currentUser;
    if (!currentUser) {
      throw new Error('Не найден авторизованный пользователь');
    }
    
    // Определяем курс конвертации и сумму в валюте книги
    let bookRate = 1;
    let bookAmount = finalAmount;
    
    if (account.currency !== book.currency) {
      bookRate = currencyStore.getExchangeRate(account.currency, book.currency);
      bookAmount = finalAmount * bookRate;
    }
    
    // Формируем данные транзакции
    const transactionData = {
      date: new Date(),
      amount: finalAmount,
      currency: account.currency,
      bookCurrency: book.currency,
      bookRate: bookRate,
      bookAmount: bookAmount,
      type: selectedType.value,
      categoryId: selectedCategory.value.id,
      sourceEntityId: selectedAccount.value,
      sourceEntityType: 'account',
      executedByOwnerId: currentUser.id,
      responsibleOwnerIds: [currentUser.id],
      bookId: selectedBook.value
    };
    
    // Добавляем правила распределения
    if (shouldShowDistribution.value && distributionOwners.value.length > 0) {
      transactionData.distributionRules = [
        {
          ownerId: distributionOwners.value[0].id,
          percentage: distributionPercentage.value
        },
        {
          ownerId: distributionOwners.value[1].id,
          percentage: 100 - distributionPercentage.value
        }
      ];
    }
    
    // Сохраняем транзакцию
    await transactionStore.addTransaction(transactionData);
    
    // Показываем уведомление
    messageService.success('Транзакция успешно добавлена');
    
    // Сбрасываем форму
    resetForm();
  } catch (error) {
    console.error('[TransactionView] Ошибка при сохранении транзакции:', error);
    messageService.error('Произошла ошибка при сохранении транзакции');
  } finally {
    isSaving.value = false;
  }
};

// Сохранение транзакции перевода
const saveTransferTransaction = async () => {
  try {
    isSaving.value = true;
    
    // Конвертируем сумму в число
    const amountValue = Math.abs(parseFloat(amount.value));
    
    // Получаем данные о выбранных счетах
    const sourceAccount = accountStore.getAccountById(selectedAccount.value);
    const destAccount = accountStore.getAccountById(destinationAccount.value);
    
    if (!sourceAccount || !destAccount) {
      throw new Error('Исходный или целевой счет не найден');
    }
    
    // Получаем текущего пользователя
    const currentUser = userStore.currentUser;
    if (!currentUser) {
      throw new Error('Не найден авторизованный пользователь');
    }
    
    // 1. Создаем транзакцию списания со счета-источника
    const withdrawalData = {
      date: new Date(),
      amount: -amountValue,
      currency: sourceAccount.currency,
      type: 'transfer',
      description: `Перевод на счет ${destAccount.name}`,
      sourceEntityId: sourceAccount.id,
      sourceEntityType: 'account',
      destinationEntityId: destAccount.id,
      destinationEntityType: 'account',
      executedByOwnerId: currentUser.id,
      responsibleOwnerIds: [currentUser.id],
      bookId: selectedBook.value
    };
    
    // 2. Создаем транзакцию пополнения счета-назначения
    const depositData = {
      date: new Date(),
      amount: amountValue,
      currency: destAccount.currency,
      type: 'transfer',
      description: `Перевод со счета ${sourceAccount.name}`,
      sourceEntityId: sourceAccount.id,
      sourceEntityType: 'account',
      destinationEntityId: destAccount.id,
      destinationEntityType: 'account',
      executedByOwnerId: currentUser.id,
      responsibleOwnerIds: [currentUser.id],
      bookId: selectedBook.value
    };
    
    // Добавляем транзакции через хранилище
    await transactionStore.addTransaction(withdrawalData);
    await transactionStore.addTransaction(depositData);
    
    // Показываем уведомление об успехе
    messageService.success('Перевод между счетами успешно выполнен');
    
    // Сбрасываем форму
    resetForm();
  } catch (error) {
    console.error('[TransactionView] Ошибка при выполнении перевода:', error);
    messageService.error('Произошла ошибка при выполнении перевода');
  } finally {
    isSaving.value = false;
  }
};

// Сброс формы после успешного добавления
const resetForm = () => {
  amount.value = '0';
  selectedCategory.value = null;
  // Не сбрасываем счета и книгу, чтобы пользователю было удобнее 
  // добавлять несколько транзакций
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
  margin: 0; /* Уменьшаем отступ с 16px до 8px */
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
  /* Увеличиваем промежуток между фильтрами с 16px до 24px */
  gap: 24px;
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