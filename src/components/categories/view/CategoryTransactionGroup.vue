<!-- src/components/categories/view/CategoryTransactionGroup.vue -->
<template>
    <BaseTransactionGroup
      :title="formattedDate"
      :amount="totalAmount"
      :currency="currency"
      :amountType="isNegative ? 'negative' : 'positive'"
    >
      <slot></slot>
    </BaseTransactionGroup>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import BaseTransactionGroup from '@/components/ui/views/BaseTransactionGroup.vue';
  
  const props = defineProps({
    date: {
      type: [Date, String],
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'Rp'
    }
  });
  
  // Форматированная дата
  const formattedDate = computed(() => {
    const date = props.date instanceof Date ? props.date : new Date(props.date);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    
    return `${day} ${month}, ${year}`;
  });
  
  // Отрицательная ли сумма
  const isNegative = computed(() => props.totalAmount < 0);
  </script>