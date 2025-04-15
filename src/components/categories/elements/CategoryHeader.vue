<!-- src/components/categories/CategoryHeader.vue -->
<template>
    <div class="category-header">
      <div class="header-element">
        <div class="close-icon" @click="$emit('close')">
          <IconX color="#A44942" />
        </div>
        <div class="name-container">
          <CategoryIcon 
            :icon-name="category?.icon || ''" 
            :background-color="category?.color || '#F5C54C'"
            size="medium" 
          />
          <div class="name-wrapper">
            <div v-if="category?.parentName" class="parent-name">
              {{ category?.parentName }}
            </div>
            <div class="category-name">
              {{ category?.name || 'Category' }}
            </div>
          </div>
        </div>
        <div class="edit-button" @click="$emit('edit')">
          Edit
        </div>
      </div>
      
      <!-- Фильтры и информация -->
      <div class="info-filters">
        <!-- Книга -->
        <div class="filter-badge book-badge">
          <IconBook color="white" size="20" />
          <div class="badge-text">{{ bookNames }}</div>
        </div>
        
        <!-- Тип транзакции -->
        <div class="filter-badge type-badge">
          <div class="badge-text">{{ categoryType }}</div>
        </div>
        
        <!-- Иконки действий -->
        <div class="action-icons">
          <IconShare color="#A44942" size="24" />
          <IconChartPie color="#53B794" size="24" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import CategoryIcon from '../CategoryIcon.vue';
  import { 
    IconX, 
    IconBook,
    IconShare,
    IconChartPie
  } from '@tabler/icons-vue';
  
  const props = defineProps({
    category: {
      type: Object,
      default: null
    },
    books: {
      type: Array,
      default: () => []
    }
  });
  
  const emit = defineEmits(['close', 'edit']);
  
  // Имена книг в удобном формате
  const bookNames = computed(() => {
    if (!props.category?.books || props.category.books.length === 0) {
      return 'No books';
    }
    
    // Преобразуем ID книг в имена
    const bookNames = props.category.books.map(bookId => {
      // Найти книгу по ID в списке доступных книг
      const book = props.books.find(b => b.id === bookId);
      return book ? book.name : bookId.charAt(0).toUpperCase() + bookId.slice(1);
    });
    
    if (bookNames.length <= 2) {
      return bookNames.join(', ');
    } else {
      return `${bookNames[0]}, ${bookNames[1]} +${bookNames.length - 2}`;
    }
  });
  
  // Тип категории в удобном формате
  const categoryType = computed(() => {
    if (!props.category?.type) return 'Unknown';
    
    const typeMap = {
      'expense': 'Expense',
      'income': 'Income',
      'transfer': 'Transfer'
    };
    
    return typeMap[props.category.type] || props.category.type;
  });
  </script>
  
  <style scoped>
  .category-header {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
  }
  
  /* Заголовок */
  .header-element {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 5px;
  }
  
  .close-icon {
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  
  .name-container {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 10px;
  }
  
  .name-wrapper {
    display: flex;
    flex-direction: column;
  }
  
  .parent-name {
    color: white;
    font-size: 16px;
    font-weight: 400;
    line-height: 20px;
  }
  
  .category-name {
    color: white;
    font-size: 20px;
    font-weight: 500;
    line-height: 24px;
  }
  
  .edit-button {
    color: #DBDADD;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    cursor: pointer;
  }
  
  /* Фильтры и информация */
  .info-filters {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
  }
  
  .filter-badge {
    height: 32px;
    padding: 6px 10px 6px 13px;
    background: #46484A;
    border-radius: 28px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .book-badge {
    display: flex;
    align-items: center;
  }
  
  .badge-text {
    color: white;
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    white-space: nowrap;
  }
  
  .action-icons {
    display: flex;
    gap: 5px;
  }
  </style>