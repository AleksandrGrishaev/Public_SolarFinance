<!-- src/components/ui/selectors/BaseTransactionSelector.vue -->
<template>
    <div class="base-selector" :class="{ 'with-debug': debug }">
      <!-- Контейнер для элементов -->
      <div class="items-container" :style="{ backgroundColor: itemsBackgroundColor }">
        <div 
          v-for="item in displayedItems" 
          :key="item.id"
          class="selector-item"
          :class="{ 'active': isItemSelected(item.id) }"
          @click="handleToggleItem(item.id)"
        >
          {{ item.name }}
        </div>
      </div>
      
      <!-- Иконка переключения наборов элементов -->
      <div 
        v-if="hasTwoItemSets"
        class="toggle-button"
        @click="toggleItemSet"
      >
        <div class="toggle-icon" :class="{ 'rotated': isSecondSetActive }">
          <IconChevronRight 
            :size="toggleButtonSize - 16" 
            :color="toggleButtonColor"
            :stroke-width="1.5"
          />
        </div>
      </div>
      
      <!-- Иконка добавления (опциональная) -->
      <div 
        v-if="showAddButton" 
        class="add-button"
        @click="handleAddClick"
      >
        <IconPlus 
          class="plus-icon" 
          :size="addButtonSize - 18" 
          :color="addButtonColor"
          :stroke-width="1"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { IconPlus, IconChevronRight } from '@tabler/icons-vue';
  
  const props = defineProps({
    // Модель для v-model
    modelValue: {
      type: [String, Array],
      required: true
    },
    
    // Элементы для отображения
    items: {
      type: Array,
      default: () => []
    },
    
    // Второй набор элементов (опционально)
    secondItems: {
      type: Array,
      default: () => []
    },
    
    // Максимальное количество элементов для отображения в одном наборе
    maxVisibleItems: {
      type: Number,
      default: 3
    },
    
    // Цвета
    containerBackgroundColor: {
      type: String,
      default: 'var(--bg-light, #949496)'
    },
    
    itemsBackgroundColor: {
      type: String,
      default: 'var(--bg-contrast, #444444)'
    },
    
    selectedItemColor: {
      type: String,
      default: 'var(--bg-item-selected, #000000)'
    },
    
    // Настройки мультивыбора
    multiSelect: {
      type: Boolean,
      default: false
    },
    
    // Показывать ли опцию "All"
    showAllOption: {
      type: Boolean,
      default: false
    },
    
    // Настройки кнопки добавления
    showAddButton: {
      type: Boolean,
      default: false
    },
    
    addButtonSize: {
      type: Number,
      default: 36
    },
    
    addButtonColor: {
      type: String,
      default: 'var(--bg-main)'
    },
    
    // Настройки кнопки переключения наборов
    toggleButtonSize: {
      type: Number,
      default: 36
    },
    
    toggleButtonColor: {
      type: String,
      default: 'var(--text-usual, #F5F5F5)'
    },
    
    // Режим отладки
    debug: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['update:modelValue', 'add-item', 'set-changed']);
  
  // Локальное состояние для отслеживания активного набора элементов
  const isSecondSetActive = ref(false);
  
  // Определение, есть ли два набора элементов
  const hasTwoItemSets = computed(() => {
    return props.secondItems && props.secondItems.length > 0;
  });
  
  // Определение режима выбора
  const isMultiSelectMode = computed(() => {
    return props.multiSelect;
  });
  
  // Подготовка опций для отображения
  const itemOptions = computed(() => {
    return props.items;
  });
  
  // Подготовка второго набора опций
  const secondItemOptions = computed(() => {
    return props.secondItems;
  });
  
  // Фильтрация опций по параметру showAllOption
  const filteredItems = computed(() => {
    const items = props.showAllOption 
      ? itemOptions.value 
      : itemOptions.value.filter(item => item.id !== 'all');
      
    return items.slice(0, props.maxVisibleItems);
  });
  
  // Фильтрация второго набора опций
  const filteredSecondItems = computed(() => {
    const items = props.showAllOption 
      ? secondItemOptions.value 
      : secondItemOptions.value.filter(item => item.id !== 'all');
      
    return items.slice(0, props.maxVisibleItems);
  });
  
  // Отображаемые элементы в зависимости от активного набора
  const displayedItems = computed(() => {
    return isSecondSetActive.value ? filteredSecondItems.value : filteredItems.value;
  });
  
  // Все доступные элементы в обоих наборах
  const allAvailableItems = computed(() => {
    return [...filteredItems.value, ...filteredSecondItems.value];
  });
  
  // Проверка, выбран ли элемент
  const isItemSelected = (itemId) => {
    if (Array.isArray(props.modelValue)) {
      return props.modelValue.includes(itemId);
    }
    return props.modelValue === itemId;
  };
  
  // Переключение набора элементов
  const toggleItemSet = () => {
    isSecondSetActive.value = !isSecondSetActive.value;
    
    if (props.debug) {
      console.log(`[BaseSelector] Toggled to ${isSecondSetActive.value ? 'second' : 'first'} item set`);
    }
    
    // Проверяем, если выбранный элемент больше не отображается в текущем наборе
    const currentItems = isSecondSetActive.value ? filteredSecondItems.value : filteredItems.value;
    let shouldUpdateSelection = false;
    
    if (Array.isArray(props.modelValue)) {
      shouldUpdateSelection = !props.modelValue.some(id => 
        currentItems.some(item => item.id === id)
      );
    } else {
      shouldUpdateSelection = !currentItems.some(item => item.id === props.modelValue);
    }
    
    // Если выбранного элемента нет в текущем наборе, выбираем первый доступный
    if (shouldUpdateSelection && currentItems.length > 0) {
      if (isMultiSelectMode.value) {
        emit('update:modelValue', [currentItems[0].id]);
      } else {
        emit('update:modelValue', currentItems[0].id);
      }
    }
    
    emit('set-changed', isSecondSetActive.value);
  };
  
  // Обработчик переключения элемента с выводом логов при включенной отладке
  const handleToggleItem = (itemId) => {
    if (props.debug) {
      console.log(`[BaseSelector] Toggle item requested: ${itemId}`);
      console.log(`[BaseSelector] Current selection before toggle:`, props.modelValue);
      console.log(`[BaseSelector] MultiSelect mode:`, isMultiSelectMode.value);
    }
    
    toggleItem(itemId);
    
    if (props.debug) {
      console.log(`[BaseSelector] Selection after toggle:`, props.modelValue);
    }
  };
  
  // Переключение выбора элемента
  const toggleItem = (itemId) => {
    if (!isMultiSelectMode.value) {
      // Одиночный выбор - всегда возвращаем строку
      emit('update:modelValue', itemId);
      return;
    }
    
    // Мультивыбор - всегда возвращаем массив
    const currentSelection = Array.isArray(props.modelValue) ? props.modelValue : 
                            (props.modelValue ? [props.modelValue] : []);
    
    const index = currentSelection.indexOf(itemId);
    
    let newSelection;
    if (index === -1) {
      // Добавляем элемент
      newSelection = [...currentSelection, itemId];
    } else if (currentSelection.length > 1) {
      // Удаляем элемент, если выбрано больше одного
      newSelection = [...currentSelection];
      newSelection.splice(index, 1);
    } else {
      // Нельзя удалить последний выбранный элемент
      newSelection = currentSelection;
    }
    
    emit('update:modelValue', newSelection);
  };
  
  // Обработчик клика по кнопке добавления
  const handleAddClick = (event) => {
    if (props.debug) {
      console.log('[BaseSelector] Add button clicked');
    }
    emit('add-item', { event });
  };
  
  // Автоматическое переключение на нужный набор при изменении выбранного значения
  const switchToSetContainingSelectedItem = () => {
    if (!hasTwoItemSets.value) return;
    
    const selectedItemId = Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue;
    
    if (!selectedItemId) return;
    
    // Проверка, в каком наборе находится выбранный элемент
    const isInFirstSet = filteredItems.value.some(item => item.id === selectedItemId);
    const isInSecondSet = filteredSecondItems.value.some(item => item.id === selectedItemId);
    
    if (isInFirstSet && isSecondSetActive.value) {
      isSecondSetActive.value = false;
      emit('set-changed', false);
    } else if (isInSecondSet && !isSecondSetActive.value) {
      isSecondSetActive.value = true;
      emit('set-changed', true);
    }
  };
  
  // Если выбранного элемента нет в списке, выбираем первый доступный
  watch([() => displayedItems.value, () => props.modelValue], ([items, value]) => {
    if (items.length === 0) return;
    
    // Если "all" больше не отображается, и он был выбран, выбираем первый элемент
    if (!props.showAllOption && 
        ((Array.isArray(value) && value.includes('all')) || 
         value === 'all')) {
      if (isMultiSelectMode.value) {
        emit('update:modelValue', [items[0].id]);
      } else {
        emit('update:modelValue', items[0].id);
      }
      return;
    }
    
    if (Array.isArray(value)) {
      const hasValidItem = value.some(itemId => 
        items.some(item => item.id === itemId)
      );
      
      if (!hasValidItem && items.length > 0) {
        emit('update:modelValue', isMultiSelectMode.value ? [items[0].id] : items[0].id);
      }
    } else if (typeof value === 'string' && !items.some(item => item.id === value)) {
      emit('update:modelValue', isMultiSelectMode.value ? [items[0].id] : items[0].id);
    }
  }, { immediate: true });
  
  // Отслеживаем изменение значения для переключения на правильный набор
  watch(() => props.modelValue, () => {
    switchToSetContainingSelectedItem();
  });
  </script>
  
  <style scoped>
  .base-selector {
    display: inline-flex;
    align-items: center;
    background-color: var(--bg-light, #949496);
    border-radius: var(--border-radius-lg, 28px);
    padding-right: 2px;
    gap: 6px;
  }
  
  .items-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 4px;
    border-radius: var(--border-radius-lg, 28px);
    gap: var(--spacing-xs, 4px);
    box-shadow: var(--shadow-tabs, 0px 4px 4px rgba(0, 0, 0, 0.25));
    overflow-x: auto;
  }
  
  .selector-item {
    height: 28px;
    padding: 4px 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--border-radius-xl, 34px);
    font-size: var(--font-small-size, 12px);
    font-weight: var(--font-small-weight, 400);
    line-height: var(--font-small-line-height, 16px);
    white-space: nowrap;
    color: var(--text-usual);
    cursor: pointer;
    transition: all var(--transition-speed, 0.2s) var(--transition-fn, ease);
  }
  
  .selector-item:hover {
    opacity: var(--state-hover-opacity, 0.8);
  }
  
  .selector-item.active {
    background-color: var(--bg-item-selected, #000000);
    color: var(--text-contrast, white);
  }
  
  .toggle-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: pointer;
    width: v-bind('(toggleButtonSize-4) + "px"');
    height: v-bind('(toggleButtonSize-4) + "px"');
    border-radius: 50%;
    background-color: var(--bg-contrast, #444444);
    transition: all var(--transition-speed, 0.2s) var(--transition-fn, ease);
  }
  
  .toggle-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform var(--transition-speed, 0.2s) var(--transition-fn, ease);
  }
  
  .toggle-icon.rotated {
    transform: rotate(180deg);
  }
  
  .toggle-button:hover {
    opacity: var(--state-hover-opacity, 0.8);
  }
  
  .toggle-button:active {
    opacity: var(--state-active-opacity, 0.6);
  }
  
  .add-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: pointer;
    width: v-bind('(addButtonSize-4) + "px"');
    height: v-bind('(addButtonSize-4) + "px"');
    border: 1.5px dashed var(--bg-main);
    border-radius: 50%;
    transition: opacity var(--transition-speed, 0.2s) var(--transition-fn, ease);
    opacity: 0.8;
  }
  
  .plus-icon {
    stroke-width: 1;
  }
  
  .add-button:hover {
    opacity: var(--state-hover-opacity, 0.8);
  }
  
  .add-button:active {
    opacity: var(--state-active-opacity, 0.6);
  }
  </style>