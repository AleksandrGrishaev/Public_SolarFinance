<template>
    <div class="debt-info">
      <div class="debt-info-header">
        <h2 class="section-title">Debt Information</h2>
        
        <!-- Date filter for transactions -->
        <DateFilter 
          v-model="localDateFilter"
          @calendar-visibility-change="onCalendarVisibilityChange"
        />
      </div>
      
      <div class="debt-info-content">
        <!-- Book debt specific information -->
        <div v-if="debt.group === 'book'" class="book-debt-info">
          <div class="info-row">
            <div class="info-label">Book:</div>
            <div class="info-value">{{ debt.bookId || 'Not specified' }}</div>
          </div>
          
          <!-- Distribution table for book debts -->
          <div class="distribution-section" v-if="hasDistribution">
            <h3 class="distribution-title">Distribution</h3>
            <div class="distribution-table">
              <div class="table-header">
                <div class="participant-cell">Participant</div>
                <div class="percentage-cell">Percentage</div>
                <div class="amount-cell">Amount</div>
              </div>
              <div 
                v-for="(party, index) in debt.fromParties" 
                :key="index"
                class="table-row"
              >
                <div class="participant-cell">{{ party.name || party.entityId }}</div>
                <div class="percentage-cell">{{ party.percentage }}%</div>
                <div class="amount-cell" :class="{'negative': !isDebtOwed(debt)}">
                  {{ formatDistributedAmount(party.percentage, debt.remainingAmount, debt.currency) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Person debt specific information -->
        <div v-else-if="debt.group === 'person'" class="person-debt-info">
          <!-- From parties (who owes) -->
          <div class="info-section" v-if="debt.fromParties && debt.fromParties.length > 0">
            <h3 class="section-subtitle">Who Owes</h3>
            <div 
              v-for="party in debt.fromParties" 
              :key="party.entityId"
              class="info-row"
            >
              <div class="info-label">{{ party.name || party.entityId }}:</div>
              <div class="info-value">{{ party.percentage }}%</div>
            </div>
          </div>
          
          <!-- To parties (to whom) -->
          <div class="info-section" v-if="debt.toParties && debt.toParties.length > 0">
            <h3 class="section-subtitle">To Whom</h3>
            <div 
              v-for="party in debt.toParties" 
              :key="party.entityId"
              class="info-row"
            >
              <div class="info-label">{{ party.name || party.entityId }}:</div>
              <div class="info-value">{{ party.percentage }}%</div>
            </div>
          </div>
        </div>
        
        <!-- Credit debt specific information -->
        <div v-else-if="debt.group === 'credit'" class="credit-debt-info">
          <div class="info-row">
            <div class="info-label">Creditor:</div>
            <div class="info-value">{{ debt.creditorName || 'Not specified' }}</div>
          </div>
          
          <div class="info-row" v-if="debt.interestRate">
            <div class="info-label">Interest Rate:</div>
            <div class="info-value">{{ debt.interestRate }}%</div>
          </div>
          
          <div class="info-row" v-if="debt.startDate">
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
        
        <!-- Generic information for all debt types -->
        <div class="common-info">
          <div class="info-row">
            <div class="info-label">Type:</div>
            <div class="info-value">{{ formatDebtType(debt.type) }}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Category:</div>
            <div class="info-value">{{ formatDebtCategory(debt.category) }}</div>
          </div>
          
          <div class="info-row">
            <div class="info-label">Created:</div>
            <div class="info-value">{{ formatDate(debt.createdAt) }}</div>
          </div>
          
          <div class="info-row" v-if="debt.description">
            <div class="info-label">Description:</div>
            <div class="info-value description">{{ debt.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import DateFilter from '@/components/ui/filters/DateFilter.vue';
  import { useDebts } from '../composables/useDebts';
  
  const props = defineProps({
    debt: {
      type: Object,
      required: true
    },
    dateFilter: {
      type: Object,
      default: () => ({
        period: 'monthly',
        date: new Date()
      })
    }
  });
  
  const emit = defineEmits(['update:dateFilter']);
  
  // Use the debts composable
  const { 
    isDebtOwed, 
    formatCurrency
  } = useDebts();
  
  // Two-way binding for date filter
  const localDateFilter = computed({
    get: () => props.dateFilter,
    set: (value) => emit('update:dateFilter', value)
  });
  
  // Handle calendar visibility changes
  const onCalendarVisibilityChange = (isVisible) => {
    // You can add additional logic here if needed
    console.log('Calendar visibility changed:', isVisible);
  };
  
  // Check if the debt has distribution data
  const hasDistribution = computed(() => {
    return props.debt.fromParties && props.debt.fromParties.length > 0;
  });
  
  // Format date with standard method
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'Invalid date';
      
      return new Intl.DateTimeFormat('default', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  // Format distributed amount
  const formatDistributedAmount = (percentage, totalAmount, currency) => {
    if (percentage === undefined || totalAmount === undefined) {
      return formatCurrency(0, currency);
    }
    
    const amount = (percentage / 100) * totalAmount;
    return formatCurrency(amount, currency);
  };
  
  // Format debt type
  const formatDebtType = (type) => {
    switch (type) {
      case 'internal': return 'Internal';
      case 'external': return 'External';
      case 'family': return 'Family';
      case 'group': return 'Group';
      default: return type;
    }
  };
  
  // Format debt category
  const formatDebtCategory = (category) => {
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
  </script>
  
  <style scoped>
  .debt-info {
    background-color: var(--bg-field-dark);
    border-radius: 32px;
    overflow: hidden;
  }
  
  .debt-info-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
  }
  
  .section-title {
    font-size: var(--font-subheading-size);
    font-weight: var(--font-subheading-weight);
    color: var(--text-header);
    margin: 0 0 12px 0;
  }
  
  .debt-info-content {
    padding: 16px 20px;
  }
  
  .info-section {
    margin-bottom: 16px;
  }
  
  .section-subtitle {
    font-size: var(--font-body-size);
    font-weight: var(--font-body-weight);
    color: var(--text-usual);
    margin: 0 0 8px 0;
  }
  
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .info-row:last-child {
    border-bottom: none;
  }
  
  .info-label {
    color: var(--text-grey);
    font-size: var(--font-small-size);
  }
  
  .info-value {
    font-weight: 500;
    color: var(--text-usual);
    font-size: var(--font-small-size);
  }
  
  .due-date {
    color: var(--color-primary);
  }
  
  .description {
    max-width: 60%;
    text-align: right;
    word-break: break-word;
  }
  
  .distribution-section {
    margin-top: 16px;
  }
  
  .distribution-title {
    font-size: var(--font-body-size);
    font-weight: var(--font-body-weight);
    color: var(--text-usual);
    margin: 0 0 8px 0;
  }
  
  .distribution-table {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--bg-field-light);
  }
  
  .table-header {
    display: flex;
    background-color: var(--bg-light);
    padding: 8px 12px;
    font-weight: 500;
    color: var(--text-usual);
    font-size: var(--font-small-size);
  }
  
  .table-row {
    display: flex;
    padding: 8px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .table-row:last-child {
    border-bottom: none;
  }
  
  .participant-cell {
    flex: 2;
  }
  
  .percentage-cell {
    flex: 1;
    text-align: center;
  }
  
  .amount-cell {
    flex: 2;
    text-align: right;
  }
  
  .amount-cell.negative {
    color: var(--maincolor-colorwarrning);
  }
  
  .book-debt-info,
  .person-debt-info,
  .credit-debt-info {
    margin-bottom: 16px;
  }
  
  .common-info {
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
  }
  </style>