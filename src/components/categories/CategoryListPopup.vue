<!-- src/components/categories/CategoryListPopup.vue -->
<!-- src/components/categories/CategoryListPopup.vue -->
<template>
  <BasePopup 
    v-model="isVisible" 
    title="Edit category list" 
    :rightIcon="IconPlus"
    @rightIconClick="showAddCategoryPopup = true"
  >
    <div class="category-list-container">
      <!-- Фильтры -->
      <div class="filters">
        <book-selector 
          :books="categoryStore.allBooks" 
          v-model="selectedBook"
        />
        
        <transaction-type-selector 
          :types="categoryStore.allFilterTransactionTypes" 
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

  <!-- Category View Popup -->
<CategoryViewPopup
  v-model="showCategoryViewPopup"
  :categoryId="selectedCategoryId"
  @edit="handleCategoryMenu"
/>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BasePopup from '../ui/BasePopup.vue';
import BookSelector from "../../views/transaction/components/BookSelector.vue";
import TransactionTypeSelector from '../../views/transaction/components/TransactionTypeSelector.vue';
import CategoryIcon from './CategoryIcon.vue';
import CategoryItem from './CategoryItem.vue';
import CategoryFilterToggle from './CategoryFilterToggle.vue';
import CreateCategoryButton from '../ui/CreateCategoryButton.vue';
import CategoryAddPopup from './CategoryAddPopup.vue';
import { IconPlus } from '@tabler/icons-vue';
import CategoryViewPopup from './CategoryViewPopup.vue';


// Импортируем категории из нового хранилища
import { useCategoryStore, Category } from '../../stores/category';

const categoryStore = useCategoryStore();

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
const showCategoryViewPopup = ref(false);
const selectedCategoryId = ref('');
// Категории с флагом активности и принадлежности к книге
const categoriesWithActiveState = ref<(Category & { isInBook?: boolean })[]>([]);

// При открытии попапа, устанавливаем значения и инициализируем категории
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    selectedBook.value = props.initialBook;
    selectedType.value = props.initialType;
    
    // Получаем ВСЕ категории для данного типа транзакции
    const allCategoriesForType = categoryStore.getAllCategoriesForType(selectedType.value);
    
    // Получаем категории для текущей книги и типа
    const allCategoriesInBook = categoryStore.getAllCategoriesForBookAndType(selectedBook.value, selectedType.value);
    const activeCategoriesInBook = categoryStore.getActiveCategoriesForBookAndType(selectedBook.value, selectedType.value);
    
    // Формируем список всех категорий с флагом активности
    categoriesWithActiveState.value = allCategoriesForType.map(cat => {
      // Категория активна, если она активна в данной книге
      const isActive = activeCategoriesInBook.some(c => c.id === cat.id);
      
      // Проверяем, принадлежит ли категория выбранной книге
      const isInBook = allCategoriesInBook.some(c => c.id === cat.id);
      
      return {
        ...cat,
        isActive,
        isInBook
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
    const allCategoriesForType = categoryStore.getAllCategoriesForType(selectedType.value);
    
    // Получаем категории для текущей книги и типа
    const allCategoriesInBook = categoryStore.getAllCategoriesForBookAndType(selectedBook.value, selectedType.value);
    const activeCategoriesInBook = categoryStore.getActiveCategoriesForBookAndType(selectedBook.value, selectedType.value);
    
    // Сохраняем предыдущее состояние активности категорий
    const activeStateMap = new Map(
      categoriesWithActiveState.value.map(cat => [cat.id, cat.isActive])
    );
    
    // Формируем список всех категорий с флагом активности
    categoriesWithActiveState.value = allCategoriesForType.map(cat => {
      // Категория активна, если она активна в данной книге
      const isActive = activeCategoriesInBook.some(c => c.id === cat.id);
      
      // Проверяем, принадлежит ли категория выбранной книге
      const isInBook = allCategoriesInBook.some(c => c.id === cat.id);
      
      // Сохраняем предыдущее состояние активности, если оно было
      const wasActive = activeStateMap.has(cat.id) ? activeStateMap.get(cat.id) : false;
      
      return {
        ...cat,
        // Категория активна, если она активна в книге или была активна ранее
        isActive: isActive || (wasActive && isInBook),
        isInBook
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
      
      // И не должна иметь дочерних элементов в выбранной книге
      // или не должна быть родителем для активных категорий
      if (activeParentCategories.value.some(parent => parent.id === cat.id)) {
        return false;
      }
      
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
      
      // И не должна быть родителем для неактивных категорий
      if (inactiveParentCategories.value.some(parent => parent.id === cat.id)) {
        return false;
      }
      
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
  if (!categoryStore.hasChildCategories(category.id)) {
    // Открываем просмотр категории вместо эмита события
    selectedCategoryId.value = category.id;
    showCategoryViewPopup.value = true;
  } else {
    // Если категория имеет дочерние элементы, не позволяем её выбрать
    console.log("Категория с дочерними элементами не может быть выбрана");
  }
};

// Переключение активности категории
const toggleCategoryActive = (category, isActive) => {
  const index = categoriesWithActiveState.value.findIndex(c => c.id === category.id);
  if (index !== -1) {
    // Обновляем статус активности
    categoriesWithActiveState.value[index].isActive = isActive;
    
    // Если категория стала активной, убеждаемся, что она принадлежит выбранной книге
    if (isActive) {
      // Добавляем книгу в список книг категории, если её там нет
      categoryStore.addCategoryToBook(category.id, selectedBook.value);
      categoriesWithActiveState.value[index].isInBook = true;
    }
    
    // Обновляем статус активности в store
    categoryStore.toggleCategoryActive(category.id, isActive);
    
    // Отправляем событие об изменении активности категории
    emit('toggleActive', {
      category: {
        ...category,
        isActive
      },
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
  
  // Добавляем новую категорию через store
  const categoryWithBooks = {
    ...newCategory,
    books: [selectedBook.value],
    isActive: true
  };
  
  // Добавляем категорию через store
  const addedCategory = categoryStore.addCategory(categoryWithBooks);
  
  // Emit add event with the new category data
  emit('add', {
    category: addedCategory,
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
