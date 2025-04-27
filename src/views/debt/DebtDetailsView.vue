<template>
  <div class="debt-detail-view">
    <!-- Header section with debt type selector and debt icons -->
    <DebtTypeSelector 
      v-model="currentDebtType"
      @add-debt="openAddDebtModal"
    />
    
    <DebtIcons 
      v-if="debt && relatedDebts && relatedDebts.length > 0"
      :debts="relatedDebts"
      :selectedDebtId="debtId"
      @select-debt="navigateToDebt"
    />
    
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading debt details...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="loadDebtDetails" class="retry-button">Retry</button>
    </div>
    
    <div v-else-if="!debt" class="not-found-container">
      <p>Debt not found</p>
      <p class="error-details">ID: {{ debtId }}</p>
      <button @click="$router.push('/debt')" class="back-button">Back to Debts</button>
    </div>
    
    <div v-else class="debt-content">
      <!-- Debt header with title and edit button -->
      <DebtHeader 
        :debt="debt"
        :editable="true"
        @edit="editDebtInfo"
      />
      
      <!-- Debt info section with date filter -->
      <DebtInfo 
        :debt="debt"
        :dateFilter="dateFilter"
        @update:dateFilter="updateDateFilter"
      />
      
      <!-- Quick action button for debt payment -->
      <FastDebtAction 
        :debt="debt"
        @pay="initiateDebtPayment"
      />
      
      <!-- Pending operations that need approval -->
      <DebtAcceptGroup 
        v-if="pendingOperations && pendingOperations.length > 0"
        :operations="pendingOperations"
        @accept="acceptOperation"
        @decline="declineOperation"
        @view="viewOperationDetails"
      />
      
      <!-- List of all transactions related to this debt -->
      <TransactionList 
        :transactions="filteredTransactions || []"
        :dateFilter="dateFilter"
        @view-transaction="viewTransactionDetails"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDebts } from './composables/useDebts';
import { useDebtOperations } from './composables/useDebtOperations';
import { useDebtTransactions } from './composables/useDebtTransactions';

// Import components
import DebtTypeSelector from './components/DebtTypeSelector.vue';
import DebtIcons from './components/DebtIcons.vue';
import DebtHeader from './components/DebtHeader.vue';
import DebtInfo from './components/DebtInfo.vue';
import FastDebtAction from './components/FastDebtAction.vue';
import DebtAcceptGroup from './components/DebtAcceptGroup.vue';
import TransactionList from './components/TransactionList.vue';

// Router and route
const route = useRoute();
const router = useRouter();
const debtId = computed(() => route.params.id as string);

// Local state to store the loaded debt
const debt = ref(null);
const isLoading = ref(false);
const error = ref(null);

// Use composables
const {
  loadDebts,
  getDebtById,
  getRelatedDebtsByType
} = useDebts();

const {
  pendingOperations,
  acceptOperation,
  declineOperation,
  viewOperationDetails,
  loadPendingOperations
} = useDebtOperations(debtId);

const {
  transactions: allTransactions,
  filteredTransactions,
  dateFilter,
  updateDateFilter,
  loadTransactions
} = useDebtTransactions(debtId);

// Local state
const currentDebtType = ref('all');

// Get related debts with safeguards
const relatedDebts = computed(() => {
  if (!debt.value || !debt.value.group) return [];
  
  const related = getRelatedDebtsByType(debt.value.group);
  return related || [];
});

// Main loading function
const loadDebtDetails = async () => {
  if (!debtId.value) {
    error.value = 'Invalid debt ID';
    return;
  }
  
  isLoading.value = true;
  error.value = null;
  
  try {
    console.log('Loading debt details for ID:', debtId.value);
    
    // Load all required data in parallel
    await Promise.all([
      loadDebts(),
      loadPendingOperations(),
      loadTransactions()
    ]);
    
    // Get debt data from the store
    const foundDebt = getDebtById(debtId.value);
    // Store it in our local ref
    debt.value = foundDebt;
    
    console.log('Found debt:', debt.value);
    
    if (!debt.value) {
      error.value = 'Debt not found';
      console.error(`Debt with ID ${debtId.value} not found after loading all debts`);
    } else {
      // Set current debt type based on loaded debt
      currentDebtType.value = debt.value.group || 'all';
    }
  } catch (err) {
    console.error('Error loading debt details:', err);
    error.value = 'Failed to load debt details';
  } finally {
    isLoading.value = false;
  }
};

// Event handlers
const navigateToDebt = (id: string) => {
  if (id === debtId.value) return;
  router.push(`/debt/${id}`);
};

const openAddDebtModal = () => {
  // Implementation for adding a new debt
  console.log('Opening add debt modal');
  // TODO: Implement actual functionality
};

const editDebtInfo = () => {
  // Implementation for editing debt info
  console.log('Editing debt info');
  // TODO: Implement actual functionality
};

const initiateDebtPayment = () => {
  // Implementation for initiating debt payment
  console.log('Initiating debt payment');
  
  if (debt.value) {
    // Navigate to transaction page with pre-filled data
    router.push({
      path: '/transaction',
      query: {
        type: 'expense',
        debtId: debt.value.id,
        amount: debt.value.remainingAmount.toString(),
        currency: debt.value.currency,
        description: `Payment for ${debt.value.name}`
      }
    });
  }
};

const viewTransactionDetails = (transaction) => {
  console.log('Viewing transaction details:', transaction.id);
  // TODO: Implement transaction details view
};

// Watch for debt ID changes and reload data
watch(debtId, async (newId, oldId) => {
  if (newId !== oldId) {
    console.log(`Debt ID changed from ${oldId} to ${newId}, reloading details`);
    await loadDebtDetails();
  }
}, { immediate: false });

// Initialize on component mount
onMounted(async () => {
  console.log('DebtDetailView mounted, loading debt with ID:', debtId.value);
  await loadDebtDetails();
  
  // Update header title in parent layout
  if (router.currentRoute.value && router.currentRoute.value.meta) {
    const title = debt.value?.name || 'Debt Details';
    if (router.currentRoute.value.meta.title !== undefined) {
      router.currentRoute.value.meta.title = title;
    }
  }
});
</script>

<style scoped>
.debt-detail-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  background-color: var(--bg-screen);
  color: var(--text-usual);
}

.debt-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 80px; /* Leave space for bottom navigation */
}

/* Loading states */
.loading-container,
.error-container,
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  margin-top: 32px;
  text-align: center;
  background-color: var(--bg-field-dark);
  border-radius: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--bg-light);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-details {
  color: var(--text-grey);
  font-size: var(--font-small-size);
  margin-top: 8px;
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
</style>