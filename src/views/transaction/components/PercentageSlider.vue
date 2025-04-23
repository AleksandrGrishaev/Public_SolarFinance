<!-- src/views/transaction/components/PercentageSlider.vue -->
<template>
  <div 
    class="percentage-slider-wrapper"
    :class="{
      'standard-distribution': !isNonStandard,
      'custom-distribution': isNonStandard
    }"
  >
    <BasePercentageSlider
      :sides="owners"
      :modelValue="modelValue"
      :totalValue="totalAmount"
      :valueSuffix="currency"
      :valueDecimals="2"
      :valueFormatter="formatAmountValue"
      @update:modelValue="updateValue"
    />
    
    <div v-if="isNonStandard" class="custom-distribution-badge">
      <div class="badge-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <span class="badge-text">Нестандартное распределение</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BasePercentageSlider from '@/components/ui/views/BasePercentageSlider.vue';

const props = defineProps({
  owners: {
    type: Array,
    required: true,
    default: () => [
      { name: 'Unknown', id: 'owner1', percentage: 50 },
      { name: 'Unknown', id: 'owner2', percentage: 50 }
    ]
  },
  modelValue: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: '$'
  },
  isNonStandard: {
    type: Boolean,
    default: false
  },
  standardValue: {
    type: Number,
    default: 50
  }
});

const emit = defineEmits(['update:modelValue']);

// Форматтер для значений в слайдере
const formatAmountValue = (value, side) => {
  return value.toFixed(2) + props.currency;
};

// Обновляем значение при изменении слайдера
const updateValue = (newValue) => {
  emit('update:modelValue', parseInt(newValue));
};
</script>

<style scoped>
.percentage-slider-wrapper {
  position: relative;
  padding: 2px;
  border-radius: var(--border-radius-md, 8px);
  transition: all 0.3s ease;
}

.custom-distribution {
  background-color: rgba(255, 152, 0, 0.1);
  border: 1px solid var(--color-warning, #ff9800);
  padding: 6px 4px;
}

.custom-distribution-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  color: var(--color-warning, #ff9800);
  font-size: 10px;
  gap: 4px;
}

.badge-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-text {
  line-height: 1;
  font-weight: 500;
}
</style>