<!-- src/components/molecules/groups/BaseGroup.vue -->
<template>
    <div class="base-group">
      <!-- Заголовок группы с опциональным итоговым значением -->
      <div class="group-header" v-if="title || $slots.header">
        <div class="group-title">
          <slot name="header">{{ title }}</slot>
        </div>
        <div 
          v-if="totalValue || $slots.total" 
          class="group-total" 
          :class="totalClasses"
        >
          <slot name="total">{{ totalValue }}</slot>
        </div>
      </div>
      
      <!-- Содержимое группы -->
      <div class="group-content" :class="{ 'with-background': withBackground }">
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  
  const props = defineProps({
    title: {
      type: String,
      default: ''
    },
    totalValue: {
      type: [String, Number],
      default: ''
    },
    totalValueType: {
      type: String,
      default: 'neutral',
      validator: (val: string) => ['neutral', 'positive', 'negative'].includes(val)
    },
    withBackground: {
      type: Boolean,
      default: true
    }
  });
  
  const totalClasses = computed(() => ({
    'total-positive': props.totalValueType === 'positive',
    'total-negative': props.totalValueType === 'negative'
  }));
  </script>
  
  <style scoped>
  .base-group {
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
    font-size: var(--font-small-size, 12px);
    color: var(--text-usual, #FFFFFF);
  }
  
  .group-total {
    font-size: var(--font-small-size, 12px);
    font-weight: 500;
  }
  
  .total-negative {
    color: var(--maincolor-colorwarrning, #a44942);
  }
  
  .total-positive {
    color: var(--maincolor-colorsucces, #53b794);
  }
  
  .group-content {
    display: flex;
    flex-direction: column;
  }
  
  .group-content.with-background {
    background-color: var(--bg-field-dark, #2A2A2A);
    border-radius: 32px;
    overflow: hidden;
  }
  </style>