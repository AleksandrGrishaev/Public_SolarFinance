<!-- src/components/categories/CategoryListGrouped.vue -->
<template>
  <div class="category-group">
    <!-- Родительская категория (заголовок группы) -->
    <div v-if="parentCategory" class="parent-category">
      <CategoryIcon 
        :icon-name="parentCategory.icon" 
        :background-color="parentCategory.color"
        size="xsmall" 
      />
      <div class="parent-name">{{ parentCategory.name }}</div>
    </div>
    
    <!-- Дочерние категории -->
    <div class="child-categories">
      <CategoryItem
        v-for="category in childCategories"
        :key="category.id"
        :category="category"
        :active="isActive(category)"
        @select="selectCategory(category)"
        @toggle="toggleCategoryActive(category, $event)"
        @menu="handleCategoryMenu(category)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CategoryIcon from './CategoryIcon.vue';
import CategoryItem from './CategoryItem.vue';
import { useCategoryStore, Category } from '../../stores/category';

const categoryStore = useCategoryStore();

const props = defineProps({
  parentCategory: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    required: true
  },
  activeCategories: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['select', 'toggle', 'menu']);

// Получаем список дочерних категорий для родительской категории
const childCategories = computed(() => {
  if (!props.parentCategory) {
    // Если нет родительской категории, возвращаем категории без родителя
    return props.categories.filter(cat => !cat.parentId);
  }
  
  // Иначе возвращаем дочерние категории для данного родителя
  return props.categories.filter(cat => cat.parentId === props.parentCategory.id);
});

// Проверка, активна ли категория
function isActive(category) {
  return props.activeCategories.some(cat => cat.id === category.id);
}

// Выбор категории
function selectCategory(category) {
  emit('select', category);
}

// Переключение активности категории
function toggleCategoryActive(category, isActive) {
  emit('toggle', { category, isActive });
}

// Обработка меню категории
function handleCategoryMenu(category) {
  emit('menu', category);
}
</script>

<style scoped>
.category-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.parent-category {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  gap: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px 8px 0 0;
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
  padding-left: 16px;
}
</style>