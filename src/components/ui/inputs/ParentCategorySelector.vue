<!-- src/components/ui/inputs/ParentCategorySelector.vue -->
<template>
  <div class="parent-selector-container">
    <div class="dropdown-select" @click="isOpen = !isOpen">
      <span>{{ displayValue }}</span>
      <svg width="7" height="6" viewBox="0 0 7 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.05569 6L-0.000210353 0L1.19234 0L3.40973 4.60249L3.33519 4.56522H3.52153L3.447 4.60249L5.66439 0L6.85693 0L3.80103 6H3.05569Z" fill="currentColor"/>
      </svg>
    </div>
    
    <div v-if="isOpen" class="dropdown-menu">
      <div 
        class="dropdown-item no-parent"
        @click="selectParent(null)"
      >
        No parent
      </div>

      <div v-for="category in availableParents" :key="category.id">
        <div 
          class="dropdown-item"
          @click="selectParent(category)"
        >
          <div 
            class="category-color-dot" 
            :style="{ backgroundColor: category.color }"
          ></div>
          <span>{{ category.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCategoryStore } from '../../../stores/category/categoryStore';

const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  },
  categoryType: {
    type: String,
    default: 'expense'
  }
});
const emit = defineEmits(['update:modelValue']);
const isOpen = ref(false);

// Get category store
const categoryStore = useCategoryStore();

// Use the store's getParentCategoriesForType getter
const availableParents = computed(() => {
  return categoryStore.getParentCategoriesForType(props.categoryType);
});

// Rest of your code remains unchanged
// Отслеживаем изменение типа транзакции
watch(() => props.categoryType, () => {
  // Если тип сменился, и выбранная родительская категория не подходит,
  // то сбрасываем выбор
  if (props.modelValue && props.modelValue.type !== props.categoryType) {
    emit('update:modelValue', null);
  }
});

// Текст для отображения
const displayValue = computed(() => {
  return props.modelValue ? props.modelValue.name : 'Category';
});

// Выбор родительской категории
const selectParent = (category) => {
  emit('update:modelValue', category);
  isOpen.value = false;
};
</script>
<style scoped>
.parent-selector-container {
  position: relative;
  width: 100%;
}

.dropdown-select {
  height: var(--toggle-height);
  background-color: var(--bg-light);
  border-radius: var(--input-radius);
  padding: 0 var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: var(--bg-contrast);
  font-size: var(--font-small-size);
  cursor: pointer;
  transition: background-color var(--transition-speed) var(--transition-fn);
}

.dropdown-select:hover {
  background-color: var(--bg-light);
  opacity: var(--state-hover-opacity);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: var(--spacing-xs);
  background-color: var(--bg-contrast);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-sm) 0;
  z-index: var(--z-index-dropdown);
  max-height: 200px;
  overflow-y: auto;
  box-shadow: var(--shadow-md);
}

.dropdown-item {
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  color: var(--text-usual);
  font-size: var(--font-body-size);
  transition: background-color var(--transition-speed) var(--transition-fn);
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.no-parent {
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--spacing-xs);
  padding-bottom: var(--spacing-md);
}

.category-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
</style>