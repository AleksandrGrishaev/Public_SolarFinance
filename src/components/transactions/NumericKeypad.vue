<template>
    <div class="numeric-keypad">
      <div class="keypad-grid">
        <!-- Цифровые клавиши -->
        <button 
          v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]" 
          :key="num" 
          class="keypad-key number-key"
          @click="handleNumberPress(num.toString())"
        >
          {{ num }}
        </button>
        
        <!-- Десятичная точка -->
        <button class="keypad-key" @click="handleNumberPress('.')">
          .
        </button>
        
        <!-- Ноль -->
        <button class="keypad-key number-key" @click="handleNumberPress('0')">
          0
        </button>
        
        <!-- Тройной ноль -->
        <button class="keypad-key" @click="handleNumberPress('000')">
          000
        </button>
      </div>
  
      <div class="action-buttons">
        <!-- Кнопка добавления транзакции -->
        <button class="add-button" @click="$emit('submit')">
          Add
        </button>
        
        <!-- Кнопка удаления -->
        <button class="delete-button" @click="$emit('delete')">
          <n-icon size="22">
            <icon-backspace />
          </n-icon>
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { NIcon } from 'naive-ui'
  import { IconBackspace } from '@tabler/icons-vue'
  
  const emit = defineEmits(['input', 'delete', 'submit'])
  
  const handleNumberPress = (value) => {
    emit('input', value)
  }
  </script>
  
  <style scoped>
  .numeric-keypad {
    margin-top: auto;
    padding-bottom: 16px;
  }
  
  .keypad-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 16px;
  }
  
  .keypad-key {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 56px;
    background: transparent;
    border: none;
    border-radius: 8px;
    font-size: 24px;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .keypad-key:active {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .action-buttons {
    display: flex;
    gap: 16px;
    margin-top: 16px;
  }
  
  .add-button {
    flex: 1;
    height: 48px;
    background-color: #4CAF50;
    border: none;
    border-radius: 16px;
    color: white;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .add-button:hover {
    background-color: #43A047;
  }
  
  .delete-button {
    width: 48px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 87, 34, 0.2);
    border: 1px solid #FF5722;
    border-radius: 50%;
    color: #FF5722;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .delete-button:hover {
    background-color: rgba(255, 87, 34, 0.3);
  }
  </style>