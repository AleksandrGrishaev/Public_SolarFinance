<!-- src/components/categories/CategoryListPopup.vue -->
<template>
  <BasePopup 
    v-model="isVisible" 
    title="Category list" 
    :rightIcon="IconPlus"
    @rightIconClick="handleAddCategory"
  >
    <div class="category-list-container">
      <!-- Фильтры -->
      <div class="filters">
        <book-selector 
          :books="availableBooks" 
          v-model="selectedBook"
        />
        
        <transaction-type-selector 
          :types="transactionTypes" 
          v-model="selectedType" 
        />
      </div>

      <!-- Список категорий -->
      <div class="category-list">
        <draggable 
          v-model="sortedCategories" 
          item-key="id"
          handle=".category-drag-handle"
          @end="saveOrder"
          :animation="200"
        >
          <template #item="{element: category}">
            <div class="category-item" @click="selectCategory(category)">
              <div class="category-info">
                <CategoryIcon 
                  :iconName="category.icon" 
                  :backgroundColor="category.color"
                  size="xsmall" 
                />
                
                <div class="category-text">
                  <div v-if="category.parentName" class="category-parent-name">{{ category.parentName }}</div>
                  <div class="category-name">{{ category.name }}</div>
                </div>
              </div>
              
              <div class="category-drag-handle">
                <IconMenu2 class="handle-icon" />
              </div>
            </div>
          </template>
        </draggable>
      </div>

      <!-- Кнопка создания новой категории -->
      <div class="create-button-container">
        <button class="create-button" @click="handleAddCategory">
          <IconPlus class="create-icon" />
          <span>Create category</span>
        </button>
      </div>
    </div>
  </BasePopup>
</template>

<script setup lang="ts">
import { ref, computed, watch} from 'vue';
import { VueDraggableNext as draggable } from 'vue-draggable-next';
import BasePopup from '../ui/BasePopup.vue';
import BookSelector from '../transactions/BookSelector.vue';
import TransactionTypeSelector from '../transactions/TransactionTypeSelector.vue';
import CategoryIcon from '../categories/CategoryIcon.vue';
import { IconPlus, IconMenu2 } from '@tabler/icons-vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  },
  initialBook: {
    type: String,
    default: 'my'
  },
  initialType: {
    type: String,
    default: 'expense'
  }
});

const emit = defineEmits(['update:modelValue', 'select', 'add', 'edit', 'reorder']);

// Состояние
const selectedBook = ref(props.initialBook);
const selectedType = ref(props.initialType);

// При открытии попапа, устанавливаем переданные значения фильтров
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    selectedBook.value = props.initialBook;
    selectedType.value = props.initialType;
  }
});

// При изменении внешних значений, обновляем внутренние
watch(() => props.initialBook, (newValue) => {
  selectedBook.value = newValue;
});

watch(() => props.initialType, (newValue) => {
  selectedType.value = newValue;
});

// Mock данные
const availableBooks = [
  { id: 'my', name: 'My' },
  { id: 'family', name: 'Family' },
  { id: 'wife', name: 'Wife' }
];

const transactionTypes = [
  { id: 'expense', name: 'Expense' },
  { id: 'income', name: 'Income' }
];

// Если нет категорий, используем эти
const defaultCategories = [
  { 
    id: 'renovation', 
    name: 'Renovation', 
    parentName: 'House',
    color: '#F8D76E', 
    icon: 'IconTool',
    type: 'expense',
    bookId: 'my',
    order: 0
  },
  { 
    id: 'category1', 
    name: 'Name Category', 
    color: 'white', 
    icon: '',
    type: 'expense',
    bookId: 'my',
    order: 1
  },
  { 
    id: 'category2', 
    name: 'Name Category', 
    color: 'white', 
    icon: '',
    type: 'expense',
    bookId: 'family',
    order: 0
  },
  { 
    id: 'category3', 
    name: 'Name Category', 
    parentName: 'Parent name',
    color: 'white', 
    icon: '',
    type: 'expense',
    bookId: 'family',
    order: 1
  },
  { 
    id: 'category4', 
    name: 'Name Category', 
    parentName: 'Parent name',
    color: 'white', 
    icon: '',
    type: 'income',
    bookId: 'my',
    order: 0
  },
  { 
    id: 'category5', 
    name: 'Name Category', 
    color: 'white', 
    icon: '',
    type: 'income',
    bookId: 'family',
    order: 0
  },
];

// Отслеживаем видимость попапа
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Фильтруем категории по выбранным книге и типу
const filteredCategories = computed(() => {
  const allCategories = props.categories.length > 0 ? props.categories : defaultCategories;
  
  return allCategories.filter(category => 
    category.bookId === selectedBook.value && 
    category.type === selectedType.value
  );
});

// Сортированные категории для drag & drop
const sortedCategories = computed({
  get: () => {
    const filtered = [...filteredCategories.value];
    return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
  },
  set: (value) => {
    // Обновляем порядок при перетаскивании
    value.forEach((category, index) => {
      category.order = index;
    });
  }
});

// Выбор категории
const selectCategory = (category) => {
  emit('select', category);
};

// Сохранение порядка после перетаскивания
const saveOrder = () => {
  emit('reorder', sortedCategories.value);
};

// Добавление новой категории
const handleAddCategory = () => {
  emit('add', {
    bookId: selectedBook.value,
    type: selectedType.value
  });
};
</script>

<style scoped>
.category-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-top: 13px;
  margin-bottom: 32px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 10px;
  height: 38px;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 232px;
}

.category-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2px 0;
}

.category-parent-name {
  color: white;
  font-size: 10px;
  font-weight: 400;
  line-height: 12px;
}

.category-name {
  color: white;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
}

.category-drag-handle {
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: move;
}

.handle-icon {
  color: white;
  width: 20px;
  height: 20px;
}

.create-button-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.create-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 19px;
  border-radius: 34px;
  border: 1px solid white;
  background: transparent;
  color: white;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  cursor: pointer;
}

.create-icon {
  width: 10px;
  height: 10px;
  color: white;
}
</style>