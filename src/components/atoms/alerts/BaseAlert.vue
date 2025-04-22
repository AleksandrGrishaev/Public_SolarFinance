<!-- src/components/atoms/alerts/BaseAlert.vue -->
<template>
    <Transition name="fade">
      <div 
        v-if="modelValue" 
        class="base-alert"
        :class="[`base-alert--${type}`, { 'with-icon': showIcon }]"
        @click="handleClick"
      >
        <div v-if="showIcon" class="base-alert__icon">
          <component :is="iconComponent" size="20" />
        </div>
        <div class="base-alert__content">
          <div v-if="title" class="base-alert__title">{{ title }}</div>
          <div class="base-alert__message">{{ message }}</div>
        </div>
        <div v-if="closable" class="base-alert__close" @click.stop="handleClose">
          <IconX size="16" />
        </div>
      </div>
    </Transition>
  </template>
  
  <script setup lang="ts">
  import { computed, onMounted, onUnmounted } from 'vue';
  import { IconCheck, IconInfoCircle, IconAlertTriangle, IconX } from '@tabler/icons-vue';
  
  const props = defineProps({
    /**
     * Controls visibility
     */
    modelValue: {
      type: Boolean,
      default: false
    },
    /**
     * Alert type
     */
    type: {
      type: String,
      default: 'info',
      validator: (value: string) => ['success', 'info', 'warning', 'error'].includes(value)
    },
    /**
     * Alert title
     */
    title: {
      type: String,
      default: ''
    },
    /**
     * Alert message
     */
    message: {
      type: String,
      required: true
    },
    /**
     * Auto close after duration (ms), 0 means don't auto close
     */
    duration: {
      type: Number,
      default: 3000
    },
    /**
     * Show close button
     */
    closable: {
      type: Boolean,
      default: true
    },
    /**
     * Show icon
     */
    showIcon: {
      type: Boolean,
      default: true
    },
    /**
     * Is this alert clickable (will emit an event)
     */
    clickable: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['update:modelValue', 'close', 'click']);
  
  let closeTimer: number | null = null;
  
  // Get the appropriate icon component based on type
  const iconComponent = computed(() => {
    switch (props.type) {
      case 'success':
        return IconCheck;
      case 'warning':
        return IconAlertTriangle;
      case 'error':
        return IconAlertTriangle;
      case 'info':
      default:
        return IconInfoCircle;
    }
  });
  
  // Start autoclose timer if duration > 0
  onMounted(() => {
    if (props.duration > 0 && props.modelValue) {
      startCloseTimer();
    }
  });
  
  onUnmounted(() => {
    if (closeTimer) {
      clearTimeout(closeTimer);
    }
  });
  
  const startCloseTimer = () => {
    if (closeTimer) {
      clearTimeout(closeTimer);
    }
    
    if (props.duration > 0) {
      closeTimer = window.setTimeout(() => {
        emit('update:modelValue', false);
        emit('close');
      }, props.duration);
    }
  };
  
  const handleClose = () => {
    emit('update:modelValue', false);
    emit('close');
  };
  
  const handleClick = () => {
    if (props.clickable) {
      emit('click');
    }
  };
  </script>
  
  <style scoped>
  .base-alert {
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--border-radius-md);
    display: flex;
    align-items: flex-start;
    margin-bottom: var(--spacing-md);
    background-color: var(--bg-secondary);
    border-left: 3px solid;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(8px);
    transition: all 0.3s ease;
    max-width: 100%;
    position: relative;
    overflow: hidden;
  }
  
  .base-alert.with-icon {
    padding-left: var(--spacing-sm);
  }
  
  .base-alert__icon {
    margin-right: var(--spacing-sm);
    padding: var(--spacing-xs);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .base-alert__content {
    flex: 1;
    overflow: hidden;
  }
  
  .base-alert__title {
    font-weight: var(--font-weight-bold);
    margin-bottom: var(--spacing-xs);
    color: var(--text-header);
  }
  
  .base-alert__message {
    color: var(--text-usual);
    font-size: var(--font-size-sm);
    max-width: 100%;
    word-wrap: break-word;
  }
  
  .base-alert__close {
    margin-left: var(--spacing-sm);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }
  
  .base-alert__close:hover {
    opacity: 1;
  }
  
  /* Alert types */
  .base-alert--success {
    border-left-color: var(--maincolor-colorsucces, #53b794);
  }
  .base-alert--success .base-alert__icon {
    color: var(--maincolor-colorsucces, #53b794);
  }
  
  .base-alert--info {
    border-left-color: var(--accent-color, #3a86ff);
  }
  .base-alert--info .base-alert__icon {
    color: var(--accent-color, #3a86ff);
  }
  
  .base-alert--warning {
    border-left-color: var(--color-warning, #f9b115);
  }
  .base-alert--warning .base-alert__icon {
    color: var(--color-warning, #f9b115);
  }
  
  .base-alert--error {
    border-left-color: var(--maincolor-colorwarrning, #a44942);
  }
  .base-alert--error .base-alert__icon {
    color: var(--maincolor-colorwarrning, #a44942);
  }
  
  /* Transitions */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  
  .fade-enter-from {
    opacity: 0;
    transform: translateY(-20px);
  }
  
  .fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
  }
  </style>