<!-- src/components/navigation/SubNavigation.vue -->
<template>
    <div class="sub-navigation-wrapper">
      <div class="sub-navigation-row">
        <div
          v-for="item in items"
          :key="item.route"
          class="icon-item"
          @click="navigateTo(item.route)"
        >
          <div class="icon-circle" :class="{ 'active': isActive(item.route) }" :style="{ backgroundColor: item.active ? item.background : 'white' }">
            <component :is="item.icon" size="24" stroke-width="1.5" color="#333" />
          </div>
          <div class="icon-label">{{ item.label }}</div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  
  // Определение типа элемента меню
  interface NavItem {
    label: string;
    route: string;
    icon: any;
    background: string;
    active?: boolean;
  }
  
  // Определение props
  const props = defineProps<{
    items: NavItem[];
  }>();
  
  const route = useRoute();
  const emit = defineEmits(['navigate']);
  
  // Проверяем, активен ли элемент на основе текущего маршрута
  const isActive = (path: string) => {
    return route.path.startsWith(path);
  };
  
  // Активный элемент для подсветки
  const activeItem = computed(() => {
    return props.items.find(item => isActive(item.route));
  });
  
  // Функция для навигации с отправкой события родителю
  const navigateTo = (path: string) => {
    emit('navigate', path);
  };
  </script>
  
  <style scoped>
  .sub-navigation-wrapper {
    width: 100%;
    position: relative;
    display: flex;
    justify-content: flex-end;
    padding: 0 16px;
  }
  
  .sub-navigation-row {
    display: flex;
    gap: 16px;
    justify-content: flex-end;
    margin-bottom: 10px;
  }
  
  .icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
  }
  
  .icon-circle {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
  }
  
  .icon-item:hover .icon-circle {
    transform: scale(1.05);
  }
  
  .icon-circle.active {
    background-color: #FFD452; /* Желтый цвет для активной иконки по умолчанию */
  }
  
  .icon-label {
    font-size: 10px;
    color: white;
    text-align: center;
  }
  </style>