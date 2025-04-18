<!-- src/views/book/page/BooksView.vue -->
<template>
    <div class="books-view-container">
      <!-- Верхняя часть (10%) с фоном --bg-screen -->
      <div class="books-header bg-screen">
        <BookSelector v-model="selectedBookId" :multiSelect="false" />
        <BaseAddIcon @click="showNewBookPopup = true" />
      </div>
      
      <!-- Нижняя часть (90%) с фоном --bg-light и закруглением -->
      <div class="books-content bg-light">
        <!-- Здесь будет контент книги -->
        <div v-if="currentBook" class="book-preview">
          <h2>{{ currentBook.name }}</h2>
          <p>Type: {{ currentBook.type }}</p>
          <p>Description: {{ currentBook.description || 'No description' }}</p>
        </div>
      </div>
  
      <!-- Попап для создания новой книги -->
      <NewBookPopup v-model="showNewBookPopup" />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import BookSelector from './components/BookSelector.vue';
  import BaseAddIcon from './components/BaseAddIcon.vue';
  import NewBookPopup from '../popup/NewBookPopup.vue';
  import { useBookStore } from '@/stores/book';
  
  // Хранилище книг
  const bookStore = useBookStore();
  
  // Состояние
  const selectedBookId = ref(['family']); // По умолчанию выбрана Family книга
  const showNewBookPopup = ref(false);
  
  // Получаем текущую выбранную книгу
  const currentBook = computed(() => {
    if (selectedBookId.value.length === 0) return null;
    return bookStore.getBookById(selectedBookId.value[0]);
  });
  
  // При монтировании компонента инициализируем хранилище
  onMounted(async () => {
    if (!bookStore.isInitialized) {
      await bookStore.init();
    }
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
    padding: var(--spacing-md);
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
  
  .book-preview {
    padding: var(--spacing-md);
    background-color: var(--bg-contrast);
    border-radius: var(--border-radius-md);
    color: var(--text-usual);
  }
  </style>