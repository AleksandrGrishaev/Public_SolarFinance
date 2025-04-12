<!-- /Users/peaker/dev/solar-finance/src/views/TransactionView.vue -->
<template>
    <div class="transaction-view">
      <div class="amount-section">
        <div class="currency-symbol">$</div>
        <div class="amount-input">{{ amount }}</div>
      </div>
      
      <div class="filter-group">
        <book-selector 
          :books="availableBooks" 
          v-model="selectedBook" 
        />
        
        <transaction-type-selector 
          :types="transactionTypes" 
          v-model="selectedType" 
        />
        
        <account-selector 
          :accounts="availableAccounts" 
          v-model="selectedAccount" 
        />
        
        <percentage-slider 
          :owners="owners" 
          v-model="distributionPercentage" 
        />
      </div>
      
      <div class="spacer"></div>
      
      <number-keypad 
        @input="handleKeypadInput" 
        @add="saveTransaction" 
        @delete="deleteLastDigit" 
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import BookSelector from '../components/transactions/BookSelector.vue';
  import TransactionTypeSelector from '../components/transactions/TransactionTypeSelector.vue';
  import AccountSelector from '../components/transactions/AccountSelector.vue';
  import PercentageSlider from '../components/transactions/PercentageSlider.vue';
  import NumberKeypad from '../components/transactions/NumberKeypad.vue';
  
  // Data models
  const amount = ref('255');
  const selectedBook = ref('family');
  const selectedType = ref('expense');
  const selectedAccount = ref('dollar');
  const distributionPercentage = ref(50);
  
  // Mock data
  const availableBooks = [
    { id: 'my', name: 'My' },
    { id: 'family', name: 'Family' },
    { id: 'wife', name: 'Wife' }
  ];
  
  const transactionTypes = [
    { id: 'expense', name: 'Expense' },
    { id: 'income', name: 'Income' },
    { id: 'transfer', name: 'Transfer' }
  ];
  
  const availableAccounts = [
    { id: 'dollar', name: 'Dollar', currency: 'USD', color: '#BE9A40', symbol: 'D' }
  ];
  
  const owners = [
    { id: 'alex', name: 'Alex' },
    { id: 'wife', name: 'Wife' }
  ];
  
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
  
  const saveTransaction = () => {
    // Here we would save the transaction to the store/backend
    console.log('Saving transaction:', {
      amount: parseFloat(amount.value),
      book: selectedBook.value,
      type: selectedType.value,
      account: selectedAccount.value,
      distribution: distributionPercentage.value
    });
    
    // Reset the form or navigate back
    amount.value = '0';
  };
  </script>
  
  <style scoped>
  .transaction-view {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 20px 0 0;
  }
  
  .amount-section {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 0 20px;
    gap: 10px;
  }
  
  .currency-symbol {
    color: white;
    font-size: 32px;
    font-weight: 300;
    line-height: 24px;
  }
  
  .amount-input {
    color: white;
    font-size: 82px;
    font-weight: 300;
    line-height: 51px;
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 10px;
  }
  
  .spacer {
    flex: 1;
    min-height: 5px;
  }
  </style>