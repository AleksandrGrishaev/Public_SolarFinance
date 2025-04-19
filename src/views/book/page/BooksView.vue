<!-- src/views/book/page/BooksView.vue -->
<template>
  <div class="books-view-container">
    <!-- Верхняя часть с BookSelector -->
    <div class="books-header bg-screen">
      <BookSelector :multiSelect="false" />
      <BaseAddIcon @click="showNewBookPopup = true" />
    </div>
    
    <!-- Нижняя часть с контентом -->
    <div class="books-content bg-light">
      <!-- Если книга выбрана, показываем панель -->
      <DashBoardBook 
        v-if="currentBook"
      />
      
      <!-- Если книга не выбрана, показываем сообщение -->
      <div v-else class="empty-selection">
        <p class="text-grey">Select a book to view details</p>
      </div>
    </div>

    <!-- Попап для создания новой книги -->
    <NewBookPopup v-model="showNewBookPopup" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import BookSelector from './components/BookSelector.vue';
import BaseAddIcon from './components/BaseAddIcon.vue';
import NewBookPopup from '../popup/NewBookPopup.vue';
import DashBoardBook from './components/DashBoardBook.vue';
import { useBookContextProvider } from './composables/useBookContext';

console.log('[BooksView] Component setup started');

// Используем провайдер контекста и сохраняем весь контекст
const context = useBookContextProvider();
// Затем получаем нужные значения из контекста
const { currentBook } = context;

// Локальное состояние
const showNewBookPopup = ref(false);

// Добавляем наблюдение за изменениями книги
watch(() => context.selectedBookIds.value, (newValue) => {
  console.log('[BooksView] Selected book IDs changed:', newValue);
  console.log('[BooksView] Current book:', currentBook.value?.name || 'None');
}, { immediate: true });

onMounted(() => {
  console.log('[BooksView] Component mounted');
});
</script>

  <style scoped>
  .books-view-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }
  
  .books-header {
    height: 10%;
    min-height: 100px;
    padding-top: var(--spacing-lg);
    padding-bottom: var(--spacing-xs);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
  }
  
  .books-content {
    height: 90%;
    border-top-left-radius: var(--border-radius-xxxl);
    border-top-right-radius: var(--border-radius-xxxl);
    padding: var(--spacing-md);
    overflow-y: auto;
  }
  
  .empty-selection {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    text-align: center;
  }
  </style>