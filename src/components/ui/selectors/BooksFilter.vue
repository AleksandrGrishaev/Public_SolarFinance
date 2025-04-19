<!-- src/components/ui/selectors/BooksFilter.vue -->
<template>
    <div class="books-filter" :class="{ 'with-debug': debug }">
      <!-- Книги для выбора -->
      <div class="books-container" :style="{ backgroundColor: booksBackgroundColor }">
        <div 
          v-for="book in filteredBookOptions" 
          :key="book.id"
          class="book-item"
          :class="{ 'active': isBookSelected(book.id) }"
          @click="handleToggleBook(book.id)"
        >
          {{ book.name }}
        </div>
      </div>
      
      <!-- Иконка добавления книги (опциональная) -->
      <div 
        v-if="showAddButton" 
        class="add-button"
        @click="handleAddClick"
      >
        <IconPlus 
          class="plus-icon" 
          :size="addButtonSize - 12" 
          :color="addButtonColor"
          :stroke-width="2"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { IconPlus } from '@tabler/icons-vue';
  
  const props = defineProps({
    // Модель для v-model
    modelValue: {
      type: [String, Array],
      required: true
    },
    
    // Книги для отображения
    books: {
      type: Array,
      default: () => []
    },
    
    // Цвета
    containerBackgroundColor: {
      type: String,
      default: 'var(--bg-light, #949496)'
    },
    
    booksBackgroundColor: {
      type: String,
      default: 'var(--bg-contrast, #444444)'
    },
    
    selectedBookColor: {
      type: String,
      default: 'var(--bg-item-selected, #000000)'
    },
    
    // Настройки мультивыбора
    multiSelect: {
      type: Boolean,
      default: false
    },
    
    // Показывать ли опцию "All"
    showAllOption: {
      type: Boolean,
      default: false
    },
    
    // Настройки кнопки добавления
    showAddButton: {
      type: Boolean,
      default: true
    },
    
    addButtonSize: {
      type: Number,
      default: 36
    },
    
    addButtonColor: {
      type: String,
      default: 'var(--bg-main)'
    },
    
    // Режим отладки
    debug: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['update:modelValue', 'add-book']);
  
  // Определение режима выбора
  const isMultiSelectMode = computed(() => {
    return props.multiSelect || Array.isArray(props.modelValue);
  });
  
  // Подготовка опций книг для отображения
  const bookOptions = computed(() => {
    return props.books;
  });
  
  // Фильтруем опции в зависимости от настройки showAllOption
  const filteredBookOptions = computed(() => {
    if (props.showAllOption) {
      return bookOptions.value;
    } else {
      return bookOptions.value.filter(book => book.id !== 'all');
    }
  });
  
  // Проверка, выбрана ли книга
  const isBookSelected = (bookId) => {
    if (Array.isArray(props.modelValue)) {
      return props.modelValue.includes(bookId);
    }
    return props.modelValue === bookId;
  };
  
  // Обработчик переключения книги с выводом логов при включенной отладке
  const handleToggleBook = (bookId) => {
    if (props.debug) {
      console.log(`[BooksFilter] Toggle book requested: ${bookId}`);
      console.log(`[BooksFilter] Current selection before toggle:`, props.modelValue);
    }
    
    toggleBook(bookId);
    
    if (props.debug) {
      console.log(`[BooksFilter] Selection after toggle:`, props.modelValue);
    }
  };
  
  // Переключение выбора книги
  const toggleBook = (bookId) => {
    if (!isMultiSelectMode.value) {
      // Одиночный выбор
      emit('update:modelValue', bookId);
      return;
    }
    
    // Мультивыбор
    if (!Array.isArray(props.modelValue)) {
      emit('update:modelValue', [bookId]);
      return;
    }
    
    const selectedBooks = [...props.modelValue];
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
  
  // Обработчик клика по кнопке добавления
  const handleAddClick = (event) => {
    if (props.debug) {
      console.log('[BooksFilter] Add button clicked');
    }
    emit('add-book', { event });
  };
  
  // Если выбранной книги нет в списке, выбираем первую доступную
  watch([filteredBookOptions, () => props.modelValue], ([books, value]) => {
    if (books.length === 0) return;
    
    // Если "all" больше не отображается, и он был выбран, выбираем первую книгу
    if (!props.showAllOption && 
        ((Array.isArray(value) && value.includes('all')) || 
         value === 'all')) {
      if (isMultiSelectMode.value) {
        emit('update:modelValue', [books[0].id]);
      } else {
        emit('update:modelValue', books[0].id);
      }
      return;
    }
    
    if (Array.isArray(value)) {
      const hasValidBook = value.some(bookId => 
        books.some(book => book.id === bookId)
      );
      
      if (!hasValidBook && books.length > 0) {
        emit('update:modelValue', [books[0].id]);
      }
    } else if (typeof value === 'string' && !books.some(book => book.id === value)) {
      emit('update:modelValue', books[0].id);
    }
  }, { immediate: true });
  </script>
  
  <style scoped>
  .books-filter {
    display: inline-flex;
    align-items: center;
    background-color: var(--bg-light, #949496);
    border-radius: var(--border-radius-lg, 28px);
    padding-right: 2px;
    gap: 6px;
  }
  
  .books-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 4px;
    border-radius: var(--border-radius-lg, 28px);
    gap: var(--spacing-xs, 4px);
    box-shadow: var(--shadow-tabs, 0px 4px 4px rgba(0, 0, 0, 0.25));
    overflow-x: auto;
  }
  
  .book-item {
    height: 28px;
    padding: 4px 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--border-radius-xl, 34px);
    font-size: var(--font-super-small-size, 10px);
    font-weight: 600;
    line-height: var(--font-super-small-line-height, 12px);
    white-space: nowrap;
    color: var(--text-usual);
    cursor: pointer;
    transition: all var(--transition-speed, 0.2s) var(--transition-fn, ease);
  }
  
  .book-item:hover {
    opacity: var(--state-hover-opacity, 0.8);
  }
  
  .book-item.active {
    background-color: var(--bg-item-selected, #000000);
    color: var(--text-contrast, white);
  }
  
  .add-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: pointer;
    width: v-bind('addButtonSize + "px"');
    height: v-bind('addButtonSize + "px"');
    border: 1.5px dashed var(--bg-main);
    border-radius: 50%;
    transition: opacity var(--transition-speed, 0.2s) var(--transition-fn, ease);
    opacity: 0.8;
  }
  
  .plus-icon {
    stroke-width: 2;
  }
  
  .add-button:hover {
    opacity: var(--state-hover-opacity, 0.8);
  }
  
  .add-button:active {
    opacity: var(--state-active-opacity, 0.6);
  }
  </style>