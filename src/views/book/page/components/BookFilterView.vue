<!-- src/views/book/page/components/BookFilterView.vue -->
<template>
    <BooksFilter
      v-model="selectedBookIds"
      :books="bookOptions"
      :multi-select="multiSelect"
      :show-all-option="false"
      :show-add-button="showAddButton"
      :add-button-size="addButtonSize"
      :add-button-color="addButtonColor"
      @add-book="handleAddBook"
    />
  </template>
  
  <script setup lang="ts">
  import { onMounted, watch } from 'vue';
  import { useBookSelect } from '../composables/useBookSelect';
  import BooksFilter from '../../../../components/ui/selectors/BooksFilter.vue';
  
  // Определение props
  const props = defineProps({
    // Включение мультивыбора
    multiSelect: {
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

  });
  
  const emit = defineEmits(['click']);
  
  // Используем composable для выбора книги
  const { bookOptions, isBookSelected, toggleBook, selectedBookIds } = useBookSelect(props.multiSelect);
  
  // Добавляем наблюдение за изменением выбранных книг
  watch(() => selectedBookIds.value, (newSelection) => {
    console.log('[BookFilterView] Selected book IDs changed:', newSelection);
    console.log('[BookFilterView] Multi-select mode:', props.multiSelect);
  }, { immediate: true });
  
  // Обработчик добавления новой книги
  const handleAddBook = (event) => {
    console.log('[BookFilterView] Add book button clicked');
    emit('click', { event });
  };
  
  onMounted(() => {
    console.log('[BookFilterView] Component mounted, available books:', 
      bookOptions.value.map(b => ({ id: b.id, name: b.name })));
    console.log('[BookFilterView] Current selection at mount:', selectedBookIds.value);
  });
  </script>