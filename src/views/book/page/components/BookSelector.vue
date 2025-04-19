<!-- src/views/book/page/components/BookSelector.vue -->
<template>
  <div class="book-selector">
    <div class="book-tabs-container">
      <div 
        v-for="book in bookOptions" 
        :key="book.id"
        class="book-tab"
        :class="{ 'active': isBookSelected(book.id) }"
        @click="toggleBook(book.id)"
      >
        {{ book.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookSelect } from '../composables/useBookSelect';
import { onMounted} from 'vue';


const props = defineProps({
  multiSelect: {
    type: Boolean,
    default: false
  }
});

// Используем composable для выбора книги
const { bookOptions, isBookSelected, toggleBook } = useBookSelect(props.multiSelect);

onMounted(() => {
  console.log('[BookSelector] Component mounted, available books:', 
    bookOptions.value.map(b => b.name).join(', '));
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