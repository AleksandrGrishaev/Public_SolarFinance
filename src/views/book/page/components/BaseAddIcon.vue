<!-- src/components/ui/icons/BaseAddIcon.vue -->
<template>
    <div 
      class="base-add-icon"
      :class="{ 
        'interactive': interactive,
        [customClass]: customClass
      }"
      :style="{
        width: `${size}px`,
        height: `${size}px`
      }"
      @click="handleClick"
    >
    <svg 
  :width="size - 4" 
  :height="size - 4" 
  viewBox="0 0 50 50" 
  fill="none" 
  xmlns="http://www.w3.org/2000/svg"
>
        <rect 
          x="0.5" 
          y="0.5" 
          :width="49" 
          :height="49" 
          rx="24.5" 
          :stroke="color" 
          stroke-dasharray="4 4"
        />
        <path 
          d="M24.2364 29.5V20.5H25.7636V29.5H24.2364ZM20.5 25.7636V24.2364H29.5V25.7636H20.5Z" 
          :fill="color"
        />
      </svg>
    </div>
  </template>
  
  <script setup lang="ts">
  interface ClickEvent {
    event: MouseEvent;
  }
  
  const props = defineProps({
    // Размеры иконки
    size: {
      type: Number,
      default: 50
    },
    
    // Цвет
    color: {
      type: String,
      default: 'var(--bg-field-light, #949496)'
    },
    
    // Интерактивность
    interactive: {
      type: Boolean,
      default: true
    },
    
    // Дополнительные стили
    customClass: {
      type: String,
      default: ''
    }
  });
  
  const emit = defineEmits<{
    (e: 'click', payload: ClickEvent): void
  }>();
  
  // Обработчик клика
  const handleClick = (event: MouseEvent) => {
    if (!props.interactive) return;
    
    emit('click', { event });
  };
  </script>
  
  <style scoped>
  .base-add-icon {
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: opacity var(--transition-speed, 0.2s) var(--transition-fn, ease);
    opacity: 0.8;
  }
  
  .interactive {
    cursor: pointer;
  }
  
  .interactive:hover {
    opacity: var(--state-hover-opacity, 0.8);
  }
  
  .interactive:active {
    opacity: var(--state-active-opacity, 0.6);
  }
  </style>