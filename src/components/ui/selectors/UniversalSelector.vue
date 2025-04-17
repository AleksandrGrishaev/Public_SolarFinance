<!-- src/components/ui/selectors/UniversalSelector.vue -->
<template>
    <div class="selector-element">
      <div class="area">
        <!-- Иконка слева -->
        <div class="icon" v-if="icon || $slots.icon">
          <slot name="icon">
            <component v-if="typeof icon === 'object'" :is="icon" size="20" stroke-width="1.5" color="white" />
            <img v-else-if="typeof icon === 'string'" :src="icon" alt="Icon" />
          </slot>
        </div>
        
        <!-- Основная область выбора -->
        <div class="items-selector">
          <div
            v-for="item in items"
            :key="item.id || item.value"
            class="selector-item"
            :class="{ 'selected': modelValue === (item.id || item.value) }"
            @click="$emit('update:modelValue', item.id || item.value)"
          >
            {{ item.name || item.label }}
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  
  const props = defineProps({
    // Значение модели (выбранный элемент)
    modelValue: {
      type: [String, Number],
      required: true
    },
    // Массив элементов для выбора
    items: {
      type: Array,
      required: true,
      default: () => []
    },
    // Иконка (строка с URL или компонент)
    icon: {
      type: [String, Object],
      default: null
    },
    // Цвет фона области
    backgroundColor: {
      type: String,
      default: '#46484A'
    },
    // Цвет фона выбранного элемента
    selectedColor: {
      type: String,
      default: '#000000'
    }
  });
  
  defineEmits(['update:modelValue']);
  
  // Проверка наличия элементов 
  const hasItems = computed(() => {
    return Array.isArray(props.items) && props.items.length > 0;
  });
  </script>
  
  <style scoped>
  .selector-element {
    display: flex;
    justify-content: center;
    width: 100%;
  }
  
  .area {
    padding: 6px 10px 6px 13px;
    background: v-bind('backgroundColor');
    border-radius: 28px;
    display: inline-flex;
    justify-content: flex-start;
    align-items: center;
    gap: 6px;
    width: auto;
    max-width: 100%;
    box-sizing: border-box;
    overflow-x: auto;
    scrollbar-width: none; /* Скрываем скроллбар для Firefox */
    -ms-overflow-style: none; /* Скрываем скроллбар для IE и Edge */
  }
  
  .area::-webkit-scrollbar {
    display: none; /* Скрываем скроллбар для Chrome, Safari и Opera */
  }
  
  .icon {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .items-selector {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 2px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    flex-grow: 1;
  }
  
  .items-selector::-webkit-scrollbar {
    display: none;
  }
  
  .selector-item {
    height: 28px;
    padding: 0 16px;
    background: v-bind('backgroundColor');
    border-radius: 34px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    overflow: hidden;
    cursor: pointer;
    flex-shrink: 0;
    
    /* Текстовые стили */
    color: white;
    font-size: 12px;
    font-family: Inter, sans-serif;
    font-weight: 400;
    line-height: 16px;
    word-wrap: break-word;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: background-color 0.2s ease;
  }
  
  .selector-item.selected {
    background: v-bind('selectedColor');
  }
  </style>