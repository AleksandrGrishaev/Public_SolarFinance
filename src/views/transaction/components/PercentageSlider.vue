<!-- src/views/transaction/components/PercentageSlider.vue -->
<template>
  <div 
    class="percentage-slider-wrapper"
    :class="{
      'standard-distribution': !isNonStandard,
      'custom-distribution': isNonStandard
    }"
  >
    <!-- Используем BasePercentageSlider только если у нас есть второй участник -->
    <BasePercentageSlider
      v-if="hasSecondOwner"
      :sides="owners"
      :modelValue="modelValue"
      :totalValue="totalAmount"
      :valueSuffix="currency"
      :valueDecimals="2"
      :valueFormatter="formatAmountValue"
      @update:modelValue="updateValue"
    >
      <!-- Слот для кастомизации первой стороны -->
      <template #side-1>
        <span 
          class="side-name clickable" 
          :style="{ color: owners[0].color }"
          @click="onPersonClick(0)"
        >
          {{ owners[0].name }}
        </span>
        <span class="side-percentage" :style="{ color: owners[0].color }">{{ modelValue }}%</span>
        <span class="side-value" :style="{ color: owners[0].color }">{{ formatAmount(leftAmount) }}</span>
      </template>
      
      <!-- Слот для кастомизации второй стороны -->
      <template #side-2>
        <span 
          class="side-name clickable" 
          :style="{ color: owners[1].color }"
          @click="onPersonClick(1)"
        >
          {{ owners[1].name }}
        </span>
        <span class="side-percentage" :style="{ color: owners[1].color }">{{ 100 - modelValue }}%</span>
        <span class="side-value" :style="{ color: owners[1].color }">{{ formatAmount(rightAmount) }}</span>
      </template>
    </BasePercentageSlider>
    
    <!-- Кастомный вид, когда у нас только один участник и кнопка добавления -->
    <div v-else class="slider-container">
      <!-- Левая сторона слайдера (первый участник, всегда текущий пользователь) -->
      <div 
        class="person-side left-side" 
        :style="{ width: '100%', backgroundColor: owners[0].color || '#53B794' }"
        @click="onPersonClick(0)"
      >
        <div class="person-info">
          <div class="person-name">{{ owners[0].name }}</div>
          <div class="person-amount">{{ formatAmount(totalAmount) }}</div>
        </div>
        
        <!-- Кнопка добавления второго участника -->
        <div 
          class="add-person-btn"
          @click.stop="$emit('add-person')"
        >
          <AddIconButton />
          <span>Add</span>
        </div>
      </div>
    </div>
    
    <!-- Уведомление о нестандартном распределении удалено -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BasePercentageSlider from '@/components/ui/views/BasePercentageSlider.vue';
import AddIconButton from '@/components/atoms/buttons/AddIconButton.vue';

const props = defineProps({
  owners: {
    type: Array,
    required: true,
    default: () => [
      { name: 'Unknown', id: 'owner1', percentage: 100, color: '#53B794' },
      { name: 'Unknown', id: 'owner2', percentage: 0, color: '#DB9894' }
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
    default: 100
  }
});

const emit = defineEmits([
  'update:modelValue', 
  'person-click', 
  'add-person'
]);

// Проверяем, есть ли второй участник
const hasSecondOwner = computed(() => {
  return props.owners.length > 1 && !!props.owners[1].id;
});

// Вычисляем суммы для каждой стороны
const leftAmount = computed(() => {
  return (props.totalAmount * props.modelValue) / 100;
});

const rightAmount = computed(() => {
  return (props.totalAmount * (100 - props.modelValue)) / 100;
});

// Форматирование суммы
const formatAmount = (value) => {
  return value.toFixed(2) + props.currency;
};

// Форматтер для значений в слайдере
const formatAmountValue = (value, side) => {
  return value.toFixed(2) + props.currency;
};

// Обновляем значение при изменении слайдера
const updateValue = (newValue) => {
  emit('update:modelValue', parseInt(newValue));
};

// Обработчик клика на участника
const onPersonClick = (index) => {
  emit('person-click', index);
};
</script>

<style scoped>
.percentage-slider-wrapper {
  position: relative;
  padding: 2px;
  border-radius: var(--border-radius-md, 8px);
  transition: all 0.3s ease;
}

/* Стили для кастомного вида с одним участником */
.slider-container {
  position: relative;
  height: 48px;
  display: flex;
  border-radius: 24px;
  overflow: hidden;
  margin: 0 var(--spacing-sm);
}

.person-side {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  transition: width 0.2s ease;
  min-width: 10%;
  cursor: pointer;
}

.person-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.person-name {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.person-amount {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.add-person-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

/* Стили для нестандартного распределения - оставляем для общего стиля */
.custom-distribution {
  background-color: rgba(255, 152, 0, 0.1);
  border: 1px solid var(--color-warning, #ff9800);
  padding: 6px 4px;
}

/* Добавляем стили для кликабельных имен участников */
.clickable {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.clickable:hover {
  opacity: 0.8;
}
</style>