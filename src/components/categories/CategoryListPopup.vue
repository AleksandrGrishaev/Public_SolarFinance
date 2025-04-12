<!-- src/components/categories/CategoryListPopup.vue -->
<template>
  <BasePopup 
    v-model="isVisible" 
    title="Category list" 
    :rightIcon="IconPlus"
    @rightIconClick="showAddCategoryPopup = true"
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
        <!-- Сначала родительские группы с дочерними категориями -->
        <div v-for="parentCategory in activeParentCategories" :key="parentCategory.id" class="category-group-wrapper">
          <div class="parent-category">
            <CategoryIcon 
              :icon-name="parentCategory.icon" 
              :background-color="parentCategory.color"
              size="xsmall" 
            />
            <div class="parent-name">{{ parentCategory.name }}</div>
          </div>
          
          <!-- Дочерние категории для данного родителя -->
          <div class="child-categories">
            <CategoryItem
              v-for="category in getActiveChildCategories(parentCategory.id)"
              :key="category.id"
              :category="category"
              :active="true"
              @select="selectCategory(category)"
              @toggle="toggleCategoryActive(category, $event)"
              @menu="handleCategoryMenu(category)"
            />
          </div>
        </div>
        
        <!-- Затем самостоятельные категории (без родителя и не являющиеся родителями) -->
        <div v-for="category in activeStandaloneCategories" :key="category.id">
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
        <!-- Аналогично для неактивных категорий -->
        <div v-for="parentCategory in inactiveParentCategories" :key="parentCategory.id" class="category-group-wrapper">
          <div class="parent-category">
            <CategoryIcon 
              :icon-name="parentCategory.icon" 
              :background-color="parentCategory.color"
              size="xsmall" 
            />
            <div class="parent-name">{{ parentCategory.name }}</div>
          </div>
          
          <div class="child-categories">
            <CategoryItem
              v-for="category in getInactiveChildCategories(parentCategory.id)"
              :key="category.id"
              :category="category"
              :active="false"
              @select="selectCategory(category)"
              @toggle="toggleCategoryActive(category, $event)"
              @menu="handleCategoryMenu(category)"
            />
          </div>
        </div>
        
        <div v-for="category in inactiveStandaloneCategories" :key="category.id">
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
      <CreateCategoryButton @click="showAddCategoryPopup = true" />
    </div>
  </BasePopup>

  <!-- New Category Add Popup -->
  <CategoryAddPopup
    v-model="showAddCategoryPopup"
    :initial-type="selectedType"
    :initial-book-id="selectedBook"
    @save="handleSaveNewCategory"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BasePopup from '../ui/BasePopup.vue';
import BookSelector from '../transactions/BookSelector.vue';
import TransactionTypeSelector from '../transactions/TransactionTypeSelector.vue';
import CategoryIcon from './CategoryIcon.vue';
import CategoryItem from './CategoryItem.vue';
import CategoryFilterToggle from './CategoryFilterToggle.vue';
import CreateCategoryButton from '../ui/CreateCategoryButton.vue';
import CategoryAddPopup from './CategoryAddPopup.vue';
import { IconPlus } from '@tabler/icons-vue';
import { 
  books,
  filterTransactionTypes,
  getCategoriesForBookAndType,
  getAllCategoriesForType,
  getSelectableCategoriesForType,
  getParentCategoriesWithChildren,
  hasChildCategories,
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
const showAddCategoryPopup = ref(false);

// Категории с флагом активности
const categoriesWithActiveState = ref<Category[]>([]);

// При открытии попапа, устанавливаем значения и инициализируем категории
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    selectedBook.value = props.initialBook;
    selectedType.value = props.initialType;
    
    // Получаем ВСЕ категории для данного типа транзакции
    const allCategoriesForType = getAllCategoriesForType(selectedType.value);
    
    // Получаем выбираемые категории для текущей книги
    const selectableCategories = getCategoriesForBookAndType(selectedBook.value, selectedType.value);
    
    // Создаем карту выбираемых категорий для быстрого поиска
    const selectableMap = new Map(selectableCategories.map(cat => [cat.id, cat]));
    
    // Формируем список всех категорий с флагом активности
    categoriesWithActiveState.value = allCategoriesForType.map(cat => {
      const isInSelectable = selectableMap.has(cat.id);
      return {
        ...cat,
        isActive: isInSelectable
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
    // Получаем ВСЕ категории для данного типа транзакции
    const allCategoriesForType = getAllCategoriesForType(selectedType.value);
    
    // Получаем выбираемые категории для текущей книги
    const selectableCategories = getCategoriesForBookAndType(selectedBook.value, selectedType.value);
    
    // Создаем карту выбираемых категорий для быстрого поиска
    const selectableMap = new Map(selectableCategories.map(cat => [cat.id, cat]));
    
    // Сохраняем предыдущее состояние активности категорий
    const activeStateMap = new Map(
      categoriesWithActiveState.value.map(cat => [cat.id, cat.isActive])
    );
    
    // Формируем список всех категорий с флагом активности
    categoriesWithActiveState.value = allCategoriesForType.map(cat => {
      const isInSelectable = selectableMap.has(cat.id);
      const wasActive = activeStateMap.has(cat.id) ? activeStateMap.get(cat.id) : false;
      
      return {
        ...cat,
        // Категория активна, если она в книге и была активна ранее
        isActive: isInSelectable && (wasActive || cat.id === 'renovation')
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

// Неактивные категории
const inactiveCategories = computed(() => {
  return categoriesWithActiveState.value
    .filter(cat => !cat.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});

// Активные родительские категории, у которых есть дочерние элементы
const activeParentCategories = computed(() => {
  // Находим все уникальные родительские ID среди активных категорий
  const parentIds = new Set();
  activeCategories.value.forEach(cat => {
    if (cat.parentId) {
      parentIds.add(cat.parentId);
    }
  });
  
  // Возвращаем все родительские категории для активных дочерних категорий
  return categoriesWithActiveState.value
    .filter(cat => parentIds.has(cat.id))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});

// Неактивные родительские категории с дочерними элементами
const inactiveParentCategories = computed(() => {
  // Находим все уникальные родительские ID среди неактивных категорий
  const parentIds = new Set();
  inactiveCategories.value.forEach(cat => {
    if (cat.parentId) {
      parentIds.add(cat.parentId);
    }
  });
  
  // Возвращаем все родительские категории для неактивных дочерних категорий
  return categoriesWithActiveState.value
    .filter(cat => parentIds.has(cat.id))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});

// Активные самостоятельные категории (без родителя и не являющиеся родителями)
const activeStandaloneCategories = computed(() => {
  return activeCategories.value
    .filter(cat => {
      // Категория не должна иметь родителя
      if (cat.parentId) return false;
      
      // И не должна иметь дочерних элементов
      if (hasChildCategories(cat.id)) return false;
      
      return true;
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});

// Неактивные самостоятельные категории
const inactiveStandaloneCategories = computed(() => {
  return inactiveCategories.value
    .filter(cat => {
      // Категория не должна иметь родителя
      if (cat.parentId) return false;
      
      // И не должна иметь дочерних элементов
      if (hasChildCategories(cat.id)) return false;
      
      return true;
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));
});

// Получение активных дочерних категорий для конкретного родителя
function getActiveChildCategories(parentId) {
  return activeCategories.value
    .filter(cat => cat.parentId === parentId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

// Получение неактивных дочерних категорий для конкретного родителя
function getInactiveChildCategories(parentId) {
  return inactiveCategories.value
    .filter(cat => cat.parentId === parentId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

// Выбор категории
const selectCategory = (category) => {
  // Проверяем, что выбранная категория не имеет дочерних элементов
  if (!hasChildCategories(category.id)) {
    emit('select', category);
  } else {
    // Если категория имеет дочерние элементы, не позволяем её выбрать
    console.log("Категория с дочерними элементами не может быть выбрана");
  }
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

// Обработка сохранения новой категории
const handleSaveNewCategory = (newCategory) => {
  console.log('New category saved:', newCategory);
  
  // Emit add event with the new category data
  emit('add', {
    category: newCategory,
    bookId: selectedBook.value,
    type: selectedType.value
  });
  
  // Close add category popup
  showAddCategoryPopup.value = false;
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

.category-group-wrapper {
  margin-bottom: 8px;
  border-radius: 8px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.03);
}

.parent-category {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  gap: 10px;
  background-color: rgba(255, 255, 255, 0.05);
}

.parent-name {
  color: white;
  font-size: 14px;
  font-weight: 500;
  line-height: 18px;
}

.child-categories {
  display: flex;
  flex-direction: column;
  padding-left: 10px;
}
</style>