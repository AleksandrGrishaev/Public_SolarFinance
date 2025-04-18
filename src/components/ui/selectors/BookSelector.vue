<!-- src/components/ui/selectors/BookSelector.vue -->
<template>
  <div class="book-selector-container" v-if="multiSelect">
    <!-- Мультиселектор для книг -->
    <div class="selector-container" :style="{ backgroundColor: backgroundColor }">
      <!-- Иконка книги (опциональная) -->
      <div v-if="showIcon" class="icon-container">
        <IconBook class="book-icon" :size="20" stroke-width="1.5" color="var(--text-contrast)" />
      </div>
      
      <!-- Список книг для выбора -->
      <div class="books-container">
        <div 
          v-for="book in accessibleBooks" 
          :key="book.id"
          class="book-item"
          :class="{ 'selected': isBookSelected(book.id) }"
          @click="toggleBook(book.id)"
        >
          {{ book.name }}
        </div>
      </div>
    </div>
  </div>
  <UniversalSelector 
    v-else
    v-model="selectedBookId" 
    :items="accessibleBooks"
    :backgroundColor="backgroundColor"
    :selectedColor="selectedColor"
  >
    <template #icon v-if="showIcon">
      <IconBook class="book-icon" :size="20" stroke-width="1.5" color="var(--text-contrast)" />
    </template>
  </UniversalSelector>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, ref } from 'vue';
import { useBookStore } from '../../../stores/book';
import { useUserStore } from '../../../stores/user';
import UniversalSelector from './UniversalSelector.vue';
import { IconBook } from '@tabler/icons-vue';

const props = defineProps({
  modelValue: {
    type: [String, Array],
    required: true
  },
  books: {
    type: Array,
    required: false,
    default: () => []
  },
  backgroundColor: {
    type: String,
    default: 'var(--bg-light)'
  },
  selectedColor: {
    type: String,
    default: 'var(--dropdown-item-selected)'
  },
  multiSelect: {
    type: Boolean,
    default: false
  },
  showIcon: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue']);
  
// Используем хранилища
const bookStore = useBookStore();
const userStore = useUserStore();

// Инициализируем хранилища при монтировании компонента
onMounted(async () => {
  if (!bookStore.isInitialized) {
    await bookStore.init();
  }
  
  if (!userStore.isInitialized) {
    await userStore.init();
  }
});

// Определяем тип значения modelValue
const isMultiSelectMode = computed(() => {
  return props.multiSelect || Array.isArray(props.modelValue);
});

// Двухсторонняя привязка выбранной книги для режима одиночного выбора
const selectedBookId = computed({
  get: () => {
    if (isMultiSelectMode.value) {
      return Array.isArray(props.modelValue) && props.modelValue.length > 0 
        ? props.modelValue[0] 
        : '';
    }
    return props.modelValue;
  },
  set: (value) => {
    if (isMultiSelectMode.value) {
      emit('update:modelValue', [value]);
    } else {
      emit('update:modelValue', value);
    }
  }
});

// Проверка, выбрана ли книга (для мультивыбора)
const isBookSelected = (bookId) => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(bookId);
  }
  return props.modelValue === bookId;
};

// Переключение выбора книги (для мультивыбора)
const toggleBook = (bookId) => {
  if (!Array.isArray(props.modelValue)) {
    // Если не массив, но multiSelect включен, преобразуем в массив
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

// Получаем книги, доступные текущему пользователю
const accessibleBooks = computed(() => {
  // Если передан массив books в props, используем его
  if (props.books && props.books.length > 0) {
    return props.books;
  }
  
  // Получаем ID текущего пользователя
  const currentUserId = userStore.currentUser?.id;
  
  if (!currentUserId) {
    return bookStore.booksForSelector || [];
  }
  
  // Фильтруем книги, доступные текущему пользователю
  return bookStore.books
    .filter(book => {
      // Показываем только активные книги
      if (!book.isActive) return false;
      
      // Проверяем, есть ли пользователь в списке владельцев книги
      return book.ownerIds.includes(currentUserId);
    })
    .map(book => ({
      id: book.id,
      name: book.name
    }));
});

// Если выбранная книга недоступна пользователю, выбираем первую доступную
watch([accessibleBooks, () => props.modelValue], ([books, value]) => {
  if (books.length === 0) return;
  
  if (Array.isArray(value)) {
    // Проверяем, есть ли хотя бы одна книга из выбранных в доступных
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
.book-icon {
  color: var(--text-contrast);
}

.book-selector-container {
  width: 100%;
}

.selector-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 6px 10px;
  border-radius: var(--border-radius-lg);
  gap: var(--spacing-xs);
  width: 100%;
  box-sizing: border-box;
  transition: background-color var(--transition-speed) var(--transition-fn);
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.books-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  width: 100%;
}

.book-item {
  padding: 6px 16px;
  background-color: transparent;
  border-radius: var(--border-radius-xl);
  color: var(--text-usual);
  font-size: var(--font-small-size);
  cursor: pointer;
  transition: all var(--transition-speed) var(--transition-fn);
}

.book-item:hover {
  opacity: var(--state-hover-opacity);
}

.book-item.selected {
  background-color: v-bind('selectedColor');
  color: var(--text-contrast);
}
</style>