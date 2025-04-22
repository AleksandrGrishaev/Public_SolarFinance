<!-- src/components/ui/icons/BaseIconComponent.vue -->
<template>
    <div class="icon-big" :style="containerStyle">
      <!-- For component icons (from @tabler/icons-vue) -->
      <component 
        v-if="icon" 
        :is="icon" 
        :size="calculatedIconSize" 
        class="icon-component"
        :style="iconStyle"
      />
      <!-- For image-based icons -->
      <img 
        v-else-if="src" 
        class="icon-box" 
        :src="src" 
        :alt="alt" 
        :style="iconStyle"
      />
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, computed } from 'vue';
  
  export default defineComponent({
    name: 'BaseIconComponent',
    props: {
      // Component props
      icon: {
        type: [Object, Function],
        default: null
      },
      // Image props
      src: {
        type: String,
        default: ''
      },
      alt: {
        type: String,
        default: 'Icon'
      },
      // Shared props
      size: {
        type: [Number, String],
        default: 24
      },
      background: {
        type: String,
        default: 'transparent'
      },
      color: {
        type: String,
        default: 'currentColor'
      },
      borderRadius: {
        type: String,
        default: '50%'
      }
    },
    setup(props) {
      // Определяем размер контейнера
      const iconSize = computed(() => {
        // If size is a number, convert to pixels
        if (typeof props.size === 'number') {
          return `${props.size}px`;
        }
        return props.size;
      });
      
      // Определяем уменьшенный размер иконки
      const calculatedIconSize = computed(() => {
        const sizeValue = typeof props.size === 'number' ? props.size : parseInt(props.size);
        // Уменьшаем иконку до 70% от размера контейнера
        return Math.floor(sizeValue * 0.7);
      });
      
      const containerStyle = computed(() => {
        return {
          width: iconSize.value,
          height: iconSize.value,
          borderRadius: props.borderRadius
        };
      });
      
      const iconStyle = computed(() => {
        return {
          backgroundColor: props.background,
          color: props.color,
          borderRadius: props.borderRadius
        };
      });
      
      return {
        iconSize,
        calculatedIconSize,
        containerStyle,
        iconStyle
      };
    }
  });
  </script>
  
  <style scoped>
  .icon-big {
    display: flex;
    flex-direction: row;
    gap: 0px;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }
  
  .icon-component {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 12px;
    box-sizing: border-box;
  }
  
  .icon-box {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 100%;
    height: 100%;
    position: relative;
    overflow: visible;
    aspect-ratio: 1;
    border: 1px solid var(--icon-border, var(--border-color));
  }
  </style>