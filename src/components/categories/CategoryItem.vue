<!-- src/components/categories/CategoryItem.vue -->
<template>
    <div 
      class="category-item"
      @click="$emit('select')"
    >
      <div class="category-info">
        <CategoryIcon 
          :iconName="category.icon" 
          :backgroundColor="category.color"
          size="xsmall" 
        />
        
        <div class="category-text">
          <div v-if="category.parentName" class="category-parent-name">{{ category.parentName }}</div>
          <div class="category-name">{{ category.name }}</div>
        </div>
      </div>
      
      <div class="category-actions">
        <div class="toggle-wrapper" @click.stop="toggleActive">
          <component 
            :is="isActive ? IconToggleRight : IconToggleLeft" 
            class="toggle-icon"
          />
        </div>
        
        <div class="menu-wrapper" @click.stop="$emit('menu')">
          <IconMenu2 class="menu-icon" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import CategoryIcon from './CategoryIcon.vue';
  import { IconMenu2, IconToggleRight, IconToggleLeft } from '@tabler/icons-vue';
  
  const props = defineProps({
    category: {
      type: Object,
      required: true
    },
    active: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['select', 'toggle', 'menu']);
  
  const isActive = ref(props.active);
  
  function toggleActive() {
    isActive.value = !isActive.value;
    emit('toggle', isActive.value);
  }
  </script>
  
  <style scoped>
  .category-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2px 10px;
    height: 38px;
    width: 100%;
    box-sizing: border-box;
    cursor: pointer;
  }
  
  .category-info {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 232px;
  }
  
  .category-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2px 0;
  }
  
  .category-parent-name {
    color: white;
    font-size: 10px;
    font-weight: 400;
    line-height: 12px;
  }
  
  .category-name {
    color: white;
    font-size: 16px;
    font-weight: 400;
    line-height: 20px;
  }
  
  .category-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .toggle-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .toggle-icon {
    color: white;
    width: 33px;
    height: 18px;
  }
  
  .menu-wrapper {
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .menu-icon {
    color: white;
    width: 20px;
    height: 20px;
  }
  </style>