<!-- src/views/book/popup/EditBookPopup.vue -->
<template>
  <BasePopup v-model="isVisible" title="Edit Book">
    <div class="edit-book-content">
      <p>Editing book: {{ book?.name }}</p>
    </div>
  </BasePopup>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BasePopup from '@/components/ui/BasePopup.vue';
import type { Book } from '@/stores/book/types';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  book: {
    type: Object as () => Book | null,
    default: null
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
.edit-book-content {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--text-usual);
}
</style>