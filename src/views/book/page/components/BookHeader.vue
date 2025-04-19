<!-- src/views/book/page/components/BookHeader.vue -->
<template>
    <BaseBookHeader 
      :title="bookTitle" 
      :editable="isBookEditable" 
      @edit="handleEditBook"
    />
    
    <EditBookPopup 
      v-model="showEditBookPopup"
      :book="currentBook"
    />
  </template>
  
  <script setup lang="ts">
  import { computed, ref } from 'vue';
  import BaseBookHeader from '@/components/ui/views/BaseBookHeader.vue';
  import EditBookPopup from '@/views/book/popup/EditBookPopup.vue';
  import { useBookContext } from '../composables/useBookContext';
  
  // Get book context
  const { currentBook, isAllBooks } = useBookContext();
  
  // Local state
  const showEditBookPopup = ref(false);
  
  // Computed properties
  const bookTitle = computed(() => {
    return currentBook.value?.name + ' book'|| 'All Books';
  });
  
  const isBookEditable = computed(() => {
    // Only allow editing if a specific book is selected, not "All Books"
    return !isAllBooks.value && !!currentBook.value;
  });
  
  // Event handlers
  const handleEditBook = () => {
    if (currentBook.value) {
      console.log(`[BookHeader] Editing book: ${currentBook.value.name}`);
      showEditBookPopup.value = true;
    }
  };
  </script>