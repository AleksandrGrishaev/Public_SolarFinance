<!-- src/views/book/page/components/NewBookPopup.vue -->
<template>
    <BasePopup v-model="isVisible" title="New Book">
      <div class="new-book-content">
        Здесь будет контент создания новой книги
      </div>
    </BasePopup>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import BasePopup from '@/components/ui/BasePopup.vue';
  
  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true
    }
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  // Двусторонняя привязка для видимости попапа
  const isVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  });
  </script>
  
  <style scoped>
  .new-book-content {
    padding: var(--spacing-md);
    text-align: center;
    color: var(--text-usual);
  }
  </style>