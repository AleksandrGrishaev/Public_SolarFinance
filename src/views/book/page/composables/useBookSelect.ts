// src/views/book/page/composables/useBookSelect.ts
import { computed, watch } from 'vue';
import { useBookContext } from './useBookContext';
import { useBookStore } from '@/stores/book';

export function useBookSelect(multiSelect = false) {
  console.log('[useBookSelect] Initializing with multiSelect:', multiSelect);
  
  const bookStore = useBookStore();
  const { selectedBookIds, selectBook, selectMultipleBooks } = useBookContext();
  
  // Выведем доступные книги в хранилище
  console.log('[useBookSelect] Available books in bookStore:', 
    bookStore.userAccessibleBooks.map(b => ({
      id: b.id, 
      name: b.name,
      currency: b.currency,
      isActive: b.isActive
    }))
  );
  
  // Опции книг, включая "All"
  const bookOptions = computed(() => {
    const allOption = { id: 'all', name: 'All' };
    
    const userBooks = bookStore.userAccessibleBooks.map(book => ({
      id: book.id,
      name: book.name
    }));
    
    const options = [allOption, ...userBooks];
    console.log('[useBookSelect] Computed bookOptions:', options);
    return options;
  });
  
  // Проверка, выбрана ли книга
  const isBookSelected = (bookId: string) => {
    const result = selectedBookIds.value.includes(bookId);
    console.log(`[useBookSelect] isBookSelected check for ${bookId}:`, result);
    return result;
  };
  
  // Переключение выбора книги
  const toggleBook = (bookId: string) => {
    console.log(`[useBookSelect] toggleBook called for ${bookId}`);
    console.log(`[useBookSelect] Current selection:`, selectedBookIds.value);
    console.log(`[useBookSelect] multiSelect mode:`, multiSelect);
    
    if (!multiSelect) {
      console.log(`[useBookSelect] Single select mode - selecting book: ${bookId}`);
      selectBook(bookId);
      return;
    }
    
    // Логика множественного выбора
    if (bookId === 'all') {
      console.log(`[useBookSelect] Selecting "All" books`);
      selectMultipleBooks(['all']);
      return;
    }
    
    let newSelection = [...selectedBookIds.value];
    
    // Если "All" в данный момент выбран, удаляем его
    if (newSelection.includes('all')) {
      console.log(`[useBookSelect] Removing "All" from selection`);
      newSelection = newSelection.filter(id => id !== 'all');
    }
    
    // Переключаем выбранную книгу
    const index = newSelection.indexOf(bookId);
    
    if (index === -1) {
      console.log(`[useBookSelect] Adding ${bookId} to selection`);
      newSelection.push(bookId);
    } else if (newSelection.length > 1) {
      console.log(`[useBookSelect] Removing ${bookId} from selection`);
      newSelection.splice(index, 1);
    } else {
      console.log(`[useBookSelect] Can't remove last book from selection`);
    }
    
    console.log(`[useBookSelect] New selection:`, newSelection);
    selectMultipleBooks(newSelection);
  };
  
  // Добавим наблюдение за изменением выбранных книг
  watch(() => selectedBookIds.value, (newSelection) => {
    console.log('[useBookSelect] selectedBookIds changed:', newSelection);
  }, { immediate: true });
  
  return {
    bookOptions,
    selectedBookIds,
    isBookSelected,
    toggleBook
  };
}