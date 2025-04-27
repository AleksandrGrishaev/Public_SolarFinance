<!-- src/components/atoms/items/BaseItem.vue -->
<template>
    <div 
      class="base-item"
      :class="{ 'inactive': inactive }"
      @click="$emit('click')"
    >
      <!-- Левая иконка/изображение (опционально) -->
      <div class="item-icon" v-if="showIcon">
        <slot name="icon">
          <div class="default-icon" :style="iconStyle"></div>
        </slot>
      </div>
      
      <!-- Основной контент -->
      <div class="item-content">
        <div class="item-title">
          <slot name="title">{{ title }}</slot>
        </div>
        <div class="item-subtitle" v-if="subtitle || $slots.subtitle">
          <slot name="subtitle">{{ subtitle }}</slot>
        </div>
      </div>
      
      <!-- Правая часть (обычно значение или индикатор) -->
      <div class="item-value" :class="valueClasses">
        <slot name="value">{{ value }}</slot>
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
    subtitle: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Number],
      default: ''
    },
    valueType: {
      type: String,
      default: 'neutral',
      validator: (val: string) => ['neutral', 'positive', 'negative'].includes(val)
    },
    showIcon: {
      type: Boolean,
      default: false
    },
    iconColor: {
      type: String,
      default: ''
    },
    inactive: {
      type: Boolean,
      default: false
    }
  });
  
  defineEmits(['click']);
  
  const valueClasses = computed(() => ({
    'value-positive': props.valueType === 'positive',
    'value-negative': props.valueType === 'negative'
  }));
  
  const iconStyle = computed(() => ({
    backgroundColor: props.iconColor || 'var(--bg-light, #444444)'
  }));
  </script>
  
  <style scoped>
  .base-item {
    display: flex;
    padding: 12px 16px;
    border-bottom: 0.5px solid var(--border-color, rgba(255, 255, 255, 0.1));
    cursor: pointer;
    align-items: center;
    transition: background-color 0.2s ease;
  }
  
  .base-item:last-child {
    border-bottom: none;
  }
  
  .base-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .base-item.inactive {
    opacity: 0.7;
    color: var(--text-grey, #949496);
  }
  
  .item-icon {
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .default-icon {
    width: 36px;
    height: 36px;
    background-color: var(--bg-light, #444444);
    border-radius: 50%;
  }
  
  .item-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .item-title {
    font-size: var(--font-body-size, 14px);
    font-weight: var(--font-body-weight, 400);
    color: var(--text-usual, #FFFFFF);
  }
  
  .item-subtitle {
    font-size: var(--font-small-size, 12px);
    color: var(--text-grey, #949496);
  }
  
  .item-value {
    font-size: var(--font-body-size, 14px);
    font-weight: var(--font-body-weight, 400);
    text-align: right;
    min-width: 90px;
  }
  
  .value-negative {
    color: var(--maincolor-colorwarrning, #a44942);
  }
  
  .value-positive {
    color: var(--maincolor-colorsucces, #53b794);
  }
  
  .inactive .item-value {
    color: var(--text-grey, #949496);
  }
  </style>