// src/views/debt/composables/useDebtOperations.ts
import { ref, watch, type Ref } from 'vue';

// Define operation types
interface DebtOperation {
  id: string;
  debtId: string;
  title: string;
  description: string;
  date: Date;
  amount: number;
  currency: string;
  type: 'payment' | 'transfer' | 'adjustment';
  status: 'pending' | 'approved' | 'rejected';
  requester: {
    id: string;
    name: string;
  };
  color?: string;
}

/**
 * Composable for managing debt operations (pending payments, transfers, etc.)
 */
export function useDebtOperations(debtId: Ref<string>) {
  const pendingOperations = ref<DebtOperation[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  /**
   * Load pending operations for a specific debt
   */
  const loadPendingOperations = async () => {
    if (!debtId.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // In a real application, this would be an API call
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      pendingOperations.value = getMockOperations(debtId.value);
    } catch (err) {
      console.error('Error loading debt operations:', err);
      error.value = 'Failed to load pending operations';
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Accept a pending operation
   */
  const acceptOperation = async (operation: DebtOperation) => {
    isLoading.value = true;
    
    try {
      // In a real application, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      
      // Update the operation status locally
      const index = pendingOperations.value.findIndex(op => op.id === operation.id);
      if (index !== -1) {
        pendingOperations.value[index] = {
          ...operation,
          status: 'approved'
        };
        
        // Remove from pending list
        pendingOperations.value = pendingOperations.value.filter(op => op.status === 'pending');
      }
      
      console.log(`Operation ${operation.id} accepted`);
      return true;
    } catch (err) {
      console.error('Error accepting operation:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Decline a pending operation
   */
  const declineOperation = async (operation: DebtOperation) => {
    isLoading.value = true;
    
    try {
      // In a real application, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      
      // Update the operation status locally
      const index = pendingOperations.value.findIndex(op => op.id === operation.id);
      if (index !== -1) {
        pendingOperations.value[index] = {
          ...operation,
          status: 'rejected'
        };
        
        // Remove from pending list
        pendingOperations.value = pendingOperations.value.filter(op => op.status === 'pending');
      }
      
      console.log(`Operation ${operation.id} declined`);
      return true;
    } catch (err) {
      console.error('Error declining operation:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * View details of an operation
   */
  const viewOperationDetails = (operation: DebtOperation) => {
    console.log('Viewing operation details:', operation);
    // This function would typically navigate to a details view
    // or open a modal with the operation details
  };
  
  // Watch for changes in the debt ID and reload operations
  watch(debtId, (newId, oldId) => {
    if (newId !== oldId) {
      loadPendingOperations();
    }
  });
  
  /**
   * Generate mock operations for demo purposes
   */
  const getMockOperations = (debtId: string): DebtOperation[] => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return [
      {
        id: `op_${debtId}_1`,
        debtId,
        title: 'Debt Payment',
        description: 'Monthly payment for debt',
        date: yesterday,
        amount: -1200,
        currency: 'RUB',
        type: 'payment',
        status: 'pending',
        requester: {
          id: 'user_2',
          name: 'Sasha Solar'
        },
        color: '#DB9894'
      },
      {
        id: `op_${debtId}_2`,
        debtId,
        title: 'Debt Adjustment',
        description: 'Adjustment based on currency rate',
        date: now,
        amount: 450,
        currency: 'RUB',
        type: 'adjustment',
        status: 'pending',
        requester: {
          id: 'user_1',
          name: 'Alex'
        },
        color: '#4E8090'
      }
    ];
  };
  
  return {
    pendingOperations,
    isLoading,
    error,
    loadPendingOperations,
    acceptOperation,
    declineOperation,
    viewOperationDetails
  };
}