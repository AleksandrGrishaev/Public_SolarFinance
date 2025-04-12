<!-- src/components/transactions/CategorySelector.vue -->
<template>
  <BasePopup 
    v-model="isVisible" 
    title="Select category" 
    :rightIcon="IconEdit"
    @rightIconClick="handleEditClick"
  >
    <div class="category-container">
      <div class="category-line">
        <template v-for="(category, index) in displayedCategories" :key="category.id">
          <div 
            v-if="index < Math.min(displayedCategories.length, 5)"
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

      <div class="category-line">
        <template v-for="(category, index) in displayedCategories" :key="category.id">
          <div 
            v-if="index >= 5 && index < Math.min(displayedCategories.length, 9)"
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
  }
});

const emit = defineEmits(['update:modelValue', 'select', 'add', 'edit']);

// If no categories are provided, use these mockup categories
const defaultCategories = [
  { id: 'renovation', name: 'Renovation', color: '#F5C54C', icon: 'IconTool' },
  { id: 'food', name: 'Food', color: '#A2C94F', icon: 'IconBread' },
  { id: 'transport', name: 'Transport', color: '#70B1E0', icon: 'IconCar' },
  { id: 'entertainment', name: 'Entertainment', color: '#E882A3', icon: 'IconDeviceTv' },
  { id: 'utilities', name: 'Utilities', color: '#8F7ED8', icon: 'IconHome' },
  { id: 'health', name: 'Health', color: '#D85A5A', icon: 'IconHeartbeat' },
  { id: 'education', name: 'Education', color: '#5AD8B9', icon: 'IconBook' },
  { id: 'shopping', name: 'Shopping', color: '#D8A55A', icon: 'IconShoppingCart' },
];

const displayedCategories = computed(() => {
  return props.categories.length > 0 ? props.categories : defaultCategories;
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
</style>