<!-- src/components/categories/CategorySelector.vue -->
<template>
  <BasePopup 
    v-model="isVisible" 
    title="Select category" 
    :rightIcon="IconEdit"
    @rightIconClick="handleEditClick"
  >
    <div class="category-container">
      <div class="debug-info" v-if="debugMode">
        <div>Total categories: {{ props.categories.length }}</div>
        <div>Selectable: {{ selectableCategories.length }}</div>
        <div>With Parents: {{ categoriesWithParent.length }}</div>
        <div>Standalone: {{ standaloneCategories.length }}</div>
        <div>Unique Parents: {{ uniqueParentIds.length }}</div>
      </div>
      
      <!-- Группы категорий с родителями -->
      <template v-for="(parentId, index) in uniqueParentIds" :key="index">
        <div class="category-group" v-if="getParentCategory(parentId) && getCategoriesByParentId(parentId).length > 0">
          <div class="parent-label">{{ getParentCategory(parentId).name }}</div>
          
          <div class="category-line">
            <div 
              v-for="category in getCategoriesByParentId(parentId)"
              :key="category.id"
              class="category-item"
              @click="selectCategory(category)"
            >
              <CategoryIcon 
                :icon-name="category.icon" 
                :background-color="category.color" 
                size="small"
              />
              <div class="category-name">{{ truncateName(category.name) }}</div>
            </div>
          </div>
        </div>
      </template>

      <!-- Категории без родителя (не включая те, что уже отображаются как родители) -->
      <div v-if="standaloneCategories.length > 0" class="category-group">
        <div class="parent-label" v-if="categoriesWithParent.length > 0">Other</div>
        
        <div class="category-line">
          <div 
            v-for="category in standaloneCategories"
            :key="category.id"
            class="category-item"
            @click="selectCategory(category)"
          >
            <CategoryIcon 
              :icon-name="category.icon" 
              :background-color="category.color" 
              size="small"
            />
            <div class="category-name">{{ truncateName(category.name) }}</div>
          </div>
        </div>
      </div>
      
      <!-- Кнопка добавления категории (всегда отображается) -->
      <div class="category-group">
        <div class="category-line">
          <div class="category-item" @click="handleAddCategory">
            <div class="add-icon-container">
              <IconPlus class="add-icon" />
            </div>
            <div class="category-name">Add</div>
          </div>
        </div>
      </div>
      
      <!-- Пустое состояние - показываем, только если нет категорий -->
      <div v-if="selectableCategories.length === 0" class="empty-state">
        <div>No categories available</div>
        <div>Create a new category to get started</div>
      </div>
    </div>
  </BasePopup>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import BasePopup from '../ui/BasePopup.vue';
import CategoryIcon from './CategoryIcon.vue';
import { IconEdit, IconPlus } from '@tabler/icons-vue';

// Импортируем полный список категорий и вспомогательные функции
import { 
  categories, 
  hasChildCategories, 
  hasChildCategoriesInBook, 
  getChildCategoriesInBook,
  getAllCategoriesForBookAndType,
  type Category 
} from '../../data/categories';

// Режим отладки (установите в true, чтобы видеть отладочную информацию)
const debugMode = ref(true);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  },
  bookId: {
    type: String,
    default: 'my'
  },
  transactionType: {
    type: String,
    default: 'expense'
  }
});

const emit = defineEmits(['update:modelValue', 'select', 'add', 'edit']);

// Видимость попапа
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Отфильтрованные категории - принимаем их уже отфильтрованными
const filteredCategories = computed(() => {
  if (!props.categories || props.categories.length === 0) return [];
  console.log('Filtered categories for selector:', props.categories);
  return props.categories;
});

// Категории, которые можно выбрать - все, что пришли в props
const selectableCategories = computed(() => {
  return filteredCategories.value;
});

// Категории с родителем (подкатегории)
const categoriesWithParent = computed(() => {
  return selectableCategories.value.filter(cat => cat.parentId);
});

// Уникальные ID родителей для группировки
const uniqueParentIds = computed(() => {
  const parentIds = new Set();
  categoriesWithParent.value.forEach(cat => {
    if (cat.parentId) {
      parentIds.add(cat.parentId);
    }
  });
  return Array.from(parentIds);
});

// Категории без родителя (не включая те, что уже отображаются как родители)
const standaloneCategories = computed(() => {
  // Получаем все ID родительских категорий, у которых есть отображаемые дочерние элементы
  const parentIdsWithDisplayedChildren = new Set();
  categoriesWithParent.value.forEach(cat => {
    if (cat.parentId) {
      parentIdsWithDisplayedChildren.add(cat.parentId);
    }
  });
  
  // Возвращаем категории без родителя, исключая те, которые уже отображаются как родители
  return selectableCategories.value.filter(cat => 
    !cat.parentId && !parentIdsWithDisplayedChildren.has(cat.id)
  );
});

// Получение родительской категории по ID
function getParentCategory(parentId) {
  // Сначала ищем в списке категорий, пришедших через props
  const parent = props.categories.find(cat => cat.id === parentId);
  if (parent) return parent;
  
  // Если не нашли (возможно, родительская категория неактивна), 
  // ищем в полном списке категорий из импортированного модуля categories
  const globalParent = categories.find(cat => cat.id === parentId);
  
  // Проверяем, что родительская категория принадлежит текущей книге
  if (globalParent && globalParent.books?.includes(props.bookId)) {
    return globalParent;
  }
  
  return null;
}

// Получение категорий по ID родителя
function getCategoriesByParentId(parentId) {
  return categoriesWithParent.value.filter(cat => cat.parentId === parentId);
}

// Усечение длинных названий
const truncateName = (name) => {
  if (!name) return '';
  if (name.length > 8) {
    return name.substring(0, 8) + '...';
  }
  return name;
};

// Выбор категории
const selectCategory = (category) => {
  // Проверяем, что выбранная категория не имеет дочерних элементов в текущей книге
  if (!hasChildCategoriesInBook(category.id, props.bookId)) {
    emit('select', category);
    isVisible.value = false;
  } else {
    console.log("Категория с дочерними элементами не может быть выбрана");
    // Можно добавить уведомление пользователю, что нельзя выбрать категорию с подкатегориями
  }
};

// Добавление новой категории
const handleAddCategory = () => {
  emit('add');
};

// Редактирование категорий
const handleEditClick = () => {
  emit('edit');
};
</script>

<style scoped>
.category-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
  padding: 8px 0 16px;
}

.debug-info {
  padding: 4px 16px;
  background-color: rgba(255, 255, 255, 0.1);
  color: yellow;
  font-size: 12px;
  margin-bottom: 8px;
}

.category-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-bottom: 8px;
}

.parent-label {
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.category-line {
  display: flex;
  flex-wrap: wrap;
  padding: 0 16px;
  width: 100%;
  box-sizing: border-box;
  gap: 16px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  width: 56px;
}

.category-name {
  color: white;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-icon-container {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border: 1px solid #949496;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-icon {
  width: 20px;
  height: 20px;
  color: #949496;
}

.empty-state {
  text-align: center;
  color: #949496;
  padding: 16px;
  font-size: 14px;
  line-height: 20px;
}
</style>