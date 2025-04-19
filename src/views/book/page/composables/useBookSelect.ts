// src/views/book/page/composables/useBookSelect.ts
import { computed, ref, watch } from 'vue';
import { useBookContext } from './useBookContext';
import { useBookStore } from '@/stores/book';

export function useBookSelect(multiSelect = false) {
  console.log('[useBookSelect] Initializing with multiSelect:', multiSelect);
  
  const bookStore = useBookStore();
  const { selectedBookIds: contextSelectedBookIds, selectBook, selectMultipleBooks } = useBookContext();
  
  // Создаем локальное реактивное значение для режима одиночного выбора
  const singleSelectedBookId = ref('');
  
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
  
  // Инициализируем начальное значение для режима одиночного выбора
  if (!multiSelect && contextSelectedBookIds.value.length > 0) {
    singleSelectedBookId.value = contextSelectedBookIds.value[0];
  }
  
  // Вычисляемое свойство для возврата значения в правильном формате в зависимости от режима
  const selectedBookIds = computed({
    get() {
      if (multiSelect) {
        return contextSelectedBookIds.value;
      } else {
        // Для режима одиночного выбора возвращаем строку, а не массив
        return singleSelectedBookId.value || (contextSelectedBookIds.value.length > 0 ? contextSelectedBookIds.value[0] : '');
      }
    },
    set(newValue) {
      if (multiSelect) {
        // Для мультивыбора передаем массив
        selectMultipleBooks(Array.isArray(newValue) ? newValue : [newValue]);
      } else {
        // Для одиночного выбора обновляем локальное значение и контекст
        const bookId = Array.isArray(newValue) ? newValue[0] : newValue;
        singleSelectedBookId.value = bookId;
        selectBook(bookId);
      }
    }
  });
  
  // Проверка, выбрана ли книга
  const isBookSelected = (bookId: string) => {
    if (multiSelect) {
      const result = contextSelectedBookIds.value.includes(bookId);
      console.log(`[useBookSelect] isBookSelected check for ${bookId}:`, result);
      return result;
    } else {
      const result = singleSelectedBookId.value === bookId || 
                   (contextSelectedBookIds.value.length > 0 && contextSelectedBookIds.value[0] === bookId);
      console.log(`[useBookSelect] isBookSelected check for ${bookId}:`, result);
      return result;
    }
  };
  
  // Переключение выбора книги
  const toggleBook = (bookId: string) => {
    console.log(`[useBookSelect] toggleBook called for ${bookId}`);
    console.log(`[useBookSelect] Current selection:`, multiSelect ? contextSelectedBookIds.value : singleSelectedBookId.value);
    console.log(`[useBookSelect] multiSelect mode:`, multiSelect);
    
    if (!multiSelect) {
      console.log(`[useBookSelect] Single select mode - selecting book: ${bookId}`);
      singleSelectedBookId.value = bookId;
      selectBook(bookId);
      return;
    }
    
    // Логика множественного выбора
    if (bookId === 'all') {
      console.log(`[useBookSelect] Selecting "All" books`);
      selectMultipleBooks(['all']);
      return;
    }
    
    let newSelection = [...contextSelectedBookIds.value];
    
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
  watch(() => contextSelectedBookIds.value, (newSelection) => {
    console.log('[useBookSelect] selectedBookIds changed:', newSelection);
    if (!multiSelect && newSelection.length > 0) {
      singleSelectedBookId.value = newSelection[0];
    }
  }, { immediate: true });
  
  return {
    bookOptions,
    selectedBookIds,
    isBookSelected,
    toggleBook
  };
}