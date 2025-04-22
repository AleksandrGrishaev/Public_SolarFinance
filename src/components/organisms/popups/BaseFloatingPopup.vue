<!-- src/components/organisms/popups/BaseFloatingPopup.vue -->
<template>
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="modelValue" class="base-floating-popup">
          <div 
            class="base-floating-popup__backdrop" 
            @click="onBackdropClick"
          ></div>
          <div 
            class="base-floating-popup__content"
            :class="[position]"
            :style="contentStyle"
          >
            <slot></slot>
          </div>
        </div>
      </Transition>
    </Teleport>
  </template>
  
  <script lang="ts">
  import { defineComponent, computed, PropType } from 'vue';
  
  type PopupPosition = 'top' | 'right' | 'bottom' | 'left' | 'center';
  
  export default defineComponent({
    name: 'BaseFloatingPopup',
    props: {
      modelValue: {
        type: Boolean,
        default: false
      },
      position: {
        type: String as PropType<PopupPosition>,
        default: 'center',
        validator: (value: string) => 
          ['top', 'right', 'bottom', 'left', 'center'].includes(value)
      },
      width: {
        type: [String, Number],
        default: null
      },
      height: {
        type: [String, Number],
        default: null
      },
      closeOnClickOutside: {
        type: Boolean,
        default: true
      }
    },
    emits: ['update:modelValue', 'close'],
    setup(props, { emit }) {
      const contentStyle = computed(() => {
        const style: Record<string, string> = {};
        
        if (props.width) {
          style.width = typeof props.width === 'number' 
            ? `${props.width}px` 
            : props.width;
        }
        
        if (props.height) {
          style.height = typeof props.height === 'number' 
            ? `${props.height}px` 
            : props.height;
        }
        
        return style;
      });
      
      const onBackdropClick = () => {
        if (props.closeOnClickOutside) {
          emit('update:modelValue', false);
          emit('close');
        }
      };
      
      return {
        contentStyle,
        onBackdropClick
      };
    }
  });
  </script>
  
  <style scoped>
  .base-floating-popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .base-floating-popup__backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
  }
  
  .base-floating-popup__content {
    position: relative;
    z-index: 1001;
    background-color: var(--bg-popup, var(--bg-primary));
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
    max-width: 90%;
    max-height: 90%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .base-floating-popup__content.top {
    margin-top: var(--spacing-lg);
    align-self: flex-start;
  }
  
  .base-floating-popup__content.right {
    margin-right: var(--spacing-lg);
    align-self: center;
    margin-left: auto;
  }
  
  .base-floating-popup__content.bottom {
    margin-bottom: var(--spacing-lg);
    align-self: flex-end;
  }
  
  .base-floating-popup__content.left {
    margin-left: var(--spacing-lg);
    align-self: center;
    margin-right: auto;
  }
  
  .base-floating-popup__content.center {
    align-self: center;
  }
  
  /* Transitions */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>