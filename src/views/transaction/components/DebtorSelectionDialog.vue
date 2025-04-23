<!-- src/components/transactions/DebtorSelectionDialog.vue -->
<template>
    <div class="dialog-overlay" v-if="modelValue" @click="handleBackdropClick">
      <div class="dialog-container" @click.stop>
        <div class="dialog-header">
          <h3>Выбор должника</h3>
          <button class="close-button" @click="handleCancel">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="dialog-content">
          <p>Выберите, кто должен вернуть деньги за эту транзакцию:</p>
          
          <div class="user-list">
            <div 
              v-for="user in users" 
              :key="user.id"
              class="user-item"
              :class="{ 'selected': selectedUser === user.id }"
              @click="selectUser(user.id)"
            >
              <div class="user-avatar" :style="{ backgroundColor: user.color || '#53B794' }">
                {{ user.name.charAt(0) }}
              </div>
              <div class="user-name">{{ user.name }}</div>
              <div class="user-check" v-if="selectedUser === user.id">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div class="dialog-footer">
          <button class="btn-cancel" @click="handleCancel">Отмена</button>
          <button 
            class="btn-confirm" 
            @click="handleConfirm"
            :disabled="!selectedUser"
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true
    },
    users: {
      type: Array,
      required: true
    },
    currentUserId: {
      type: String,
      required: true
    }
  });
  
  const emit = defineEmits(['update:modelValue', 'select', 'cancel']);
  
  // Состояние выбранного пользователя
  const selectedUser = ref('');
  
  // При открытии диалога, предварительно выбираем другого пользователя
  // (не того, кто создает транзакцию)
  const initSelection = () => {
    const otherUser = props.users.find(user => user.id !== props.currentUserId);
    if (otherUser) {
      selectedUser.value = otherUser.id;
    }
  };
  
  // Вызываем инициализацию при изменении значения модели
  watch(() => props.modelValue, (newValue) => {
    if (newValue) {
      initSelection();
    }
  }, { immediate: true });
  
  const selectUser = (userId) => {
    selectedUser.value = userId;
  };
  
  const handleConfirm = () => {
    if (!selectedUser.value) return;
    
    emit('select', selectedUser.value);
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
  
  .user-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .user-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background-color: var(--bg-dropdown, #2a2a2a);
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .user-item:hover {
    background-color: var(--bg-field-dark, #3a3a3a);
  }
  
  .user-item.selected {
    background-color: rgba(33, 150, 243, 0.2);
    border: 1px solid var(--accent-color, #2196F3);
  }
  
  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: var(--color-success, #53B794);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    margin-right: 12px;
  }
  
  .user-name {
    flex: 1;
    color: var(--text-contrast, white);
    font-size: 16px;
  }
  
  .user-check {
    color: var(--accent-color, #2196F3);
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
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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