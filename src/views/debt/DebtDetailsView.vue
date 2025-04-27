<template>
    <div class="debt-details-view">
      
      <div class="debt-content">
        <div v-if="isLoading" class="loading-container">
          <p>Loading debt details...</p>
        </div>
        
        <div v-else-if="error" class="error-container">
          <p>{{ error }}</p>
          <button @click="loadDebtDetails" class="retry-button">Retry</button>
        </div>
        
        <div v-else-if="!debt" class="not-found-container">
          <p>Debt not found</p>
          <button @click="$router.push('/debt')" class="back-button">Back to Debts</button>
        </div>
        
        <div v-else class="debt-info">
          <!-- Основная информация -->
          <div class="info-card">
            <h2>{{ debt.name }}</h2>
            <div class="debt-subtitle" v-if="debt.subtitle">{{ debt.subtitle }}</div>
            
            <div class="amount-display">
              <div class="amount-value" :class="{'negative': !isDebtOwed(debt), 'positive': isDebtOwed(debt)}">
                {{ formatDebtAmount(debt) }}
              </div>
              <div class="amount-original" v-if="debt.amount !== debt.remainingAmount">
                из {{ formatCurrency(debt.amount, debt.currency) }}
              </div>
            </div>
            
            <div class="debt-status">
              Status: <span :class="`status-${debt.status}`">{{ formatStatus(debt.status) }}</span>
            </div>
            
            <!-- Информация о категории и типе долга -->
            <div class="info-section">
              <div class="info-row">
                <div class="info-label">Type:</div>
                <div class="info-value">{{ formatDebtType(debt.type) }}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Category:</div>
                <div class="info-value">{{ formatDebtCategory(debt.category) }}</div>
              </div>
              <div class="info-row" v-if="debt.creditorName">
                <div class="info-label">Creditor:</div>
                <div class="info-value">{{ debt.creditorName }}</div>
              </div>
            </div>
            
            <!-- Информация о датах -->
            <div class="info-section">
              <div class="info-row">
                <div class="info-label">Created:</div>
                <div class="info-value">{{ formatDate(debt.createdAt) }}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Start Date:</div>
                <div class="info-value">{{ formatDate(debt.startDate) }}</div>
              </div>
              <div class="info-row" v-if="debt.endDate">
                <div class="info-label">End Date:</div>
                <div class="info-value">{{ formatDate(debt.endDate) }}</div>
              </div>
              <div class="info-row" v-if="debt.dueDate">
                <div class="info-label">Next Payment:</div>
                <div class="info-value due-date">{{ formatDate(debt.dueDate) }}</div>
              </div>
            </div>
            
            <!-- Информация о процентах (для кредитов) -->
            <div class="info-section" v-if="debt.interestRate">
              <div class="info-row">
                <div class="info-label">Interest Rate:</div>
                <div class="info-value">{{ debt.interestRate }}%</div>
              </div>
              <div class="info-row" v-if="debt.totalInterest">
                <div class="info-label">Total Interest:</div>
                <div class="info-value">{{ formatCurrency(debt.totalInterest, debt.currency) }}</div>
              </div>
            </div>
            
            <!-- Информация об участниках -->
            <div class="info-section" v-if="debt.fromParties && debt.fromParties.length > 0">
              <h3>Who Owes</h3>
              <div class="parties-list">
                <div 
                  v-for="party in debt.fromParties" 
                  :key="party.entityId"
                  class="party-item"
                >
                  <div class="party-name">{{ party.name || party.entityId }}</div>
                  <div class="party-percentage">{{ party.percentage }}%</div>
                </div>
              </div>
            </div>
            
            <div class="info-section" v-if="debt.toParties && debt.toParties.length > 0">
              <h3>To Whom</h3>
              <div class="parties-list">
                <div 
                  v-for="party in debt.toParties" 
                  :key="party.entityId"
                  class="party-item"
                >
                  <div class="party-name">{{ party.name || party.entityId }}</div>
                  <div class="party-percentage">{{ party.percentage }}%</div>
                </div>
              </div>
            </div>
            
            <!-- Добавить кнопку выплаты долга, если он активен -->
            <div class="action-buttons" v-if="debt.status === 'active' || debt.status === 'partially_paid'">
              <button class="action-button pay-button">Make Payment</button>
              <button class="action-button edit-button">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useDebts } from './composables/useDebts';
  import { type Debt, type DebtStatus, type DebtType, type DebtCategory } from '@/stores/debt/debtStore';
  
  const route = useRoute();
  const router = useRouter();
  const debtId = computed(() => route.params.id as string);
  
  const {
    isLoading,
    error,
    getDebtById,
    loadDebts,
    isDebtOwed,
    formatDebtAmount,
    formatCurrency
  } = useDebts();
  
  const debt = ref<Debt | undefined>(undefined);
  
  // Загрузка данных о долге
  const loadDebtDetails = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await loadDebts();
      debt.value = getDebtById(debtId.value);
      
      if (!debt.value) {
        error.value = 'Debt not found';
      }
    } catch (err) {
      console.error('Error loading debt details:', err);
      error.value = 'Failed to load debt details';
    } finally {
      isLoading.value = false;
    }
  };
  
  // Форматирование статуса долга
  const formatStatus = (status: DebtStatus): string => {
    switch (status) {
      case 'active': return 'Active';
      case 'partially_paid': return 'Partially Paid';
      case 'paid': return 'Paid';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };
  
  // Форматирование типа долга
  const formatDebtType = (type: DebtType): string => {
    switch (type) {
      case 'internal': return 'Internal';
      case 'external': return 'External';
      case 'family': return 'Family';
      case 'group': return 'Group';
      default: return type;
    }
  };
  
  // Форматирование категории долга
  const formatDebtCategory = (category: DebtCategory): string => {
    switch (category) {
      case 'loan': return 'Loan';
      case 'mortgage': return 'Mortgage';
      case 'credit_card': return 'Credit Card';
      case 'personal_loan': return 'Personal Loan';
      case 'family_debt': return 'Family Debt';
      case 'group_debt': return 'Group Debt';
      case 'book_balance': return 'Book Balance';
      default: return category;
    }
  };
  
  // Форматирование даты
  const formatDate = (date: Date | string): string => {
    if (!date) return 'N/A';
    
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString();
  };
  
  // Обновляем заголовок и настройки в родительском IosLayout
  const updateHeaderSettings = () => {
    // Отправляем событие родительскому компоненту IosLayout
    router.currentRoute.value.meta.title = debt.value?.name || 'Debt Details';
    router.currentRoute.value.meta.header = {
      show: true,
      showBack: true,
      showMessageIcon: true,
      hasNotifications: true,
      showProfileIcon: true
    };
  };
  
  // Загрузка данных при монтировании компонента
  onMounted(async () => {
    await loadDebtDetails();
    // Обновляем заголовок после загрузки долга
    updateHeaderSettings();
  });
  </script>
  
  <style scoped>
  .debt-details-view {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: var(--bg-screen);
    color: var(--text-usual);
  }
  
  .debt-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }
  
  .loading-container,
  .error-container,
  .not-found-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    text-align: center;
  }
  
  .retry-button,
  .back-button {
    margin-top: 16px;
    padding: 8px 16px;
    background-color: var(--accent-color);
    color: var(--text-contrast);
    border: none;
    border-radius: var(--border-radius-xl);
    cursor: pointer;
  }
  
  .info-card {
    background-color: var(--bg-field-dark);
    border-radius: 32px;
    padding: 24px;
    margin-bottom: 16px;
  }
  
  h2 {
    margin: 0 0 8px 0;
    font-size: var(--font-heading-size);
    font-weight: var(--font-heading-weight);
    color: var(--text-header);
  }
  
  .debt-subtitle {
    font-size: var(--font-small-size);
    color: var(--text-grey);
    margin-bottom: 16px;
  }
  
  .amount-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 24px 0;
  }
  
  .amount-value {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 4px;
  }
  
  .amount-value.negative {
    color: var(--maincolor-colorwarrning, #a44942);
  }
  
  .amount-value.positive {
    color: var(--maincolor-colorsucces, #53b794);
  }
  
  .amount-original {
    font-size: var(--font-small-size);
    color: var(--text-grey);
  }
  
  .debt-status {
    background-color: var(--bg-light);
    border-radius: 16px;
    padding: 8px 16px;
    text-align: center;
    margin-bottom: 24px;
  }
  
  .status-active {
    color: var(--maincolor-colorsucces, #53b794);
  }
  
  .status-partially_paid {
    color: var(--color-primary);
  }
  
  .status-paid {
    color: var(--text-grey);
  }
  
  .status-cancelled {
    color: var(--maincolor-colorwarrning, #a44942);
  }
  
  .info-section {
    border-top: 1px solid var(--border-color);
    padding: 16px 0;
  }
  
  .info-section h3 {
    font-size: var(--font-body-size);
    font-weight: var(--font-body-weight);
    margin: 0 0 12px 0;
    color: var(--text-header);
  }
  
  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  
  .info-label {
    color: var(--text-grey);
  }
  
  .info-value {
    font-weight: 500;
  }
  
  .due-date {
    color: var(--color-primary);
  }
  
  .parties-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .party-item {
    display: flex;
    justify-content: space-between;
    padding: 8px;
    background-color: var(--bg-screen);
    border-radius: 8px;
  }
  
  .party-percentage {
    font-weight: 500;
  }
  
  .action-buttons {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }
  
  .action-button {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: var(--border-radius-xl);
    font-size: var(--font-button-size);
    font-weight: var(--font-button-weight);
    cursor: pointer;
  }
  
  .pay-button {
    background-color: var(--accent-color);
    color: var(--text-contrast);
  }
  
  .edit-button {
    background-color: var(--bg-light);
    color: var(--text-usual);
  }
  </style>