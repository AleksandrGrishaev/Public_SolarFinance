<!-- src/views/transaction/components/TransactionSelectors.vue -->
<template>
    <div class="filter-group">
      <!-- Тип транзакции -->
      <TransactionTypeSelector 
        :modelValue="type"
        @update:modelValue="updateType"
      />
      
      <!-- Селектор счетов -->
      <AccountSelector 
        :accounts="filteredAccounts" 
        :modelValue="account"
        :is-transfer="isTransfer"
        :destination-account-id="destinationAccount"
        :bookId="bookId"
        :showDistributionToggle="showDistributionToggle"
        :isDistributionVisible="isSliderVisible"
        @update:modelValue="updateAccount"
        @update:destination-account-id="updateDestinationAccount"
        @toggle-distribution="$emit('toggle-distribution')"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import TransactionTypeSelector from './TransactionTypeSelector.vue';
  import AccountSelector from './AccountSelector.vue';
  
  const props = defineProps({
    type: {
      type: String,
      required: true
    },
    account: {
      type: String,
      required: true
    },
    destinationAccount: {
      type: String,
      default: ''
    },
    filteredAccounts: {
      type: Array,
      required: true
    },
    bookId: {
      type: String,
      required: true
    },
    showDistributionToggle: {
      type: Boolean,
      default: false
    },
    isSliderVisible: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits([
    'update:type', 
    'update:account', 
    'update:destination-account',
    'toggle-distribution'
  ]);
  
  // Вычисляемое свойство - является ли транзакция переводом
  const isTransfer = computed(() => props.type === 'transfer');
  
  // Методы обновления свойств (для v-model)
  const updateType = (value) => {
    emit('update:type', value);
  };
  
  const updateAccount = (value) => {
    emit('update:account', value);
  };
  
  const updateDestinationAccount = (value) => {
    emit('update:destination-account', value);
  };
  </script>
  
  <style scoped>
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
    position: relative;
  }
  </style>