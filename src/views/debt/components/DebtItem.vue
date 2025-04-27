<template>
    <div 
      class="debt-item"
      :class="{ 'inactive': debt.status === 'paid' || debt.status === 'cancelled' }"
      @click="handleClick"
    >
      <!-- Иконка (только для кредитов) -->
      <div class="icon-container" v-if="showIcon">
        <div class="debt-icon" :style="{ backgroundColor: debt.color || 'var(--bg-light)' }"></div>
      </div>
      
      <!-- Информация о долге -->
      <div class="debt-details">
        <div class="debt-name">{{ debt.name }}</div>
        <div class="debt-subtitle" v-if="debt.subtitle">{{ debt.subtitle }}</div>
      </div>
      
      <!-- Сумма долга в оригинальной валюте -->
      <div class="debt-amount" :class="{ 'negative': !isPositive, 'positive': isPositive }">
        {{ formattedAmount }}
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import { type Debt } from '@/stores/debt/debtStore';
  
  const props = defineProps<{
    debt: Debt;
    isPositive: boolean;
    showIcon?: boolean;
  }>();
  
  const emit = defineEmits<{
    (e: 'click', id: string): void;
  }>();
  
  // Обработчик клика для надежной передачи ID
  const handleClick = () => {
    // Добавляем логирование для отладки
    console.log('Clicking debt item with ID:', props.debt.id);
    emit('click', props.debt.id);
  };
  
  // Форматированная сумма в оригинальной валюте долга
  const formattedAmount = computed(() => {
    const prefix = props.isPositive ? '' : '-';
    const amount = Math.abs(props.debt.remainingAmount);
    const currencySymbol = props.debt.currency;
    
    if (amount >= 1000) {
      return `${prefix}${currencySymbol} ${(amount / 1000).toFixed(0)}k`;
    } else {
      return `${prefix}${currencySymbol} ${amount.toFixed(2)}`;
    }
  });
  </script>
  
  <style scoped>
  .debt-item {
    display: flex;
    padding: 12px 16px;
    border-bottom: 0.5px solid var(--border-color);
    cursor: pointer;
    align-items: center;
    transition: background-color 0.2s ease;
  }
  
  .debt-item:last-child {
    border-bottom: none;
  }
  
  .debt-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .debt-item.inactive {
    opacity: 0.7;
    color: var(--text-grey);
  }
  
  .icon-container {
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .debt-icon {
    width: 36px;
    height: 36px;
    background-color: var(--bg-light);
    border-radius: 50%;
  }
  
  .debt-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .debt-name {
    font-size: var(--font-body-size);
    font-weight: var(--font-body-weight);
    color: var(--text-usual);
  }
  
  .debt-subtitle {
    font-size: var(--font-small-size);
    color: var(--text-grey);
  }
  
  .debt-amount {
    font-size: var(--font-body-size);
    font-weight: var(--font-body-weight);
    text-align: right;
    min-width: 90px;
  }
  
  .debt-amount.negative {
    color: var(--maincolor-colorwarrning, #a44942);
  }
  
  .debt-amount.positive {
    color: var(--maincolor-colorsucces, #53b794);
  }
  
  .inactive .debt-amount {
    color: var(--text-grey);
  }
  </style>