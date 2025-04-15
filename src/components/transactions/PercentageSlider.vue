<!-- src/components/transactions/PercentageSlider.vue -->
<template>
  <div class="percentage-share-element">
    <div class="owner owner-1">
      <div class="owner-percentage">
        <span class="owner-name">{{ owners[0]?.name || 'Owner 1' }}</span>
        <span class="percentage">{{ percentageValues[0] }}%</span>
        <span class="amount-value">{{ formattedAmountValues[0] }}</span>
      </div>
    </div>
    
    <div class="slider-container">
      <input 
        type="range" 
        class="slider" 
        :value="modelValue"
        @input="updateValue"
        min="0" 
        max="100" 
        step="1"
        :style="sliderGradient"
      />
      <div class="slider-thumb"></div>
    </div>
    
    <div class="owner owner-2">
      <div class="owner-percentage">
        <span class="owner-name">{{ owners[1]?.name || 'Owner 2' }}</span>
        <span class="percentage">{{ percentageValues[1] }}%</span>
        <span class="amount-value">{{ formattedAmountValues[1] }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  owners: {
    type: Array,
    required: true,
    default: () => [
      { name: 'Owner 1', id: 'owner1', percentage: 50 },
      { name: 'Owner 2', id: 'owner2', percentage: 50 }
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

const percentageValues = computed(() => {
  return [props.modelValue, 100 - props.modelValue];
});

// Вычисляем натуральные значения на основе процентов и общей суммы
const amountValues = computed(() => {
  const total = props.totalAmount;
  return [
    (total * props.modelValue) / 100,
    (total * (100 - props.modelValue)) / 100
  ];
});

// Форматируем значения с символом валюты
const formattedAmountValues = computed(() => {
  return amountValues.value.map(amount => {
    // Округляем до двух знаков после запятой и форматируем
    return amount.toFixed(2) + props.currency;
  });
});

// Создаем динамический CSS градиент для слайдера в зависимости от значения
const sliderGradient = computed(() => {
  const percentage = props.modelValue;
  const color1 = props.owners[0]?.color || 'white';
  const color2 = props.owners[1]?.color || '#6499A7';
  return {
    background: `linear-gradient(to right, ${color1} 0%, ${color1} ${percentage}%, ${color2} ${percentage}%, ${color2} 100%)`
  };
});

const updateValue = (event) => {
  emit('update:modelValue', parseInt(event.target.value));
};
</script>

<style scoped>
.percentage-share-element {
  padding: 7px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.owner {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.owner-percentage {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.owner-name {
  color: white;
  font-size: 10px;
  font-weight: 600;
  line-height: 12px;
}

.percentage {
  color: white;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
}

.amount-value {
  color: white;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  margin-top: 2px;
}

.owner-2 .owner-name,
.owner-2 .percentage,
.owner-2 .amount-value {
  color: #6499A7;
}

.slider-container {
  position: relative;
  width: 100%;
  margin: 0 10px;
}

.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  outline: none;
  opacity: 0.7;
  transition: opacity .2s, background .3s;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 19px;
  height: 19px;
  background: #DBDADD;
  border-radius: 50%;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 19px;
  height: 19px;
  background: #DBDADD;
  border-radius: 50%;
  cursor: pointer;
}
</style>