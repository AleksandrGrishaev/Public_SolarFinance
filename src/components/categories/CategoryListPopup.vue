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
          :books="books" 
          v-model="selectedBook"
        />
        
        <transaction-type-selector 
          :types="filterTransactionTypes" 
          v-model="selectedType" 
        />
      </div>

      <!-- Список активных категорий -->
      <div class="category-list">
        <div 
          v-for="category in activeCategories" 
          :key="category.id"
        >
          <CategoryItem
            :category="category"
            :active="true"
            @select="selectCategory(category)"
            @toggle="toggleCategoryActive(category, $event)"
            @menu="handleCategoryMenu(category)"
          />
        </div>
      </div>

      <!-- Переключатель для неактивных категорий -->
      <CategoryFilterToggle
        v-model="showInactiveCategories"
      />

      <!-- Список неактивных категорий -->
      <div v-if="showInactiveCategories" class="category-list inactive-list">
        <div 
          v-for="category in inactiveCategories" 
          :key="category.id"
        >
          <CategoryItem
            :category="category"
            :active="false"
            @select="selectCategory(category)"
            @toggle="toggleCategoryActive(category, $event)"
            @menu="handleCategoryMenu(category)"
          />
        </div>
      </div>

      <!-- Кнопка создания новой категории -->
      <CreateCategoryButton @click="handleAddCategory" />
    </div>
  </BasePopup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BasePopup from '../ui/BasePopup.vue';
import BookSelector from '../transactions/BookSelector.vue';
import TransactionTypeSelector from '../transactions/TransactionTypeSelector.vue';
import CategoryItem from './CategoryItem.vue';
import CategoryFilterToggle from './CategoryFilterToggle.vue';
import CreateCategoryButton from '../ui/CreateCategoryButton.vue';
import { IconPlus } from '@tabler/icons-vue';
import { 
  books,
  filterTransactionTypes,
  getCategoriesForBookAndType,
  getAllCategoriesForType,
  type Category
} from '../../data/categories';

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

const emit = defineEmits(['update:modelValue', 'select', 'add', 'edit', 'reorder', 'toggleActive']);

// Состояние
const selectedBook = ref(props.initialBook);
const selectedType = ref(props.initialType);
const showInactiveCategories = ref(false);

// Категории с флагом активности
const categoriesWithActiveState = ref<Category[]>([]);

// При открытии попапа, устанавливаем переданные значения фильтров и инициализируем категории
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    selectedBook.value = props.initialBook;
    selectedType.value = props.initialType;
    
    // Получаем категории для текущей книги и типа транзакции
    const bookCategories = getCategoriesForBookAndType(selectedBook.value, selectedType.value);
    
    // Получаем все категории для данного типа транзакции (включая те, которые еще не добавлены в книгу)
    const allCategoriesForType = getAllCategoriesForType(selectedType.value);
    
    // Создаем карту категорий из книги для быстрого поиска
    const bookCategoryMap = new Map(bookCategories.map(cat => [cat.id, cat]));
    
    // Формируем список всех категорий с флагом активности
    categoriesWithActiveState.value = allCategoriesForType.map(cat => {
      const isInBook = bookCategoryMap.has(cat.id);
      return {
        ...cat,
        isActive: isInBook && (bookCategoryMap.get(cat.id)?.isActive || cat.id === 'renovation')
      };
    });
  }
});

// При изменении внешних значений, обновляем внутренние
watch(() => props.initialBook, (newValue) => {
  selectedBook.value = newValue;
});

watch(() => props.initialType, (newValue) => {
  selectedType.value = newValue;
});

// При изменении книги или типа транзакции, обновляем список категорий
watch([selectedBook, selectedType], () => {
  if (props.modelValue) {
    // Получаем категории для текущей книги и типа транзакции
    const bookCategories = getCategoriesForBookAndType(selectedBook.value, selectedType.value);
    
    // Получаем все категории для данного типа транзакции
    const allCategoriesForType = getAllCategoriesForType(selectedType.value);
    
    // Создаем карту категорий из книги для быстрого поиска
    const bookCategoryMap = new Map(bookCategories.map(cat => [cat.id, cat]));
    
    // Сохраняем предыдущее состояние активности категорий
    const activeStateMap = new Map(
      categoriesWithActiveState.value.map(cat => [cat.id, cat.isActive])
    );
    
    // Формируем список всех категорий с флагом активности
    categoriesWithActiveState.value = allCategoriesForType.map(cat => {
      const isInBook = bookCategoryMap.has(cat.id);
      const wasActive = activeStateMap.has(cat.id) ? activeStateMap.get(cat.id) : false;
      
      return {
        ...cat,
        // Категория активна, если она в книге и была активна ранее, или это категория "Renovation"
        isActive: isInBook && (wasActive || cat.id === 'renovation')
      };
    });
  }
});

// Отслеживаем видимость попапа
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Активные категории (те, которые отмечены как активные)
const activeCategories = computed(() => {
  return categoriesWithActiveState.value
    .filter(cat => cat.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});

// Неактивные категории (все доступные категории, которые не активны)
const inactiveCategories = computed(() => {
  return categoriesWithActiveState.value
    .filter(cat => !cat.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});

// Выбор категории
const selectCategory = (category) => {
  emit('select', category);
};

// Переключение активности категории
const toggleCategoryActive = (category, isActive) => {
  const index = categoriesWithActiveState.value.findIndex(c => c.id === category.id);
  if (index !== -1) {
    categoriesWithActiveState.value[index].isActive = isActive;
    
    // Отправляем событие об изменении активности категории
    emit('toggleActive', {
      category,
      isActive,
      bookId: selectedBook.value
    });
  }
};

// Обработка меню категории
const handleCategoryMenu = (category) => {
  emit('edit', category);
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
}

.inactive-list {
  margin-top: 0;
  opacity: 0.7;
}
</style>