<!-- src/views/transaction/components/PercentageSlider.vue -->
<template>
  <div class="percentage-slider-wrapper">
    <!-- Всегда используем BasePercentageSlider независимо от количества участников -->
    <BasePercentageSlider
      :sides="owners"
      :modelValue="hasSecondOwner ? modelValue : 100"
      :disabled="!hasSecondOwner"
      :totalValue="totalAmount"
      :valueSuffix="currency"
      :valueDecimals="2"
      :valueFormatter="formatAmountValue"
      :leftColor="owners[0].color"
      :rightColor="owners.length > 1 ? owners[1].color : '#333333'"
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
        <span class="side-percentage" :style="{ color: owners[0].color }">{{ hasSecondOwner ? modelValue : 100 }}%</span>
        <span class="side-value" :style="{ color: owners[0].color }">{{ formatAmount(leftAmount) }}</span>
      </template>
      
      <!-- Слот для кастомизации второй стороны -->
      <template #side-2>
        <!-- Если второго участника нет, показываем только кнопку добавления -->
        <div v-if="!hasSecondOwner" class="add-person-container">
          <div 
            class="add-person-btn"
            @click.stop="$emit('add-person')"
          >
            <AddIconButton />
          </div>
        </div>
        
        <!-- Если второй участник есть, показываем его данные -->
        <template v-else>
          <span 
            class="side-name clickable"
            :style="{ color: owners[1].color }"
            @click="onPersonClick(1)"
          >
            {{ owners[1].name }}
          </span>
          <span 
            class="side-percentage"
            :style="{ color: owners[1].color }"
          >
            {{ 100 - modelValue }}%
          </span>
          <span 
            class="side-value"
            :style="{ color: owners[1].color }"
          >
            {{ formatAmount(rightAmount) }}
          </span>
        </template>
      </template>
    </BasePercentageSlider>
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
  if (index === 1 && !hasSecondOwner.value) {
    // Если нет второго участника и кликнули на его место, эмитим добавление
    emit('add-person');
  } else {
    emit('person-click', index);
  }
};
</script>

<style scoped>
.percentage-slider-wrapper {
  position: relative;
  padding: 2px;
  border-radius: var(--border-radius-md, 8px);
  transition: all 0.3s ease;
}

/* Стили для контейнера кнопки добавления */
.add-person-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* Стили для кнопки добавления второго участника */
.add-person-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
}

.add-person-btn:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.2);
}

/* Добавляем стили для кликабельных имен участников */
.clickable {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.clickable:hover {
  opacity: 0.8;
}

/* Стилизация слотов в слайдере */
.side-name, .side-percentage, .side-value {
  display: block;
  text-align: center;
}

.side-name {
  font-weight: 600;
  font-size: 14px;
}

.side-percentage {
  font-size: 14px;
}

.side-value {
  font-size: 12px;
  opacity: 0.9;
}
</style>