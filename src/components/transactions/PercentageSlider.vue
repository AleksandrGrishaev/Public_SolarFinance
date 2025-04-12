<!-- /Users/peaker/dev/solar-finance/src/components/transactions/PercentageSlider.vue -->
<template>
    <div class="percentage-share-element">
      <div class="owner owner-1">
        <div class="owner-percentage">
          <span class="owner-name">{{ owners[0].name }}</span>
          <span class="percentage">{{ percentageValues[0] }}%</span>
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
        />
        <div class="slider-thumb"></div>
      </div>
      
      <div class="owner owner-2">
        <div class="owner-percentage">
          <span class="owner-name">{{ owners[1].name }}</span>
          <span class="percentage">{{ percentageValues[1] }}%</span>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  
  const props = defineProps({
    owners: {
      type: Array,
      required: true
    },
    modelValue: {
      type: Number,
      required: true
    }
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  const percentageValues = computed(() => {
    return [props.modelValue, 100 - props.modelValue];
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
  
  .owner-2 .owner-name,
  .owner-2 .percentage {
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
    background: linear-gradient(to right, white 0%, white 50%, #6499A7 50%, #6499A7 100%);
    outline: none;
    opacity: 0.7;
    transition: opacity .2s;
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