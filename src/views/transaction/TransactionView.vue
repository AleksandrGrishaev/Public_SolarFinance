<!-- src/views/transaction/TransactionView.vue -->
<template>
  <div class="transaction-view">
    <LoadingOverlay v-if="isLoading" />
    
    <div class="body-container" v-else>
      <!-- Секция отображения суммы с поддержкой конвертации валют -->
      <AmountSection
  ref="amountSectionRef"
  :amount="amount"
  :source-currency-symbol="sourceCurrencySymbol"
  :destination-currency-symbol="destinationCurrencySymbol"
  :converted-amount="convertedAmount"
  :is-transfer-with-different-currencies="isTransferWithDifferentCurrencies"
  :use-smaller-destination-font="true"
  :is-source-active="isSourceAmountActive"
  :manual-destination-amount="manualDestinationAmount"  
  @source-active="handleSourceAmountActive"
  @destination-active="handleDestinationAmountActive"
  @update-destination-amount="handleUpdateDestinationAmount"
  class="amount-display"
/>
      
      <!-- Селектор книги, отображается, если это не перевод -->
      <BookSelector 
        v-if="selectedType !== 'transfer'"
        v-model="selectedBook"
        class="book-selector"
      />
      
      <TransactionSelectors
        v-model:type="selectedType"
        v-model:account="selectedAccount"
        v-model:destination-account="destinationAccount"
        :filtered-accounts="filteredAccounts"
        :book-id="selectedBook"
        :is-slider-visible="isSliderVisible"
        :show-distribution-toggle="showDistributionToggle"
        @toggle-distribution="toggleDistributionVisibility"
      />
      
      <!-- Секция распределения с улучшенным слайдером -->
      <div v-if="isSliderVisible" class="percentage-slider-section">
        <PercentageSlider 
          :owners="distributionOwners" 
          v-model="distributionPercentage"
          :total-amount="parseFloat(amount) || 0"
          :currency="sourceCurrencySymbol"
          :is-non-standard="false"
          :standard-value="getStandardDistributionValue"
          @person-click="handlePersonClick"
          @add-person="handleAddPerson"
        />
      </div>
      
      <div class="keypad-container">
        <NumberKeypad 
          @input="handleKeypadInput" 
          @add="handleAddTransaction" 
          @delete="deleteLastDigit" 
          :is-loading="isSaving"
        />
      </div>
    </div>

    <!-- Popups для работы с транзакциями -->
    <TransactionDialogs
      v-model:show-category-selector="showCategorySelector"
      v-model:show-category-list="showCategoryList"
      :categories="filteredCategories"
      :book-id="selectedBook"
      :transaction-type="selectedType"
      :confirmation-dialog="confirmationDialog"
      :debtor-dialog="debtorDialog"
      :available-debtors="availableDebtors"
      :current-user-id="currentUserId"
      :distribution-percentage="distributionPercentage"
      :distribution-owners="distributionOwners"
      :source-currency-symbol="sourceCurrencySymbol"
      :amount="amount"
      @select-category="handleCategorySelect"
      @add-category="handleAddCategory"
      @open-category-list="handleOpenCategoryList"
      @category-list-select="handleCategoryListSelect"
      @add-category-from-list="handleAddCategoryFromList"
      @categories-reordered="handleCategoriesReordered"
      @toggle-active-category="handleToggleActiveCategory"
      @confirm-dialog="confirmDialogAction"
      @cancel-dialog="cancelDialogAction"
      @select-debtor="onDebtorSelected"
      @cancel-debtor="hideDebtorDialog"
    />
    
    <!-- Popup для выбора участника распределения -->
    <PersonSelectionPopup
      v-model="personSelectionPopupVisible"
      :book-id="selectedBook"
      :current-user-id="currentUserId"
      :slot-index="currentSlotIndex"
      @select="handlePersonSelect"
      @add="handlePersonAdd"
      @remove="handlePersonRemove"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeMount, watch } from 'vue';
import LoadingOverlay from './components/LoadingOverlay.vue';
import AmountSection from './components/AmountSection.vue';
import BookSelector from './components/BookSelector.vue';
import TransactionSelectors from './components/TransactionSelectors.vue';
import NumberKeypad from './components/NumberKeypad.vue';
import PercentageSlider from './components/PercentageSlider.vue';
import TransactionDialogs from './components/TransactionDialogs.vue';
import PersonSelectionPopup from '@/views/person/components/PersonSelectionPopup.vue';

// Импортируем хуки для управления транзакциями
import { useTransactionManager } from './composables/useTransactionManager';

// Определяем события для emit
const emit = defineEmits(['update:showMenu', 'update:header']);

// Реф для доступа к компоненту AmountSection
const amountSectionRef = ref(null);

// Инициализируем TransactionManager - он содержит всю логику
const {
  // Основное состояние
  isLoading,
  isSaving,
  amount,
  selectedBook,
  selectedType,
  selectedAccount,
  destinationAccount,
  filteredAccounts,
  showCategorySelector,
  showCategoryList,
  selectedCategory,
  filteredCategories,
  
  // Методы инициализации и настройки
  initAllStores,
  setupUI,
  initCurrencyStore,
  
  // Методы для работы с категориями
  handleCategorySelect,
  handleAddCategory,
  handleOpenCategoryList,
  handleCategoryListSelect,
  handleAddCategoryFromList,
  handleCategoriesReordered,
  handleToggleActiveCategory,
  
  // Распределение - полный набор функций из useDistribution
  distributionPercentage,
  distributionOwners,
  isSliderVisible,
  showDistributionToggle,
  isNonStandardDistribution,
  getStandardDistributionValue,
  toggleDistributionVisibility,
  personSelectionPopupVisible,
  currentSlotIndex,
  handlePersonClick,
  handleAddPerson,
  handlePersonSelect,
  setPopupVisibility,
  handlePersonRemove,
  removeSecondPerson,
  
  // Валюты
  sourceCurrencySymbol,
  destinationCurrencySymbol,
  isTransferWithDifferentCurrencies,
  convertedAmount,
  
  // Долги
  debtorDialog,
  availableDebtors,
  currentUserId,
  onDebtorSelected,
  hideDebtorDialog,
  
  // Диалог подтверждения
  confirmationDialog,
  
  // Обработчики клавиатуры
  handleKeypadInput,
  deleteLastDigit,
  handleAddTransaction,
  
  // Обработчики для валютных транзакций
  isSourceAmountActive,
  manualDestinationAmount,
  handleSourceAmountActive,
  handleDestinationAmountActive,
  handleUpdateDestinationAmount
} = useTransactionManager(emit, amountSectionRef);

// Обработчики действий диалогов
const confirmDialogAction = () => {
  if (confirmationDialog.value.onConfirm) {
    confirmationDialog.value.onConfirm();
  }
  confirmationDialog.value.show = false;
};

const cancelDialogAction = () => {
  if (confirmationDialog.value.onCancel) {
    confirmationDialog.value.onCancel();
  }
  confirmationDialog.value.show = false;
};

// Обработчик добавления новой персоны
const handlePersonAdd = () => {
  // Здесь можно добавить обработчик создания нового пользователя
  console.log('Implement person add functionality');
};

// Синхронизация состояния компонента AmountSection при изменениях
watch([isSourceAmountActive, manualDestinationAmount], ([newIsSourceActive, newManualAmount]) => {
  if (amountSectionRef.value) {
    // Обеспечиваем синхронизацию с компонентом AmountSection
    if (amountSectionRef.value.isSourceAmountActive !== newIsSourceActive) {
      if (newIsSourceActive) {
        amountSectionRef.value.switchToSourceAmount();
      } else {
        amountSectionRef.value.switchToDestinationAmount();
      }
    }
    
    if (amountSectionRef.value.manualDestinationAmount !== newManualAmount) {
      amountSectionRef.value.updateManualAmount(newManualAmount);
    }
  }
});

// Lifecycle hooks
onBeforeMount(() => {
  // Настраиваем UI интерфейса
  setupUI();
});

onMounted(async () => {
  try {
    // Инициализируем хранилища
    await initAllStores();
    
    // Инициализируем валюты
    await initCurrencyStore();
  } catch (error) {
    console.error('[TransactionView] Ошибка при инициализации:', error);
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
  background-color: #000000;
  box-sizing: border-box;
  overflow: hidden;
  justify-content: flex-end;
}

.body-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 16px 16px 0;
  box-sizing: border-box;
  justify-content: flex-end;
  padding-bottom: 70px;
  gap: 15px;
}

.book-selector {
  margin: 0;
}

.amount-display {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.percentage-slider-section {
  width: 100%;
  transition: opacity 0.3s ease, max-height 0.3s ease;
}

.keypad-container {
  margin-top: auto;
  padding-left: 8px;
  padding-right: 8px;
  flex-shrink: 0;
}
</style>