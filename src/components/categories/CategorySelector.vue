<!-- src/components/categories/CategorySelector.vue -->
<template>
  <BasePopup 
    v-model="isVisible" 
    title="Select category" 
    :rightIcon="IconEdit"
    @rightIconClick="handleEditClick"
  >
    <div class="category-container">
      <!-- First row of categories (up to 5 categories) -->
      <div class="category-line">
        <template v-for="(category, index) in activeCategories" :key="category.id">
          <div 
            v-if="index < 5"
            class="category-item"
            @click="selectCategory(category)"
          >
            <CategoryIcon 
              :iconName="category.icon" 
              :backgroundColor="category.color" 
            />
            <div class="category-name">{{ truncateName(category.name) }}</div>
          </div>
        </template>
      </div>

      <!-- Second row of categories (5-8) plus add button -->
      <div class="category-line">
        <template v-for="(category, index) in activeCategories" :key="category.id">
          <div 
            v-if="index >= 5 && index < 9"
            class="category-item"
            @click="selectCategory(category)"
          >
            <CategoryIcon 
              :iconName="category.icon" 
              :backgroundColor="category.color" 
            />
            <div class="category-name">{{ truncateName(category.name) }}</div>
          </div>
        </template>
        
        <div class="category-item" @click="handleAddCategory">
          <div class="add-icon-container">
            <IconPlus class="add-icon" />
          </div>
        </div>
      </div>
    </div>
  </BasePopup>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BasePopup from '../ui/BasePopup.vue';
import CategoryIcon from './CategoryIcon.vue';
import { IconEdit, IconPlus } from '@tabler/icons-vue';

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

// Используем только активные категории для текущей книги и типа транзакции
const activeCategories = computed(() => {
  if (props.categories && props.categories.length) {
    // Filter categories that are active and match the current book and transaction type
    return props.categories
      .filter(category => category.isActive)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  return [];
});

const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const truncateName = (name) => {
  if (name.length > 6) {
    return name.substring(0, 6) + '...';
  }
  return name;
};

const selectCategory = (category) => {
  emit('select', category);
  isVisible.value = false;
};

const handleAddCategory = () => {
  emit('add');
};

const handleEditClick = () => {
  emit('edit');
};
</script>

<style scoped>
.category-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
}

.category-line {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 10px 16px;
  width: 100%;
  box-sizing: border-box;
}

/* For iPhone and similar width devices */
@media screen and (max-width: 375px) {
  .category-line {
    gap: 23px;
    justify-content: flex-start;
  }
}

/* For larger screens */
@media screen and (min-width: 376px) {
  .category-line {
    gap: 25px;
    justify-content: flex-start;
  }
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-bottom: 10px;
  cursor: pointer;
  /* Fix the width to avoid layout shifts */
  width: 50px;
}

.category-name {
  color: white;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  max-width: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-icon-container {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  border: 1px solid #949496;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-icon {
  width: 24px;
  height: 24px;
  color: #949496;
}

/* Empty state message when no categories are available */
.empty-state {
  text-align: center;
  color: #949496;
  padding: 20px;
}
</style>