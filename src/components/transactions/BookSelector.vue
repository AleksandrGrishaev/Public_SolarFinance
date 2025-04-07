<template>
    <div class="book-selector">
      <div
        v-for="book in books"
        :key="book.id"
        :class="['book-option', { active: selectedBook.id === book.id }]"
        @click="selectBook(book)"
      >
        <div class="book-icon">
          <n-icon>
            <icon-book />
          </n-icon>
        </div>
        <div class="book-name">{{ book.name }}</div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { NIcon } from 'naive-ui'
  import { IconBook } from '@tabler/icons-vue'
  
  const props = defineProps({
    selectedBook: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits(['select-book'])
  
  const books = ref([
    { id: 'my', name: 'My', type: 'Personal' },
    { id: 'family', name: 'Family', type: 'Family' },
    { id: 'wife', name: 'Wife', type: 'Personal' }
  ])
  
  const selectBook = (book) => {
    emit('select-book', book)
  }
  </script>
  
  <style scoped>
  .book-selector {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
    padding: 4px;
    background-color: #333;
    border-radius: 24px;
  }
  
  .book-option {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    border-radius: 20px;
    margin: 0 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .book-option.active {
    background-color: #444;
    font-weight: 500;
  }
  
  .book-icon {
    margin-right: 6px;
    display: flex;
    align-items: center;
  }
  
  .book-name {
    font-size: 14px;
  }
  </style>