<!-- src/components/transactions/BookSelector.vue -->
<template>
  <div class="book-element">
    <div class="area">
      <div class="icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.5816 13.3335H6.58159C5.80659 13.3335 5.41909 13.3335 5.10075 13.4185C4.67684 13.5322 4.29033 13.7554 3.98007 14.0658C3.6698 14.3763 3.44672 14.7629 3.33325 15.1868" stroke="white" stroke-width="1.5"/>
          <path d="M6.66658 5.83341H13.3333M6.66658 8.75008H10.8333M8.33325 18.3334C5.97658 18.3334 4.79742 18.3334 4.06575 17.6009C3.33325 16.8692 3.33325 15.6901 3.33325 13.3334V6.66675C3.33325 4.31008 3.33325 3.13091 4.06575 2.39925C4.79742 1.66675 5.97658 1.66675 8.33325 1.66675H11.6666C14.0233 1.66675 15.2024 1.66675 15.9341 2.39925C16.6666 3.13091 16.6666 4.31008 16.6666 6.66675M11.6666 18.3334C14.0233 18.3334 15.2024 18.3334 15.9341 17.6009C16.6666 16.8692 16.6666 15.6901 16.6666 13.3334V10.0001" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="books-selector">
        <div
          v-for="book in accessibleBooks"
          :key="book.id"
          class="book-item"
          :class="{ 'selected': modelValue === book.id }"
          @click="$emit('update:modelValue', book.id)"
        >
          {{ book.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useBookStore } from '../../../stores/book';
import { useUserStore } from '../../../stores/user';

const props = defineProps({
  books: {
    type: Array,
    required: false,
    default: () => []
  },
  modelValue: {
    type: String,
    required: true
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

// Получаем книги, доступные текущему пользователю
const accessibleBooks = computed(() => {
  // Если передан массив books в props, используем его
  if (props.books && props.books.length > 0) {
    return props.books;
  }
  
  // Получаем ID текущего пользователя
  const currentUserId = userStore.currentUser?.id;
  
  if (!currentUserId) {
    return bookStore.booksForSelector;
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
.book-element {
  display: inline-block;
  align-items: center;
  display: flex;
  justify-content: center;
}

.area {
  padding: 6px 10px 6px 13px;
  background: #46484A;
  border-radius: 28px;
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  gap: 6px;
}

.icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.books-selector {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 2px;
}

.book-item {
  height: 28px;
  padding: 0 16px;
  background: #46484A;
  border-radius: 34px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  cursor: pointer;
  
  /* Текстовые стили */
  color: white;
  font-size: 12px;
  font-family: Inter, sans-serif;
  font-weight: 400;
  line-height: 16px;
  word-wrap: break-word;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.book-item.selected {
  background: black;
}
</style>