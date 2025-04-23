<!-- src/components/transactions/DistributionConfirmDialog.vue -->
<template>
    <div class="dialog-overlay" v-if="modelValue" @click="handleBackdropClick">
      <div class="dialog-container" @click.stop>
        <div class="dialog-header">
          <h3>{{ title }}</h3>
          <button class="close-button" @click="handleCancel">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="dialog-content">
          <p>{{ message }}</p>
          
          <div class="distribution-preview">
            <BasePercentageSlider
              :sides="sides"
              :modelValue="currentDistribution"
              :totalValue="previewAmount"
              :valueSuffix="currency"
              disabled
            />
            
            <div class="arrow-down">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M19 12l-7 7-7-7"/>
              </svg>
            </div>
            
            <BasePercentageSlider
              :sides="sides"
              :modelValue="standardDistribution"
              :totalValue="previewAmount"
              :valueSuffix="currency"
              disabled
            />
          </div>
        </div>
        
        <div class="dialog-footer">
          <button class="btn-cancel" @click="handleCancel">{{ cancelText }}</button>
          <button class="btn-confirm" @click="handleConfirm">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  import BasePercentageSlider from '@/components/ui/views/BasePercentageSlider.vue';
  
  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: 'Подтверждение'
    },
    message: {
      type: String,
      required: true
    },
    confirmText: {
      type: String,
      default: 'Подтвердить'
    },
    cancelText: {
      type: String,
      default: 'Отмена'
    },
    currentDistribution: {
      type: Number,
      default: 50
    },
    standardDistribution: {
      type: Number,
      default: 50
    },
    sides: {
      type: Array,
      default: () => [
        { name: 'User 1', id: 'user1' },
        { name: 'User 2', id: 'user2' }
      ]
    },
    previewAmount: {
      type: Number,
      default: 1000
    },
    currency: {
      type: String,
      default: '₽'
    }
  });
  
  const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);
  
  const handleConfirm = () => {
    emit('confirm');
    emit('update:modelValue', false);
  };
  
  const handleCancel = () => {
    emit('cancel');
    emit('update:modelValue', false);
  };
  
  const handleBackdropClick = () => {
    emit('cancel');
    emit('update:modelValue', false);
  };
  </script>
  
  <style scoped>
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .dialog-container {
    background-color: var(--bg-contrast, #1a1a1a);
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    padding: 16px;
  }
  
  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .dialog-header h3 {
    margin: 0;
    color: var(--text-contrast, white);
    font-size: 18px;
  }
  
  .close-button {
    background: transparent;
    border: none;
    color: var(--text-usual, #e0e0e0);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .dialog-content {
    margin-bottom: 24px;
  }
  
  .dialog-content p {
    margin: 0 0 16px 0;
    color: var(--text-usual, #e0e0e0);
    font-size: 14px;
    line-height: 1.5;
  }
  
  .distribution-preview {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 20px;
  }
  
  .arrow-down {
    display: flex;
    justify-content: center;
    color: var(--text-grey, #949496);
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  
  button {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: none;
  }
  
  .btn-cancel {
    background-color: transparent;
    color: var(--text-usual, #e0e0e0);
  }
  
  .btn-confirm {
    background-color: var(--accent-color, #2196F3);
    color: white;
  }
  </style>