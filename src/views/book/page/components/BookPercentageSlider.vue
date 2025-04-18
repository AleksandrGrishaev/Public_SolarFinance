<!-- src/views/book/page/components/BookPercentageSlider.vue -->
<template>
    <div class="book-percentage-slider" :class="customClass">
      <!-- Слайдер -->
      <div class="slider-container">
        <input 
          type="range" 
          class="slider" 
          :value="modelValue"
          @input="updateValue"
          :min="min" 
          :max="max" 
          :step="step"
          :style="sliderStyle"
        />
      </div>
      
      <!-- Информация о распределении -->
      <div class="distribution-info">
        <!-- Левая сторона -->
        <div class="side side-1">
          <span class="side-name">{{ sides && sides.length > 0 ? sides[0].name : 'Left' }}</span>
          <span class="side-percentage">{{ percentageValues[0] }}%</span>
        </div>
        
        <!-- Правая сторона -->
        <div class="side side-2">
          <span class="side-name">{{ sides && sides.length > 1 ? sides[1].name : 'Right' }}</span>
          <span class="side-percentage">{{ percentageValues[1] }}%</span>
        </div>
      </div>
      
      <!-- Отображение значений -->
      <div class="values-display" v-if="showValues">
        <span class="value-left">{{ formattedValues[0] }}</span>
        <span class="value-right">{{ formattedValues[1] }}</span>
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
    
    // Отображение значений
    showValues: {
      type: Boolean,
      default: true
    },
    
    // Стили
    leftColor: {
      type: String,
      default: '#555555'
    },
    rightColor: {
      type: String,
      default: '#4F9FC8'
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
    
    // Используем цвета из props
    const leftColor = props.leftColor;
    const rightColor = props.rightColor;
    
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
  .book-percentage-slider {
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
    margin: var(--spacing-md) 0;
  }
  
  .slider-container {
    width: 100%;
    position: relative;
    margin-bottom: var(--spacing-sm);
  }
  
  .slider {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    outline: none;
    border-radius: 3px;
    transition: opacity var(--transition-speed) var(--transition-fn), 
                background var(--transition-speed) var(--transition-fn);
  }
  
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: var(--text-usual);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
  
  .slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: var(--text-usual);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
  
  .distribution-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--spacing-xs);
  }
  
  .side {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .side-1 {
    align-items: flex-start;
  }
  
  .side-2 {
    align-items: flex-end;
  }
  
  .side-name {
    font-size: var(--font-body-size);
    font-weight: 500;
    color: var(--text-usual);
  }
  
  .side-percentage {
    font-size: var(--font-small-size);
    color: var(--text-grey);
  }
  
  .values-display {
    display: flex;
    justify-content: space-between;
    margin-top: var(--spacing-xs);
  }
  
  .value-left, .value-right {
    font-size: var(--font-small-size);
    color: var(--text-grey);
  }
  </style>