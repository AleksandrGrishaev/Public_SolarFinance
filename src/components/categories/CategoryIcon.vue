<!-- src/components/categories/CategoryIcon.vue -->
<template>
  <div 
    class="category-icon" 
    :class="[sizeClass]"
    :style="{ backgroundColor: backgroundColor }"
  >
    <component 
      v-if="iconComponent" 
      :is="iconComponent" 
      class="icon" 
      :size="iconSize"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import * as TablerIcons from '@tabler/icons-vue';

const props = defineProps({
  iconName: {
    type: String,
    default: ''
  },
  backgroundColor: {
    type: String,
    default: '#949496'
  },
  size: {
    type: String,
    default: 'medium', // xsmall, small, medium, large
  }
});

// Соответствие размеров в пикселях
const sizeMap = {
  xsmall: 30,
  small: 40,
  medium: 50,
  large: 60
};

// CSS класс для размера
const sizeClass = computed(() => `size-${props.size}`);

// Размер иконки относительно контейнера
const iconSize = computed(() => {
  const containerSize = sizeMap[props.size] || sizeMap.medium;
  return Math.floor(containerSize * 0.5);
});

// Получаем компонент иконки из имени
const iconComponent = computed(() => {
  if (!props.iconName) return null;
  
  // Преобразуем имя иконки в компонент Tabler
  const iconKey = props.iconName.startsWith('Icon') 
    ? props.iconName 
    : `Icon${props.iconName}`;
  
  return TablerIcons[iconKey] || null;
});
</script>

<style scoped>
.category-icon {
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.icon {
  color: #404040;
}

.size-xsmall {
  width: 30px;
  height: 30px;
}

.size-small {
  width: 40px;
  height: 40px;
}

.size-medium {
  width: 50px;
  height: 50px;
}

.size-large {
  width: 60px;
  height: 60px;
}
</style>