<!-- src/components/categories/CategoryFilterToggle.vue -->
<template>
    <div class="filter-toggle">
      <div class="toggle-container" @click="toggleShowInactive">
        <div class="toggle-label">{{ showInactive ? 'Show all categories' : 'Show active categories' }}</div>
        <div class="toggle-icon-wrapper">
          <component :is="showInactive ? IconChevronUp : IconChevronDown" class="toggle-icon" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { IconChevronDown, IconChevronUp } from '@tabler/icons-vue';
  
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: true
    }
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  const showInactive = ref(props.modelValue);
  
  function toggleShowInactive() {
    showInactive.value = !showInactive.value;
    emit('update:modelValue', showInactive.value);
  }
  </script>
  
  <style scoped>
  .filter-toggle {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 8px 0;
  }
  
  .toggle-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 5px 12px;
    border-radius: 34px;
    cursor: pointer;
  }
  
  .toggle-label {
    color: white;
    font-size: 10px;
    font-weight: 400;
    line-height: 12px;
  }
  
  .toggle-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .toggle-icon {
    color: white;
    width: 12px;
    height: 12px;
  }
  </style>