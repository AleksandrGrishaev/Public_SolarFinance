<!-- src/components/organisms/popups/BaseFloatingPopup.vue -->
<template>
  <Teleport to="body">
    <Transition name="popup-fade">
      <div v-if="modelValue" class="base-floating-popup">
        <div 
          class="base-floating-popup__backdrop" 
          @click="onBackdropClick"
        ></div>
        <div 
            v-if="modelValue"
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
    maxWidth: {
      type: [String, Number],
      default: null
    },
    maxHeight: {
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
      
      if (props.maxWidth) {
        style.maxWidth = typeof props.maxWidth === 'number'
          ? `${props.maxWidth}px`
          : props.maxWidth;
      }
      
      if (props.maxHeight) {
        style.maxHeight = typeof props.maxHeight === 'number'
          ? `${props.maxHeight}px`
          : props.maxHeight;
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
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  pointer-events: none;
}

.base-floating-popup__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(4px);
  background-color: rgba(0, 0, 0, 0.2); /* Lighter background for less darkening */
  pointer-events: auto;
}

.base-floating-popup__content {
  position: relative;
  z-index: 1001;
  pointer-events: auto;
  border-radius: var(--border-radius-lg, 16px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden; 
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  padding: 0 16px;
}

/* Position variants */
.base-floating-popup__content.top {
  align-self: center;
  width: 100%;
  margin-top: 20px;
}

.base-floating-popup__content.right {
  margin-right: 20px;
  align-self: flex-end;
  height: 100%;
  margin-left: auto;
}

.base-floating-popup__content.bottom {
  align-self: center;
  width: 100%;
  margin-top: auto;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.base-floating-popup__content.left {
  margin-left: 20px;
  align-self: flex-start;
  height: 100%;
  margin-right: auto;
}

.base-floating-popup__content.center {
  align-self: center;
  margin: auto;
}

/* Transitions */
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity 0.3s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}

/* Slide up transition for bottom position */
.popup-slide-enter-active,
.popup-slide-leave-active {
  transition: transform 0.3s ease;
}

.popup-slide-enter-from,
.popup-slide-leave-to {
  transform: translateY(100%);
}

/* Ensure proper positioning within the fixed container */
.popup-slide-enter-to,
.popup-slide-leave-from {
  transform: translateY(0);
}
</style>