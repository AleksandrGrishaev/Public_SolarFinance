<!-- src/views/book/page/components/BookSelector.vue -->
<template>
  <div class="book-selector">
    <div class="book-tabs-container">
      <div 
        v-for="book in bookOptions" 
        :key="book.id"
        class="book-tab"
        :class="{ 'active': isBookSelected(book.id) }"
        @click="toggleBookWithDebug(book.id)"
      >
        {{ book.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookSelect } from '../composables/useBookSelect';
import { onMounted, watch } from 'vue';


const props = defineProps({
  multiSelect: {
    type: Boolean,
    default: false
  }
});

// Используем composable для выбора книги
const { bookOptions, isBookSelected, toggleBook, selectedBookIds } = useBookSelect(props.multiSelect);

// Добавляем наблюдение за изменением выбранных книг
watch(() => selectedBookIds.value, (newSelection) => {
  console.log('[BookSelector] Selected book IDs changed:', newSelection);
  console.log('[BookSelector] Multi-select mode:', props.multiSelect);
}, { immediate: true });

// Обогатим функцию toggleBook для отладки
const toggleBookWithDebug = (bookId) => {
  console.log('[BookSelector] Toggle book requested:', bookId);
  console.log('[BookSelector] Current selection before toggle:', selectedBookIds.value);
  
  toggleBook(bookId);
  
  console.log('[BookSelector] Selection after toggle:', selectedBookIds.value);
};

onMounted(() => {
  console.log('[BookSelector] Component mounted, available books:', 
    bookOptions.value.map(b => ({ id: b.id, name: b.name })));
  console.log('[BookSelector] Current selection at mount:', selectedBookIds.value);
});
</script>
  
<style scoped>
.book-selector {
  /* Убираем flex: 1, чтобы элемент не занимал всё доступное пространство */
  display: inline-flex;
}

.book-tabs-container {
  display: flex;
  background-color: var(--bg-contrast);
  border-radius: var(--border-radius-lg);
  padding: 6px;
  gap: var(--spacing-xs);
  overflow-x: auto;
  /* Убираем max-width: 100%, чтобы не занимать всю ширину */
}

.book-tab {
  padding: 8px 16px;
  border-radius: var(--border-radius-xl);
  font-size: var(--font-small-size);
  color: var(--text-usual);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-speed) var(--transition-fn);
}

.book-tab:hover {
  opacity: var(--state-hover-opacity);
}

.book-tab.active {
  background-color: var(--bg-item-selected);
  color: var(--text-contrast);
}
</style>