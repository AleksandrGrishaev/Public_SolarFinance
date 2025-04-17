<!-- src/components/categories/CategorySelector.vue -->
<template>
  <BasePopup 
    v-model="isVisible" 
    title="Select category" 
    :rightIcon="IconEdit"
    @rightIconClick="handleEditClick"
    @update:modelValue="handleVisibilityChange"
  >
    <div class="category-container">
      <div class="debug-info" v-if="debugMode">
        <div>Total categories: {{ props.categories.length }}</div>
        <div>Selectable: {{ selectableCategories.length }}</div>
        <div>Items per row: {{ layoutState.itemsPerRow }}</div>
        <div>Item size: {{ layoutState.itemSize }}px</div>
        <div>Grid width: {{ layoutState.gridWidth }}px</div>
        <div>Max name length: {{ maxNameLength }}</div>
      </div>
      
      <!-- Динамически адаптируемая сетка категорий -->
      <div class="category-grid" ref="gridRef">
        <div 
          v-for="category in selectableCategories"
          :key="category.id"
          class="category-item"
          :style="categoryItemStyle"
          @click="selectCategory(category)"
        >
          <CategoryIcon 
            :icon-name="category.icon" 
            :background-color="category.color" 
            :size="iconSize"
          />
          <div class="category-name">{{ truncateName(category.name) }}</div>
        </div>
        
        <!-- Кнопка добавления категории (всегда отображается) -->
        <div 
          class="category-item" 
          :style="categoryItemStyle"
          @click="handleAddCategory"
        >
          <div class="add-icon-container" :style="addIconStyle">
            <IconPlus class="add-icon" :style="plusIconStyle" />
          </div>
          <div class="category-name">Add</div>
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
import { computed, ref, onMounted, onUpdated, nextTick, watch } from 'vue';
import BasePopup from '../ui/BasePopup.vue';
import CategoryIcon from './CategoryIcon.vue';
import { IconEdit, IconPlus } from '@tabler/icons-vue';
import { useCategoryStore, type Category } from '../../stores/category';
import { messageService } from '../../services/system/MessageService';

const categoryStore = useCategoryStore();

// Режим отладки (установите в true, чтобы видеть отладочную информацию)
const debugMode = ref(false);

// Ссылка на DOM элемент grid-контейнера
const gridRef = ref(null);

// Состояние адаптивного дизайна
const layoutState = ref({
  itemsPerRow: 4,
  itemSize: 56,
  gridWidth: 0,
  calculatedItemWidth: 0
});

// Максимальная длина имени категории (будет вычисляться динамически)
const maxNameLength = computed(() => {
  // Для маленьких экранов используем меньшую длину
  if (layoutState.value.itemsPerRow === 4) {
    return 8; // 8 символов для 4 элементов в ряду
  } else {
    return 10; // 10 символов для 5 элементов в ряду
  }
});

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

// Обработчик изменения видимости
const handleVisibilityChange = (value: boolean) => {
  if (!value) {
    // Если закрываем попап без выбора категории, показываем сообщение
    if (props.transactionType !== 'transfer') {
      messageService.warning('Операция не сохранена. Для создания транзакции необходимо выбрать категорию.');
    }
  }
};

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

// Стили для категорий, динамически вычисленные на основе размера контейнера
const categoryItemStyle = computed(() => {
  const { itemsPerRow } = layoutState.value;
  const gap = 4; // Уменьшенное расстояние между элементами (4px)
  const width = `calc(${100 / itemsPerRow}% - ${(gap * (itemsPerRow - 1)) / itemsPerRow}px)`;
  
  return {
    width
  };
});

// Стили для иконки добавления
const addIconStyle = computed(() => {
  const { itemSize } = layoutState.value;
  return {
    width: `${itemSize}px`,
    height: `${itemSize}px`,
    borderRadius: `${itemSize / 2}px`
  };
});

// Стили для значка "+"
const plusIconStyle = computed(() => {
  const { itemSize } = layoutState.value;
  const iconSize = Math.max(itemSize / 2, 20); // Минимум 20px для видимости
  return {
    width: `${iconSize}px`,
    height: `${iconSize}px`
  };
});

// Размер иконки для CategoryIcon компонента
const iconSize = computed(() => {
  const { itemSize } = layoutState.value;
  if (itemSize <= 45) return 'small';
  if (itemSize <= 56) return 'medium';
  return 'large';
});

// Функция для расчета оптимального размещения
const calculateLayout = () => {
  if (!gridRef.value) return;
  
  // Измеряем текущую ширину grid-контейнера
  const gridWidth = gridRef.value.clientWidth;
  const gap = 4; // Отступ между элементами (уменьшен до 4px)
  const minItemSize = 45; // Минимальный размер иконки
  const optimalItemSize = 56; // Оптимальный размер иконки
  
  // Определяем оптимальное количество элементов в ряду
  let itemsPerRow = 4; // По умолчанию 4 элемента
  
  const screenWidth = window.innerWidth;
  if (screenWidth >= 390) {
    // Проверяем, поместятся ли 5 элементов
    const availableWidthFor5 = gridWidth - (gap * 4);
    const itemWidthFor5 = availableWidthFor5 / 5;
    
    if (itemWidthFor5 >= minItemSize) {
      itemsPerRow = 5;
    }
  }
  
  // Вычисляем размер элемента на основе доступного пространства
  const totalGapWidth = gap * (itemsPerRow - 1);
  const availableWidth = gridWidth - totalGapWidth;
  const calculatedItemWidth = availableWidth / itemsPerRow;
  
  // Определяем итоговый размер иконки 
  let itemSize = Math.min(calculatedItemWidth, optimalItemSize);
  itemSize = Math.max(itemSize, minItemSize); // Не меньше минимального
  
  if (debugMode.value) {
    console.log('Grid width:', gridWidth);
    console.log('Items per row:', itemsPerRow);
    console.log('Calculated item width:', calculatedItemWidth);
    console.log('Item size:', itemSize);
  }
  
  // Обновляем состояние
  layoutState.value = {
    itemsPerRow,
    itemSize,
    gridWidth,
    calculatedItemWidth
  };
};

// Обработчик изменения размера окна
const handleResize = () => {
  calculateLayout();
};

// Инициализация и обновление при изменении видимости
onMounted(() => {
  if (isVisible.value) {
    nextTick(() => {
      calculateLayout();
    });
  }
  window.addEventListener('resize', handleResize);
});

onUpdated(() => {
  if (isVisible.value) {
    nextTick(() => {
      calculateLayout();
    });
  }
});

// Следим за изменением видимости
watch(isVisible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      calculateLayout();
    });
  }
});

// Усечение длинных названий
const truncateName = (name) => {
  if (!name) return '';
  if (name.length > maxNameLength.value) {
    return name.substring(0, maxNameLength.value) + '...';
  }
  return name;
};

// Выбор категории
const selectCategory = (category) => {
  // Проверяем, что выбранная категория не имеет дочерних элементов в текущей книге
  if (!categoryStore.hasChildCategoriesInBook(category.id, props.bookId)) {
    // Вызываем событие выбора категории
    emit('select', category);
    // Автоматически закрываем попап после выбора категории
    isVisible.value = false;
  } else {
    console.log("Категория с дочерними элементами не может быть выбрана");
    messageService.warning('Нельзя выбрать категорию с подкатегориями');
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
  width: 100%;
  box-sizing: border-box;
  padding: 8px 0 16px; /* Убираем горизонтальные отступы, т.к. они уже есть у popup */
}

.debug-info {
  padding: 4px 16px;
  background-color: rgba(255, 255, 255, 0.1);
  color: yellow;
  font-size: 12px;
  margin-bottom: 16px;
}

.category-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 4px; /* Уменьшенный gap до 4px */
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  margin-bottom: 8px;
}

.category-name {
  color: white;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.add-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #949496;
}

.add-icon {
  color: #949496;
}

.empty-state {
  text-align: center;
  color: #949496;
  padding: 16px;
  font-size: 14px;
  line-height: 20px;
  margin-top: 16px;
}
</style>