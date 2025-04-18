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
  import { computed, onMounted, ref } from 'vue';
  import { useBookStore } from '@/stores/book';
  import { useUserStore } from '@/stores/user';
  
  const props = defineProps({
    modelValue: {
      type: Array,
      required: true
    },
    multiSelect: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  // Используем хранилища
  const bookStore = useBookStore();
  const userStore = useUserStore();
  
  // Состояние загрузки
  const loading = ref(true);
  
  // Инициализация хранилища книг
  onMounted(async () => {
    if (!bookStore.isInitialized) {
      await bookStore.init();
    }
    loading.value = false;
  });
  
  // Подготовка опций книг с добавлением "All" опции
  const bookOptions = computed(() => {
    const allOption = { id: 'all', name: 'All' };
    
    // Получаем книги, доступные текущему пользователю
    const userBooks = bookStore.userAccessibleBooks.map(book => ({
      id: book.id,
      name: book.name
    }));
    
    return [allOption, ...userBooks];
  });
  
  // Проверка, выбрана ли книга
  const isBookSelected = (bookId) => {
    return props.modelValue.includes(bookId);
  };
  
  // Переключение выбора книги
  const toggleBook = (bookId) => {
    // Если multiSelect выключен, всегда заменяем выбор
    if (!props.multiSelect) {
      emit('update:modelValue', [bookId]);
      return;
    }
    
    // Далее логика для multiSelect режима
    if (bookId === 'all') {
      // Если выбрана опция "All", сбрасываем выбор других книг
      emit('update:modelValue', ['all']);
      return;
    }
    
    // Если уже выбрана опция "All", сначала убираем её
    let selectedBooks = [...props.modelValue];
    
    if (selectedBooks.includes('all')) {
      selectedBooks = selectedBooks.filter(id => id !== 'all');
    }
    
    // Добавляем или убираем книгу
    const index = selectedBooks.indexOf(bookId);
    
    if (index === -1) {
      // Добавляем книгу
      selectedBooks.push(bookId);
    } else if (selectedBooks.length > 1) {
      // Удаляем книгу, если выбрано больше одной
      selectedBooks.splice(index, 1);
    }
    
    emit('update:modelValue', selectedBooks);
  };
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