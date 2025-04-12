<!-- src/components/ui/inputs/ParentCategorySelector.vue -->
<template>
    <div class="parent-selector-container">
      <div class="dropdown-select" @click="isOpen = !isOpen">
        <span>{{ displayValue }}</span>
        <svg width="7" height="6" viewBox="0 0 7 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.05569 6L-0.000210353 0L1.19234 0L3.40973 4.60249L3.33519 4.56522H3.52153L3.447 4.60249L5.66439 0L6.85693 0L3.80103 6H3.05569Z" fill="#404040"/>
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
  import { getParentCategoriesForType } from '../../../data/categories';
  
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
  
  // Получаем доступные родительские категории для текущего типа транзакции
  const availableParents = computed(() => {
    return getParentCategoriesForType(props.categoryType);
  });
  
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
    height: 32px;
    background-color: #949496;
    border-radius: 14px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: #404040;
    font-size: 12px;
    cursor: pointer;
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background-color: #555555;
    border-radius: 8px;
    padding: 8px 0;
    z-index: 10;
    max-height: 200px;
    overflow-y: auto;
  }
  
  .dropdown-item {
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: #DBDADD;
    font-size: 14px;
  }
  
  .dropdown-item:hover {
    background-color: #666666;
  }
  
  .no-parent {
    border-bottom: 1px solid #666666;
    margin-bottom: 4px;
    padding-bottom: 12px;
  }
  
  .category-color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  </style>