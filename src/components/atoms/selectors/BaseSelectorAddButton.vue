<!-- src/components/ui/selectors/UniversalItemsFilter.vue -->
<template>
    <div class="universal-items-filter">
      <!-- Основной селектор элементов -->
      <div class="selector-element">
        <div class="area" :style="{ backgroundColor: backgroundColor }">
          <!-- Иконка слева (если указана) -->
          <div class="icon" v-if="icon || $slots.icon">
            <slot name="icon">
              <component v-if="typeof icon === 'object'" :is="icon" :size="iconSize" :stroke-width="1.5" :color="iconColor" />
              <img v-else-if="typeof icon === 'string'" :src="icon" alt="Icon" />
            </slot>
          </div>
          
          <!-- Область выбора элементов -->
          <div class="items-selector">
            <div
              v-for="item in items"
              :key="getItemKey(item)"
              class="selector-item"
              :class="{ 'selected': isItemSelected(item) }"
              @click="toggleItem(item)"
            >
              {{ getItemLabel(item) }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Кнопка добавления (если она включена) -->
      <AddIconButton 
        v-if="showAddButton"
        :size="addButtonSizeType"
        @click="$emit('add-item')"
        class="add-button"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import AddIconButton from '../../atoms/buttons/AddIconButton.vue';
  
  const props = defineProps({
    // Значение модели (выбранный элемент или элементы)
    modelValue: {
      type: [String, Number, Array, Object],
      required: true
    },
    // Массив элементов для выбора
    items: {
      type: Array,
      required: true,
      default: () => []
    },
    // Ключевое поле для идентификации элементов
    valueKey: {
      type: String,
      default: 'id'
    },
    // Поле для отображения названия элемента
    labelKey: {
      type: String,
      default: 'name'
    },
    // Включение мультивыбора
    multiSelect: {
      type: Boolean,
      default: false
    },
    // Иконка (строка с URL или компонент)
    icon: {
      type: [String, Object],
      default: null
    },
    // Размер иконки
    iconSize: {
      type: Number,
      default: 20
    },
    // Цвет иконки
    iconColor: {
      type: String,
      default: 'var(--text-contrast)'
    },
    // Цвет фона селектора
    backgroundColor: {
      type: String,
      default: 'var(--bg-light)'
    },
    // Цвет выбранного элемента
    selectedColor: {
      type: String,
      default: 'var(--dropdown-item-selected)'
    },
    // Показывать ли кнопку добавления
    showAddButton: {
      type: Boolean,
      default: false
    },
    // Размер кнопки добавления в пикселях
    addButtonSize: {
      type: Number,
      default: 32
    },
    // Цвет кнопки добавления
    addButtonColor: {
      type: String,
      default: 'var(--text-grey)'
    }
  });
  
  const emit = defineEmits(['update:modelValue', 'add-item']);
  
  // Преобразование размера кнопки в тип для AddIconButton
  const addButtonSizeType = computed(() => {
    if (props.addButtonSize <= 24) return 'small';
    if (props.addButtonSize >= 40) return 'large';
    return 'medium';
  });
  
  // Получение ключа элемента для использования в v-for
  const getItemKey = (item) => {
    if (typeof item === 'object' && item !== null) {
      return item[props.valueKey] || item.id || item.value;
    }
    return item;
  };
  
  // Получение отображаемого текста элемента
  const getItemLabel = (item) => {
    if (typeof item === 'object' && item !== null) {
      return item[props.labelKey] || item.name || item.label || item.title;
    }
    return String(item);
  };
  
  // Проверка, выбран ли элемент
  const isItemSelected = (item) => {
    const itemValue = getItemKey(item);
    
    if (Array.isArray(props.modelValue)) {
      // Для мультивыбора проверяем наличие в массиве
      if (typeof props.modelValue[0] === 'object' && props.modelValue[0] !== null) {
        return props.modelValue.some(val => val[props.valueKey] === itemValue);
      } else {
        return props.modelValue.includes(itemValue);
      }
    } else if (typeof props.modelValue === 'object' && props.modelValue !== null) {
      // Если моделью является объект, сравниваем по ключу
      return props.modelValue[props.valueKey] === itemValue;
    }
    
    // Для простых типов просто сравниваем значения
    return props.modelValue === itemValue;
  };
  
  // Переключение выбора элемента
  const toggleItem = (item) => {
    const itemValue = getItemKey(item);
    
    if (props.multiSelect) {
      let newValue;
      
      if (Array.isArray(props.modelValue)) {
        // Если значение уже массив, добавляем или удаляем элемент
        const currentValues = [...props.modelValue];
        
        if (typeof currentValues[0] === 'object' && currentValues[0] !== null) {
          // Работаем с массивом объектов
          const index = currentValues.findIndex(val => val[props.valueKey] === itemValue);
          
          if (index === -1) {
            // Добавляем элемент в виде объекта
            currentValues.push(item);
          } else if (currentValues.length > 1) {
            // Удаляем элемент, если выбрано больше одного
            currentValues.splice(index, 1);
          }
        } else {
          // Работаем с массивом примитивов
          const index = currentValues.indexOf(itemValue);
          
          if (index === -1) {
            // Добавляем значение
            currentValues.push(itemValue);
          } else if (currentValues.length > 1) {
            // Удаляем значение, если выбрано больше одного
            currentValues.splice(index, 1);
          }
        }
        
        newValue = currentValues;
      } else {
        // Если значение еще не массив, создаем новый с этим элементом
        newValue = [itemValue];
      }
      
      emit('update:modelValue', newValue);
    } else {
      // Для одиночного выбора просто устанавливаем значение
      emit('update:modelValue', itemValue);
    }
  };
  </script>
  
  <style scoped>
  .universal-items-filter {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    width: 100%;
  }
  
  .selector-element {
    display: flex;
    justify-content: center;
    width: 100%;
  }
  
  .area {
    padding: 6px 10px 6px 13px;
    border-radius: var(--border-radius-lg);
    display: inline-flex;
    justify-content: flex-start;
    align-items: center;
    gap: var(--spacing-xs);
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    transition: background-color var(--transition-speed) var(--transition-fn);
  }
  
  .area::-webkit-scrollbar {
    display: none;
  }
  
  .icon {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .items-selector {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 2px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    flex-grow: 1;
  }
  
  .items-selector::-webkit-scrollbar {
    display: none;
  }
  
  .selector-item {
    height: 28px;
    padding: 0 var(--spacing-md);
    background: transparent;
    border-radius: var(--border-radius-xl);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--spacing-sm);
    overflow: hidden;
    cursor: pointer;
    flex-shrink: 0;
    
    /* Текстовые стили */
    color: var(--text-usual);
    font-size: var(--font-small-size);
    font-weight: var(--font-small-weight);
    line-height: var(--font-small-line-height);
    word-wrap: break-word;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: background-color var(--transition-speed) var(--transition-fn);
  }
  
  .selector-item:hover {
    opacity: var(--state-hover-opacity);
  }
  
  .selector-item.selected {
    background: v-bind('selectedColor');
    color: var(--text-contrast);
  }
  
  .add-button {
    flex-shrink: 0;
    border-color: v-bind('addButtonColor');
    color: v-bind('addButtonColor');
  }
  
  .add-button:hover {
    border-color: var(--text-usual);
    color: var(--text-usual);
  }
  
  /* Для мобильных устройств */
  @media (max-width: 768px) {
    .universal-items-filter {
      flex-direction: row;
      flex-wrap: wrap;
    }
  }
  </style>