<template>
    <div class="debt-group" v-if="debts.length > 0">
      <!-- Заголовок группы -->
      <div class="group-header">
        <div class="group-title">{{ title }}</div>
        <div 
          class="group-total" 
          :class="{
            'negative': totalAmount < 0, 
            'positive': totalAmount > 0
          }"
        >
          {{ formattedTotal }}
        </div>
      </div>
      
      <!-- Список долгов -->
      <div class="debt-list">
        <DebtItem 
          v-for="debt in debts" 
          :key="debt.id"
          :debt="debt"
          :isPositive="isDebtPositive(debt)"
          :showIcon="showIcons"
          @click="$emit('itemClick', debt.id)"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import DebtItem from './DebtItem.vue';
  import { type Debt } from '@/stores/debt/debtStore';
  
  const props = defineProps<{
    title: string;
    debts: Debt[];
    totalAmount: number;
    isDebtPositive: (debt: Debt) => boolean;
    showIcons?: boolean;
  }>();
  
  defineEmits<{
    (e: 'itemClick', id: string): void;
  }>();
  
  // Отформатированная общая сумма
  const formattedTotal = computed(() => {
    const prefix = props.totalAmount < 0 ? '-' : '';
    const absAmount = Math.abs(props.totalAmount);
    
    if (absAmount >= 1000) {
      return `${prefix}$ ${(absAmount / 1000).toFixed(0)}k`;
    } else {
      return `${prefix}$ ${absAmount.toFixed(2)}`;
    }
  });
  </script>
  
  <style scoped>
  .debt-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;
  }
  
  .group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
  }
  
  .group-title {
    font-size: var(--font-small-size);
    color: var(--text-usual);
  }
  
  .group-total {
    font-size: var(--font-small-size);
    font-weight: 500;
  }
  
  .group-total.negative {
    color: var(--maincolor-colorwarrning, #a44942);
  }
  
  .group-total.positive {
    color: var(--maincolor-colorsucces, #53b794);
  }
  
  .debt-list {
    background-color: var(--bg-field-dark);
    border-radius: 32px;
    overflow: hidden;
  }
  </style>