// src/views/book/page/composables/useBookSelect.ts
import { computed } from 'vue';
import { useBookContext } from './useBookContext';
import { useBookStore } from '@/stores/book';

export function useBookSelect(multiSelect = false) {
  const bookStore = useBookStore();
  const { selectedBookIds, selectBook, selectMultipleBooks } = useBookContext();
  
  // Опции книг, включая "All"
  const bookOptions = computed(() => {
    const allOption = { id: 'all', name: 'All' };
    
    const userBooks = bookStore.userAccessibleBooks.map(book => ({
      id: book.id,
      name: book.name
    }));
    
    return [allOption, ...userBooks];
  });
  
  // Проверка, выбрана ли книга
  const isBookSelected = (bookId: string) => {
    return selectedBookIds.value.includes(bookId);
  };
  
  // Переключение выбора книги
  const toggleBook = (bookId: string) => {
    if (!multiSelect) {
      selectBook(bookId);
      return;
    }
    
    // Логика множественного выбора
    if (bookId === 'all') {
      selectMultipleBooks(['all']);
      return;
    }
    
    let newSelection = [...selectedBookIds.value];
    
    // Если "All" в данный момент выбран, удаляем его
    if (newSelection.includes('all')) {
      newSelection = newSelection.filter(id => id !== 'all');
    }
    
    // Переключаем выбранную книгу
    const index = newSelection.indexOf(bookId);
    
    if (index === -1) {
      newSelection.push(bookId);
    } else if (newSelection.length > 1) {
      newSelection.splice(index, 1);
    }
    
    selectMultipleBooks(newSelection);
  };
  
  return {
    bookOptions,
    selectedBookIds,
    isBookSelected,
    toggleBook
  };
}