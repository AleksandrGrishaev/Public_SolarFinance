<!-- src/components/ui/inputs/ParentCategorySelector.vue -->
<template>
    <div class="parent-selector-container">
      <div class="dropdown-select" @click="isOpen = !isOpen">
        <span>{{ displayValue }}</span>
        <IconChevronDown size="14" />
      </div>
      
      <div v-if="isOpen" class="dropdown-menu">
        <div 
          class="dropdown-item no-parent"
          @click="selectParent(null)"
        >
          No parent
        </div>
        <div 
          v-for="category in availableParents" 
          :key="category.id"
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
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import { IconChevronDown } from '@tabler/icons-vue';
  
  const props = defineProps({
    modelValue: {
      type: Object,
      default: null
    },
    availableParents: {
      type: Array,
      default: () => []
    }
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  const isOpen = ref(false);
  
  const displayValue = computed(() => {
    return props.modelValue ? props.modelValue.name : 'Category';
  });
  
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