<!-- src/components/CategoryGridDemo.vue -->
<template>
  <div class="container">
    <h2>Category Grid Demo</h2>
    
    <div class="debug-panel">
      <div>Ширина экрана: {{ windowWidth }}px</div>
      <div>Ширина сетки: {{ gridWidth }}px</div>
      <div>Элементов в строке: {{ itemsPerRow }}</div>
      <div>Gap: {{ gap }}px</div>
      <div>Расчетная ширина ячейки: {{ calculatedItemWidth }}px</div>
      <div>Итоговый размер иконки: {{ itemSize }}px</div>
    </div>
    
    <!-- Сетка категорий -->
    <div class="category-grid" ref="gridRef">
      <!-- Стандартные категории -->
      <div 
        v-for="category in categories"
        :key="category.id"
        class="grid-cell"
        :style="gridCellStyle"
      >
        <div 
          class="category-icon"
          :style="[iconStyle, { backgroundColor: category.color }]"
        >
          <span>{{ category.icon }}</span>
        </div>
        <div class="category-name">{{ category.name }}</div>
      </div>
      
      <!-- Специальная категория "Добавить" -->
      <div 
        class="grid-cell"
        :style="gridCellStyle"
      >
        <div 
          class="category-icon add-button"
          :style="iconStyle"
        >
          <span>+</span>
        </div>
        <div class="category-name">Добавить</div>
      </div>
      
      <!-- Невидимые элементы для выравнивания сетки -->
      <div 
        v-for="i in fillerItemsCount"
        :key="`filler-${i}`"
        class="grid-cell filler"
        :style="gridCellStyle"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// Исходные данные категорий
const categories = [
  { id: 1, name: 'Продукты', icon: '🛒', color: '#4ECDC4' },
  { id: 2, name: 'Транспорт', icon: '🚗', color: '#FF6B6B' },
  { id: 3, name: 'Развлечения', icon: '🎮', color: '#FFD166' },
  { id: 4, name: 'Рестораны', icon: '🍽️', color: '#06D6A0' },
  { id: 5, name: 'Здоровье', icon: '💊', color: '#118AB2' },
  { id: 6, name: 'Коммуналка', icon: '💡', color: '#8A89C0' }
];

// Ссылка на DOM-элемент сетки
const gridRef = ref(null);

// Состояние окна и сетки
const windowWidth = ref(window.innerWidth);
const gridWidth = ref(0);

// Параметры макета
const minItemSize = 45; // Минимальный размер иконки
const optimalItemSize = 56; // Оптимальный размер иконки
const minGap = 4; // Минимальный отступ
const maxGap = 8; // Максимальный отступ

// Вычисляемые параметры макета
const itemsPerRow = computed(() => {
  return windowWidth.value >= 390 ? 5 : 4;
});

// Адаптивный gap в зависимости от ширины экрана - всегда целое число
const gap = computed(() => {
  // Рассчитываем gap от 4 до 8px в зависимости от ширины экрана
  // Минимальная ширина для расчета - 320px, максимальная - 600px
  const minWidth = 320;
  const maxWidth = 600;
  const currentWidth = Math.min(Math.max(windowWidth.value, minWidth), maxWidth);
  
  // Линейная интерполяция между minGap и maxGap
  const gapSize = minGap + ((currentWidth - minWidth) / (maxWidth - minWidth)) * (maxGap - minGap);
  
  // Округляем до целого значения
  return Math.floor(gapSize);
});

// Рассчитываем ширину ячейки - всегда целое число
const calculatedItemWidth = computed(() => {
  if (gridWidth.value === 0) return optimalItemSize;
  
  const totalGapWidth = gap.value * (itemsPerRow.value - 1);
  const availableWidth = gridWidth.value - totalGapWidth;
  // Округляем до целого значения вниз для гарантии вмещаемости
  return Math.floor(availableWidth / itemsPerRow.value);
});

// Определяем итоговый размер иконки - всегда целое число
const itemSize = computed(() => {
  const size = Math.min(calculatedItemWidth.value, optimalItemSize * 1.2);
  // Не меньше минимального
  return Math.floor(Math.max(size, minItemSize));
});

// Стиль для ячейки сетки
const gridCellStyle = computed(() => {
  // Чуть уменьшаем ширину ячейки для гарантии
  const cellWidth = calculatedItemWidth.value - 1;
  
  return { 
    width: `${cellWidth}px`,
    marginRight: `${gap.value}px`,
    marginBottom: `${gap.value}px`
  };
});

// Стиль для иконки
const iconStyle = computed(() => {
  return {
    width: `${itemSize.value}px`,
    height: `${itemSize.value}px`
  };
});

// Рассчитываем количество невидимых элементов для выравнивания последней строки
const fillerItemsCount = computed(() => {
  const totalItems = categories.length + 1; // Категории + кнопка добавления
  const remainder = totalItems % itemsPerRow.value;
  
  // Если элементы делятся нацело на количество в строке, то дополнительные не нужны
  if (remainder === 0) return 0;
  
  // Иначе добавляем столько, чтобы заполнить последнюю строку
  return itemsPerRow.value - remainder;
});

// Расчет ширины сетки и параметров макета
const calculateLayout = () => {
  if (!gridRef.value) return;
  
  // Измеряем ширину сетки - округляем до целого числа
  gridWidth.value = Math.floor(gridRef.value.clientWidth);
  
  // Логирование всех расчетов
  console.group('Расчет макета сетки категорий');
  console.log('Ширина окна:', Math.floor(windowWidth.value), 'px');
  console.log('Ширина сетки:', gridWidth.value, 'px');
  console.log('Элементов в строке:', itemsPerRow.value);
  console.log('Gap:', gap.value, 'px');
  console.log('Общая ширина gap-ов:', gap.value * (itemsPerRow.value - 1), 'px');
  console.log('Доступная ширина для ячеек:', gridWidth.value - gap.value * (itemsPerRow.value - 1), 'px');
  console.log('Расчетная ширина ячейки:', calculatedItemWidth.value, 'px');
  console.log('Реальная ширина ячейки:', calculatedItemWidth.value - 1, 'px');
  console.log('Итоговый размер иконки:', itemSize.value, 'px');
  
  // Данные о кнопке добавления
  console.log('--- Данные о кнопке добавления ---');
  console.log('Ширина кнопки добавления:', calculatedItemWidth.value - 1, 'px');
  console.log('Размер иконки добавления:', itemSize.value, 'px');
  console.log('Отступ справа для кнопки:', gap.value, 'px');
  
  // Информация о выравнивании сетки
  console.log('--- Информация о выравнивании сетки ---');
  console.log('Всего реальных элементов:', categories.length + 1);
  console.log('Количество элементов для выравнивания:', fillerItemsCount.value);
  console.log('Общее количество элементов в сетке:', categories.length + 1 + fillerItemsCount.value);
  
  console.groupEnd();
};

// Обработчик изменения размера окна
const handleResize = () => {
  windowWidth.value = window.innerWidth;
  calculateLayout();
};

// Инициализация
onMounted(() => {
  // Первоначальный расчет
  calculateLayout();
  
  // Подписка на событие изменения размера окна
  window.addEventListener('resize', handleResize);
});

// Очистка
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  font-family: Arial, sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 16px;
}

.debug-panel {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  font-family: monospace;
  line-height: 1.5;
  font-size: 14px;
}

.category-grid {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  justify-content: flex-start; /* Выравнивание элементов по левому краю */
  box-sizing: border-box;
}

.grid-cell.filler {
  visibility: hidden; /* Элемент невидимый, но занимает место */
  height: 0;
  margin-bottom: 0;
}

.grid-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.category-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  color: white;
  font-size: 24px;
  transition: transform 0.2s ease;
}

.grid-cell:hover .category-icon {
  transform: scale(1.05);
}

.add-button {
  background-color: transparent;
  border: 2px dashed #ccc;
  color: #666;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* Убираем псевдоэлемент, так как нужна только одна обводка */

.category-name {
  margin-top: 8px;
  font-size: 12px;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>