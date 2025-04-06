<template>
    <div class="transaction-type-selector">
      <div
        v-for="type in transactionTypes"
        :key="type.id"
        :class="['type-option', { active: selectedType === type.id }]"
        @click="selectType(type.id)"
      >
        {{ type.name }}
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  
  const props = defineProps({
    selectedType: {
      type: String,
      required: true
    }
  })
  
  const emit = defineEmits(['select-type'])
  
  const transactionTypes = ref([
    { id: 'expense', name: 'Expense' },
    { id: 'income', name: 'Income' },
    { id: 'transfer', name: 'Transfer' }
  ])
  
  const selectType = (typeId) => {
    emit('select-type', typeId)
  }
  </script>
  
  <style scoped>
  .transaction-type-selector {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
    padding: 4px;
    background-color: #333;
    border-radius: 24px;
  }
  
  .type-option {
    flex: 1;
    text-align: center;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 14px;
  }
  
  .type-option.active {
    background-color: #444;
    font-weight: 500;
  }
  </style>