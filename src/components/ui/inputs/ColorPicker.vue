<!-- src/components/ui/inputs/ColorPicker.vue -->
<template>
    <div class="color-picker-container">
      <div class="color-preview" @click="openColorPicker">
        <n-color-picker 
          v-model:value="colorValue" 
          :show="showPicker"
          :show-alpha="false"
          :actions="['confirm']"
          @confirm="handleConfirm"
          @close="showPicker = false"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue';
  import { NColorPicker } from 'naive-ui';
  
  const props = defineProps({
    modelValue: {
      type: String,
      default: '#949496'
    }
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  const colorValue = ref(props.modelValue);
  const showPicker = ref(false);
  
  // Sync with v-model
  watch(() => props.modelValue, (newVal) => {
    colorValue.value = newVal;
  });
  
  watch(() => colorValue.value, (newVal) => {
    emit('update:modelValue', newVal);
  });
  
  const openColorPicker = () => {
    showPicker.value = true;
  };
  
  const handleConfirm = () => {
    showPicker.value = false;
    emit('update:modelValue', colorValue.value);
  };
  </script>
  
  <style scoped>
  .color-picker-container {
    position: relative;
  }
  
  .color-preview {
    width: 83px;
    height: 32px;
    background-color: v-bind('colorValue || "#949496"');
    border-radius: 14px;
    cursor: pointer;
  }
  
  /* Стили для наивного колорпикера */
  :deep(.n-color-picker) {
    position: absolute;
    top: 40px;
    right: 0;
    z-index: 100;
  }
  
  :deep(.n-color-picker-trigger) {
    display: none;
  }
  </style>