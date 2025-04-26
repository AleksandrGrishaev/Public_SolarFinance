<!-- src/components/ui/views/BasePercentageSlider.vue -->
<!-- Обновите часть template в BasePercentageSlider.vue -->
<template>
  <div class="base-percentage-slider" :class="[customClass, { 'disabled': disabled }]">
    <!-- Левая сторона с информацией -->
    <div class="side side-1">
      <div class="side-content">
        <slot name="side-1">
          <span class="side-name">{{ sides && sides.length > 0 ? sides[0].name : 'Left' }}</span>
          <span class="side-percentage">{{ percentageValues[0] }}%</span>
          <span class="side-value">{{ formattedValues[0] }}</span>
        </slot>
      </div>
    </div>
    
    <!-- Слайдер -->
    <div class="slider-container">
      <input 
        type="range" 
        class="slider" 
        :value="modelValue"
        :disabled="disabled"
        @input="updateValue"
        :min="min" 
        :max="max" 
        :step="step"
        :style="sliderStyle"
      />
      <slot name="slider-thumb">
        <div class="slider-thumb"></div>
      </slot>
    </div>
    
    <!-- Правая сторона с информацией -->
    <div class="side side-2">
      <div class="side-content">
        <slot name="side-2">
          <span class="side-name">{{ sides && sides.length > 1 ? sides[1].name : 'Right' }}</span>
          <span class="side-percentage">{{ percentageValues[1] }}%</span>
          <span class="side-value">{{ formattedValues[1] }}</span>
        </slot>
      </div>
    </div>
  </div>
</template>
  
<script setup lang="ts">
import { computed } from 'vue';

// Определение типа для сторон слайдера
interface SliderSide {
  name: string;
  id: string;
  color?: string;
  [key: string]: any; // Для дополнительных свойств
}

// Определение интерфейса для формирования значений
interface ValueFormatter {
  (value: number, side: SliderSide): string;
}

const props = defineProps({
  // Основные данные
  sides: {
    type: Array as () => SliderSide[],
    default: () => [
      { name: 'Left', id: 'left' },
      { name: 'Right', id: 'right' }
    ]
  },
  modelValue: {
    type: Number,
    required: true
  },
  
  // Добавляем проп для блокировки слайдера
  disabled: {
    type: Boolean,
    default: false
  },
  
  // Параметры слайдера
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: [Number, String],
    default: 1
  },
  
  // Значения и форматирование
  totalValue: {
    type: Number,
    default: 0
  },
  valuePrefix: {
    type: String,
    default: ''
  },
  valueSuffix: {
    type: String,
    default: ''
  },
  valueDecimals: {
    type: Number,
    default: 2
  },
  valueFormatter: {
    type: Function as () => ValueFormatter,
    default: null
  },
  
  // Стили
  leftColor: {
    type: String,
    default: ''
  },
  rightColor: {
    type: String,
    default: ''
  },
  customClass: {
    type: String,
    default: ''
  },
  customSliderStyle: {
    type: Object,
    default: () => ({})
  }
});
  
  const emit = defineEmits(['update:modelValue', 'change']);
  
  // Рассчитываем проценты для обеих сторон
  const percentageValues = computed(() => {
    return [props.modelValue, props.max - props.modelValue];
  });
  
  // Вычисляем натуральные значения на основе процентов и общей суммы
  const actualValues = computed(() => {
    const total = props.totalValue;
    const ratio = props.modelValue / props.max;
    return [
      total * ratio,
      total * (1 - ratio)
    ];
  });
  
  // Форматируем значения в зависимости от настроек
  const formattedValues = computed(() => {
    if (typeof props.valueFormatter === 'function') {
      return [
        props.valueFormatter(actualValues.value[0], props.sides[0] || {}),
        props.valueFormatter(actualValues.value[1], props.sides[1] || {})
      ];
    }
    
    return actualValues.value.map(value => {
      const formattedValue = value.toFixed(props.valueDecimals);
      return `${props.valuePrefix}${formattedValue}${props.valueSuffix}`;
    });
  });
  
  // Создаем стиль для слайдера (градиент)
  const sliderStyle = computed(() => {
    const percentage = (props.modelValue / props.max) * 100;
    
    // Используем цвета из props или из объектов сторон
    const leftColor = props.leftColor || 
      (props.sides[0] && props.sides[0].color ? props.sides[0].color : 'var(--color-success)');
    
    const rightColor = props.rightColor || 
      (props.sides[1] && props.sides[1].color ? props.sides[1].color : 'var(--color-1)');
    
    const gradientStyle = {
      background: `linear-gradient(to right, ${leftColor} 0%, ${leftColor} ${percentage}%, ${rightColor} ${percentage}%, ${rightColor} 100%)`
    };
    
    // Объединяем стили
    return {
      ...gradientStyle,
      ...props.customSliderStyle
    };
  });
  
  // Обновляем значение при изменении слайдера
  const updateValue = (event) => {
    const newValue = parseFloat(event.target.value);
    emit('update:modelValue', newValue);
    emit('change', newValue);
  };
  </script>
  
  <style scoped>
.base-percentage-slider {
  padding: var(--spacing-sm) var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.side {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.side-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.side-name {
  font-size: var(--font-super-small-size);
  font-weight: 600;
  line-height: var(--font-super-small-line-height);
}

.side-percentage {
  font-size: var(--font-small-size);
  font-weight: 400;
  line-height: var(--font-small-line-height);
}

.side-value {
  font-size: var(--font-small-size);
  font-weight: 400;
  line-height: var(--font-small-line-height);
  margin-top: 2px;
}

/* Удаляем стили, устанавливающие цвета сторон, 
   так как они будут контролироваться через пропсы от родителя */
/*
.side-2 .side-name,
.side-2 .side-percentage,
.side-2 .side-value {
  color: var(--color-1);
}
*/

.slider-container {
  position: relative;
  width: 100%;
  margin: 0 var(--spacing-sm);
}

.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  outline: none;
  opacity: 0.7;
  transition: opacity var(--transition-speed) var(--transition-fn), 
              background var(--transition-speed) var(--transition-fn);
}

.slider:disabled {
  opacity: 0.5;
  pointer-events: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 19px;
  height: 19px;
  background: var(--text-subheader);
  border-radius: 50%;
  cursor: pointer;
}

.slider:disabled::-webkit-slider-thumb {
  opacity: 0.3;
}

.slider::-moz-range-thumb {
  width: 19px;
  height: 19px;
  background: var(--text-subheader);
  border-radius: 50%;
  cursor: pointer;
}

.slider:disabled::-moz-range-thumb {
  opacity: 0.3;
}
</style>