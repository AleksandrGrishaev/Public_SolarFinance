<template>
    <div class="transaction-list">
      <div class="list-header">
        <h2 class="section-title">Transactions</h2>
      </div>
      
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading transactions...</p>
      </div>
      
      <div v-else-if="groupedTransactions.length === 0" class="empty-state">
        <p>No transactions found for the selected period</p>
      </div>
      
      <div v-else class="transaction-groups">
        <!-- Each transaction group by date -->
        <BaseList 
          v-for="group in groupedTransactions" 
          :key="group.date"
          :date="group.date"
        >
          <!-- Each transaction in the group using our custom component -->
          <TransactionItem
            v-for="transaction in group.transactions"
            :key="transaction.id"
            :transaction="transaction"
            @click="$emit('view-transaction', transaction)"
          />
        </BaseList>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed, ref } from 'vue';
  import { format, isValid, isToday, isYesterday, isSameWeek } from 'date-fns';
  import BaseList from '@/components/molecules/lists/BaseList.vue';
  import TransactionItem from './TransactionItem.vue';
  
  const props = defineProps({
    transactions: {
      type: Array,
      default: () => []
    },
    dateFilter: {
      type: Object,
      default: () => ({
        period: 'monthly',
        date: new Date()
      })
    }
  });
  
  const emit = defineEmits(['view-transaction']);
  
  // Local state
  const loading = ref(false);
  
  // Group transactions by date
  const groupedTransactions = computed(() => {
    const groups = {};
    
    // Sort transactions by date (newest first)
    const sortedTransactions = [...props.transactions].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    // Group by date
    sortedTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      if (!isValid(date)) return;
      
      const dateStr = format(date, 'yyyy-MM-dd');
      
      if (!groups[dateStr]) {
        groups[dateStr] = {
          date: getReadableDate(date),
          transactions: []
        };
      }
      
      groups[dateStr].transactions.push(transaction);
    });
    
    // Convert to array for v-for
    return Object.values(groups);
  });
  
  // Format a date in a human-readable format
  const getReadableDate = (date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (isSameWeek(date, new Date())) {
      // For same week, show day name
      return format(date, 'EEEE');
    } else {
      // For older dates, show date and month
      return format(date, 'd MMMM');
    }
  };
  </script>
  
  <style scoped>
  .transaction-list {
    background-color: var(--bg-field-dark);
    border-radius: 32px;
    overflow: hidden;
    margin-bottom: 16px;
  }
  
  .list-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
  }
  
  .section-title {
    font-size: var(--font-subheading-size);
    font-weight: var(--font-subheading-weight);
    color: var(--text-header);
    margin: 0;
  }
  
  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    text-align: center;
    color: var(--text-grey);
  }
  
  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--bg-light);
    border-top-color: var(--accent-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .transaction-groups {
    max-height: 500px;
    overflow-y: auto;
    scrollbar-width: thin;
    padding: 0 8px;
  }
  
  .transaction-groups::-webkit-scrollbar {
    width: 4px;
  }
  
  .transaction-groups::-webkit-scrollbar-track {
    background: var(--bg-field-dark);
  }
  
  .transaction-groups::-webkit-scrollbar-thumb {
    background-color: var(--bg-light);
    border-radius: 4px;
  }
  </style>