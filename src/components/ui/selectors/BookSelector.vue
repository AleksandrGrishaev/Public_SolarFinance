<!-- src/components/ui/selectors/BookSelector.vue -->
<template>
    <UniversalSelector 
      v-model="selectedBookId" 
      :items="accessibleBooks"
      :backgroundColor="backgroundColor"
      :selectedColor="selectedColor"
    >
      <template #icon>
        <IconBook class="book-icon" :size="20" stroke-width="1.5" color="white" />
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
      type: String,
      required: true
    },
    books: {
      type: Array,
      required: false,
      default: () => []
    },
    backgroundColor: {
      type: String,
      default: '#46484A'
    },
    selectedColor: {
      type: String,
      default: '#000000'
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
  
  // Двухсторонняя привязка выбранной книги
  const selectedBookId = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  });
  
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
    if (books.length > 0 && !books.some(book => book.id === value)) {
      emit('update:modelValue', books[0].id);
    }
  }, { immediate: true });
  </script>
  
  <style scoped>
  .book-icon {
    color: white;
  }
  </style>