<!-- src/components/transactions/PercentageSlider.vue -->
<template>
  <BasePercentageSlider
    :sides="owners"
    :modelValue="modelValue"
    :totalValue="totalAmount"
    :valueSuffix="currency"
    :valueDecimals="2"
    :valueFormatter="formatAmountValue"
    @update:modelValue="updateValue"
  >
    <!-- Мы можем использовать слоты, но в данном случае 
         базового компонента достаточно -->
  </BasePercentageSlider>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
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
  }
});

const emit = defineEmits(['update:modelValue']);

// Логгирование для отладки
onMounted(() => {
  console.log('[PercentageSlider] Mounted with owners:', props.owners);
});

watch(() => props.owners, (newOwners) => {
  console.log('[PercentageSlider] Owners changed:', newOwners);
}, { deep: true });

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
/* Стили не нужны, так как мы используем базовый компонент */
</style>