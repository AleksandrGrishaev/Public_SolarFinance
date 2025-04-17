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
        <div>Gap: {{ GAP_SIZE }}px</div>
        <div>Cell width: {{ layoutState.calculatedItemWidth }}px</div>
      </div>
      
      <!-- Динамически адаптируемая сетка категорий -->
      <div class="category-grid" ref="gridRef">
        <!-- Ячейки с категориями -->
        <div 
          v-for="category in selectableCategories"
          :key="category.id"
          class="grid-cell"
          :style="gridCellStyle"
          @click="selectCategory(category)"
        >
          <!-- CategoryIcon внутри ячейки -->
          <CategoryIcon 
            class="category-icon"
            :style="iconStyle"
            :icon-name="category.icon" 
            :background-color="category.color" 
            size="medium"
          />
          <div class="category-name">{{ truncateName(category.name) }}</div>
        </div>
        
        <!-- Ячейка добавления категории -->
        <div 
          class="grid-cell"
          :style="gridCellStyle"
          @click="handleAddCategory"
        >
          <div 
            class="add-button"
            :style="iconStyle"
          >
            <IconPlus 
              :size="Math.round(layoutState.itemSize * 0.5)" 
              :stroke-width="1.5"
              class="plus-icon"
            />
          </div>
          <div class="category-name">Add</div>
        </div>
        
        <!-- Невидимые элементы для выравнивания последней строки -->
        <div 
          v-for="i in fillerItemsCount"
          :key="`filler-${i}`"
          class="grid-cell filler"
          :style="gridCellStyle"
        ></div>
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
import { useCategoryStore } from '../../stores/category';
import { messageService } from '../../services/system/MessageService';

const categoryStore = useCategoryStore();

// Режим отладки
const debugMode = ref(false);

// Ссылка на DOM элемент grid-контейнера
const gridRef = ref(null);

// Константа для отступов - минимальный отступ 4px
const GAP_SIZE = 4;

// Состояние адаптивного дизайна
const layoutState = ref({
  itemsPerRow: 4,        // Количество элементов в строке
  itemSize: 56,          // Размер иконки в пикселях
  gridWidth: 0,          // Ширина сетки
  calculatedItemWidth: 0 // Расчетная ширина элемента
});

// Ширина окна браузера
const windowWidth = ref(window.innerWidth);

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
  if (!value && props.transactionType !== 'transfer') {
    messageService.warning('Операция не сохранена. Для создания транзакции необходимо выбрать категорию.');
  }
};

// Отфильтрованные категории
const selectableCategories = computed(() => {
  if (!props.categories || props.categories.length === 0) return [];
  return props.categories;
});

// Рассчитываем количество элементов для заполнения последней строки
const fillerItemsCount = computed(() => {
  const totalItems = selectableCategories.value.length + 1; // Категории + кнопка добавления
  const remainder = totalItems % layoutState.value.itemsPerRow;
  
  // Если элементы делятся нацело на количество в строке, то дополнительные не нужны
  if (remainder === 0) return 0;
  
  // Иначе добавляем столько, чтобы заполнить последнюю строку
  return layoutState.value.itemsPerRow - remainder;
});

// Стиль для ячейки сетки
const gridCellStyle = computed(() => {
  // Уменьшаем ширину ячейки на 1px для гарантии размещения
  const cellWidth = layoutState.value.calculatedItemWidth - 1;
  
  return { 
    width: `${cellWidth}px`,
    marginRight: `${GAP_SIZE}px`,
    marginBottom: `${GAP_SIZE}px`
  };
});

// Стиль для иконки
const iconStyle = computed(() => {
  const { itemSize } = layoutState.value;
  return {
    width: `${itemSize}px`,
    height: `${itemSize}px`
  };
});

// Функция для расчета оптимального размещения
const calculateLayout = () => {
  if (!gridRef.value) return;
  
  // Измеряем текущую ширину grid-контейнера - округляем до целого числа
  const gridWidth = Math.floor(gridRef.value.clientWidth);
  const minItemSize = 45; // Минимальный размер иконки
  const optimalItemSize = 56; // Стандартный размер medium иконки
  
  // Определяем оптимальное количество элементов в ряду
  let itemsPerRow = 4; // По умолчанию 4 элемента
  
  const screenWidth = windowWidth.value;
  if (screenWidth >= 390) {
    // Проверяем, поместятся ли 5 элементов с учетом отступов
    const totalGapWidthFor5 = GAP_SIZE * 5; // Учитываем все отступы
    const availableWidthFor5 = gridWidth - totalGapWidthFor5;
    const itemWidthFor5 = Math.floor(availableWidthFor5 / 5);
    
    if (itemWidthFor5 >= minItemSize) {
      itemsPerRow = 5;
    }
  }
  
  // Вычисляем размер элемента на основе доступного пространства
  const totalGapWidth = GAP_SIZE * (itemsPerRow - 1);
  const availableWidth = gridWidth - totalGapWidth;
  
  // Рассчитываем ширину элемента и округляем до целого числа вниз
  const calculatedItemWidth = Math.floor(availableWidth / itemsPerRow);
  
  // Определяем итоговый размер иконки
  let itemSize = Math.min(calculatedItemWidth, optimalItemSize * 1.2);
  itemSize = Math.floor(Math.max(itemSize, minItemSize)); // Не меньше минимального
  
  if (debugMode.value) {
    console.group('Расчет макета сетки категорий');
    console.log('Ширина окна:', Math.floor(windowWidth.value), 'px');
    console.log('Ширина сетки:', gridWidth, 'px');
    console.log('Элементов в строке:', itemsPerRow);
    console.log('Gap:', GAP_SIZE, 'px');
    console.log('Общая ширина gap-ов:', GAP_SIZE * (itemsPerRow - 1), 'px');
    console.log('Доступная ширина для ячеек:', gridWidth - GAP_SIZE * (itemsPerRow - 1), 'px');
    console.log('Расчетная ширина ячейки:', calculatedItemWidth, 'px');
    console.log('Реальная ширина ячейки:', calculatedItemWidth - 1, 'px');
    console.log('Итоговый размер иконки:', itemSize, 'px');
    console.log('Всего категорий:', selectableCategories.value.length);
    console.log('Количество элементов для выравнивания:', fillerItemsCount.value);
    console.groupEnd();
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
  windowWidth.value = window.innerWidth;
  calculateLayout();
};

// Максимальная длина имени категории
const maxNameLength = computed(() => {
  return layoutState.value.itemsPerRow === 4 ? 8 : 10;
});

// Усечение длинных названий
const truncateName = (name) => {
  if (!name) return '';
  const maxLen = maxNameLength.value;
  if (name.length > maxLen) {
    return name.substring(0, maxLen) + '...';
  }
  return name;
};

// Инициализация и обновление при изменении видимости
onMounted(() => {
  if (isVisible.value) {
    nextTick(calculateLayout);
  }
  window.addEventListener('resize', handleResize);
});

onUpdated(() => {
  if (isVisible.value) {
    nextTick(calculateLayout);
  }
});

// Следим за изменением видимости
watch(isVisible, (newVal) => {
  if (newVal) {
    nextTick(calculateLayout);
  }
});

// Выбор категории
const selectCategory = (category) => {
  if (!categoryStore.hasChildCategoriesInBook(category.id, props.bookId)) {
    emit('select', category);
    isVisible.value = false;
  } else {
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
  padding: 8px 0 16px;
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
  justify-content: flex-start; /* Выравнивание по левому краю */
  width: 100%;
  box-sizing: border-box;
}

.grid-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  box-sizing: border-box;
}

/* Невидимые элементы для выравнивания */
.grid-cell.filler {
  visibility: hidden;
  height: 0;
  margin-bottom: 0;
  pointer-events: none;
}

.category-icon {
  transform-origin: center;
}

.add-button {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1.5px dashed #949496;
  border-radius: 50%;
  background-color: transparent;
  transition: background-color 0.2s ease;
  box-sizing: border-box;
}

.plus-icon {
  color: #949496; /* Такой же серый цвет, как и у обводки */
}

.grid-cell:hover .add-button {
  background-color: rgba(148, 148, 150, 0.1);
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

.empty-state {
  text-align: center;
  color: #949496;
  padding: 16px;
  font-size: 14px;
  line-height: 20px;
  margin-top: 16px;
}
</style>