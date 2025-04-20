<!-- src/components/transactions/NumberKeypad.vue -->
<template>
  <div class="keyboard">
    <div class="input">
      <div class="numbers">
        <div class="number-row">
          <div class="number-key" @click="!isLoading && $emit('input', '1')" :class="{ 'disabled': isLoading }">1</div>
          <div class="number-key" @click="!isLoading && $emit('input', '2')" :class="{ 'disabled': isLoading }">2</div>
          <div class="number-key" @click="!isLoading && $emit('input', '3')" :class="{ 'disabled': isLoading }">3</div>
        </div>
        <div class="number-row">
          <div class="number-key" @click="!isLoading && $emit('input', '4')" :class="{ 'disabled': isLoading }">4</div>
          <div class="number-key" @click="!isLoading && $emit('input', '5')" :class="{ 'disabled': isLoading }">5</div>
          <div class="number-key" @click="!isLoading && $emit('input', '6')" :class="{ 'disabled': isLoading }">6</div>
        </div>
        <div class="number-row">
          <div class="number-key" @click="!isLoading && $emit('input', '7')" :class="{ 'disabled': isLoading }">7</div>
          <div class="number-key" @click="!isLoading && $emit('input', '8')" :class="{ 'disabled': isLoading }">8</div>
          <div class="number-key" @click="!isLoading && $emit('input', '9')" :class="{ 'disabled': isLoading }">9</div>
        </div>
        <div class="number-row">
          <div class="number-key" @click="!isLoading && $emit('input', '.')" :class="{ 'disabled': isLoading }">.</div>
          <div class="number-key" @click="!isLoading && $emit('input', '0')" :class="{ 'disabled': isLoading }">0</div>
          <div class="number-key" @click="!isLoading && $emit('input', '000')" :class="{ 'disabled': isLoading }">000</div>
        </div>
      </div>
      
      <div class="button-line">
        <div 
          class="add-button" 
          @click="!isLoading && $emit('add')"
          :class="{ 'loading': isLoading }"
        >
          <div class="add-text">{{ isLoading ? 'Сохранение...' : 'Add' }}</div>
        </div>
        
        <div class="erase-button" @click="!isLoading && $emit('delete')" :class="{ 'disabled': isLoading }">
          <IconBackspace :size="42" color="#A44942" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconBackspace } from '@tabler/icons-vue';

defineProps({
  isLoading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['input', 'add', 'delete']);
</script>

<style scoped>
.keyboard {
  width: 100%;
  padding: 13px 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}

.input {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
}

.numbers {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.number-row {
  width: 100%;
  height: 48px;
  padding: 8px 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.number-key {
  color: white;
  font-size: 40px;
  font-weight: 400;
  line-height: 48px;
  cursor: pointer;
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.2s ease;
}

.number-key.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-line {
  width: 100%;
  height: 56px;
  padding: 0 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 10px;
}

.add-button {
  flex: 1;
  height: 30px;
  padding: 10px;
  background: #53B794;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease, opacity 0.2s ease;
}

.add-button.loading {
  background: #3a8069;
  cursor: not-allowed;
  opacity: 0.8;
}

.add-text {
  color: white;
  font-size: 20px;
  font-weight: 500;
  line-height: 24px;
}

.erase-button {
  width: 42px;
  height: 42px;
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.2s ease;
}

.erase-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>