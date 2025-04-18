<!-- src/components/ui/inputs/CurrencySelector.vue -->
<template>
    <div class="currency-selector" @click="$emit('open-popup')">
      <div class="form-select">
        <div class="select-display">
          <span class="currency-symbol">{{ currencySymbol }}</span>
          <span class="currency-code">{{ currencyInfo }}</span>
        </div>
        <DropdownArrow class="dropdown-arrow" color="var(--text-grey)" />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import DropdownArrow from '../icons/DropdownArrow.vue';
  
  const props = defineProps({
    currencyCode: {
      type: String,
      required: true
    },
    currencySymbol: {
      type: String,
      default: '$'
    }
  });
  
  const emit = defineEmits(['open-popup']);
  
  const currencyInfo = computed(() => {
    if (props.currencySymbol && props.currencySymbol !== props.currencyCode) {
      return `${props.currencyCode} (${props.currencySymbol})`;
    }
    return props.currencyCode;
  });
  </script>
  
  <style scoped>
  .currency-selector {
    width: 100%;
    cursor: pointer;
  }
  
  .form-select {
    height: var(--input-height);
    background-color: var(--input-bg);
    border: none;
    border-radius: var(--input-radius);
    padding: 0 var(--spacing-md);
    color: var(--input-color);
    font-size: var(--font-body-size);
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: background-color var(--transition-speed) var(--transition-fn);
  }
  
  .form-select:hover {
    opacity: var(--state-hover-opacity);
  }
  
  .select-display {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }
  
  .currency-symbol {
    font-weight: var(--font-subheading-weight);
  }
  
  .dropdown-arrow {
    transition: transform var(--transition-speed) var(--transition-fn);
  }
  
  .form-select:hover .dropdown-arrow {
    transform: rotate(180deg);
  }
  </style>