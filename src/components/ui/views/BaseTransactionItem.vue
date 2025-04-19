<!-- src/components/ui/views/BaseTransactionItem.vue -->
<template>
  <div 
    class="base-transaction-item"
    :class="{ 
      'with-border': withBorder,
      'is-clickable': isClickable,
      [customClass]: customClass
    }"
    @click="handleClick"
  >
    <!-- Левая часть с иконкой -->
    <div class="item-icon">
      <slot name="icon">
        <div class="icon-wrapper" :style="iconStyle">
          <slot name="icon-content">
            <!-- Иконка категории (если передана) -->
            <component 
              v-if="resolvedCategoryIcon" 
              :is="resolvedCategoryIcon" 
              :size="iconSize" 
              :stroke="1.5"
              :color="iconTextColor" 
              class="category-icon"
            />
            <!-- Стандартная иконка (если передана) -->
            <component 
              v-else-if="resolvedIcon" 
              :is="resolvedIcon" 
              :size="iconSize" 
              :stroke="1.5"
              :color="iconTextColor" 
            />
            <!-- Инициалы (если нет иконок) -->
            <span v-else-if="initials" class="icon-placeholder">{{ initials }}</span>
          </slot>
        </div>
      </slot>
    </div>
    
    <!-- Центральная часть с названием и описанием -->
    <div class="item-content">
      <slot name="content">
        <div class="content-main">
          <div class="item-title" v-if="title">{{ title }}</div>
          <div class="item-description" v-if="description">{{ description }}</div>
        </div>
        <div class="item-subtitle" v-if="subtitle">{{ subtitle }}</div>
      </slot>
    </div>
    
    <!-- Правая часть с суммой и дополнительной информацией -->
    <div class="item-amount">
      <slot name="amount">
        <div class="amount-main">
          <div class="amount" :class="amountColorClass" v-if="amount !== undefined">
            {{ formattedAmount }}
          </div>
        </div>
        <div class="item-info" :class="{ 'has-info': !!info }">
          {{ info }}
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import * as TablerIcons from '@tabler/icons-vue';

// Определение типов
interface ItemClickEvent {
  item: any;
  event: MouseEvent;
}

const props = defineProps({
  // Основное содержимое
  item: {
    type: Object,
    default: () => ({})
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  info: {
    type: String,
    default: ''
  },
  
  // Финансовые данные
  amount: {
    type: Number,
    default: undefined
  },
  currency: {
    type: String,
    default: ''
  },
  amountPrefix: {
    type: String,
    default: ''
  },
  amountSuffix: {
    type: String,
    default: ''
  },
  
  // Иконка
  icon: {
    type: [Object, Function, String],
    default: null
  },
  iconColor: {
    type: String,
    default: ''
  },
  iconSize: {
    type: Number,
    default: 20
  },
  initials: {
    type: String,
    default: ''
  },
  
  // Категория (новые свойства)
  categoryIcon: {
    type: [Object, Function, String],
    default: null
  },
  categoryColor: {
    type: String,
    default: ''
  },
  
  // Тип и стиль
  type: {
    type: String,
    default: '' // 'income', 'expense', 'transfer'
  },
  amountType: {
    type: String,
    default: '' // 'positive', 'negative', 'neutral'
  },
  withBorder: {
    type: Boolean,
    default: false
  },
  isClickable: {
    type: Boolean,
    default: true
  },
  customClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['click']);

// Резолвинг иконок Tabler
const resolvedCategoryIcon = computed(() => {
  if (!props.categoryIcon) return null;
  
  // Если передан объект или функция, используем как есть
  if (typeof props.categoryIcon !== 'string') {
    return props.categoryIcon;
  }
  
  // Проверяем, является ли строка именем иконки Tabler (например 'IconCar')
  if (props.categoryIcon.startsWith('Icon') && TablerIcons[props.categoryIcon]) {
    return TablerIcons[props.categoryIcon];
  }
  
  return null;
});

// Аналогично для обычной иконки
const resolvedIcon = computed(() => {
  if (!props.icon) return null;
  
  // Если передан объект или функция, используем как есть
  if (typeof props.icon !== 'string') {
    return props.icon;
  }
  
  // Проверяем, является ли строка именем иконки Tabler (например 'IconCar')
  if (props.icon.startsWith('Icon') && TablerIcons[props.icon]) {
    return TablerIcons[props.icon];
  }
  
  return null;
});

// Стиль иконки
const iconStyle = computed(() => {
  // Приоритет 1: Если задан цвет категории, используем его
  if (props.categoryColor) {
    return { backgroundColor: props.categoryColor };
  }
  
  // Приоритет 2: Если задан конкретный цвет иконки, используем его
  if (props.iconColor) {
    return { backgroundColor: props.iconColor };
  }
  
  // Приоритет 3: Определяем цвет на основе типа
  if (props.type === 'income' || props.amountType === 'positive') {
    return { backgroundColor: 'var(--color-success)' };
  } 
  else if (props.type === 'expense' || props.amountType === 'negative') {
    return { backgroundColor: 'var(--color-warning)' };
  }
  else if (props.type === 'transfer' || props.amountType === 'neutral') {
    return { backgroundColor: 'var(--text-contrast)' };
  }
  
  // Приоритет 4: Если тип не определен, но есть сумма
  if (props.amount !== undefined) {
    if (props.amount > 0) {
      return { backgroundColor: 'var(--color-success)' };
    } 
    else if (props.amount < 0) {
      return { backgroundColor: 'var(--color-warning)' };
    }
  }
  
  // По умолчанию используем нейтральный цвет
  return { backgroundColor: 'var(--bg-light)' };
});

// Цвет текста иконки
const iconTextColor = computed(() => {
  // Для трансферов используем темный цвет текста на светлом фоне
  if (props.type === 'transfer' || props.amountType === 'neutral') {
    return 'var(--bg-main)';
  }
  
  // Для остальных белый текст
  return 'var(--text-contrast)';
});

// Класс цвета для суммы
const amountColorClass = computed(() => {
  // Если задан конкретный тип, используем его
  if (props.amountType === 'positive') {
    return 'color-success';
  } 
  else if (props.amountType === 'negative') {
    return 'color-warning';
  }
  else if (props.amountType === 'neutral') {
    return '';
  }
  
  // По типу транзакции
  if (props.type === 'income') {
    return 'color-success';
  } 
  else if (props.type === 'expense') {
    return 'color-warning';
  }
  
  // По значению суммы
  if (props.amount !== undefined) {
    if (props.amount > 0) {
      return 'color-success';
    } 
    else if (props.amount < 0) {
      return 'color-warning';
    }
  }
  
  // По умолчанию нет специального класса
  return '';
});

// Форматированная сумма с символом валюты
const formattedAmount = computed(() => {
  if (props.amount === undefined) {
    return '';
  }
  
  const isNegative = props.amount < 0;
  const absAmount = Math.abs(props.amount);
  const prefix = props.amountPrefix || '';
  const suffix = props.amountSuffix || '';
  
  // Получаем символ валюты или используем переданный
  let currencySymbol = '';
  
  // Определяем символ валюты
  if (props.currency) {
    if (props.currency === 'IDR' || props.currency === 'Rp') {
      currencySymbol = 'Rp ';
    } else if (props.currency === 'USD') {
      currencySymbol = '$ ';
    } else if (props.currency === 'RUB') {
      currencySymbol = '₽ ';
    } else {
      currencySymbol = `${props.currency} `;
    }
  }
  
  // Форматируем с разделителями тысяч
  // Для отрицательных значений, минус должен идти перед символом валюты с отступом в 4px
  return isNegative
    ? `${prefix}- ${currencySymbol}${absAmount.toLocaleString()}${suffix}`
    : `${prefix}${currencySymbol}${absAmount.toLocaleString()}${suffix}`;
});

// Обработчик клика
const handleClick = (event) => {
  if (!props.isClickable) return;
  
  emit('click', {
    item: props.item,
    event: event
  });
};
</script>

<style scoped>

.base-transaction-item {
  padding: var(--spacing-xs) var(--spacing-md) var(--spacing-xs) var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  position: relative;
  transition: background-color var(--transition-speed) var(--transition-fn);
  margin: 0;
}

.is-clickable {
  cursor: pointer;
}

.is-clickable:active {
  background-color: rgba(255, 255, 255, 0.05);
}

.with-border {
  border-bottom: 0.5px solid var(--border-color);
}

.item-icon {
  min-width: 37px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-wrapper {
  width: 37px;
  height: 37px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.icon-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-contrast);
}

.category-icon {
  color: var(--text-contrast);
  width: 20px;
  height: 20px;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 48px;
}

.content-main {
  flex: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.item-title {
  color: var(--text-header);
  font-size: var(--font-body-size);
  line-height: var(--font-body-line-height);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.item-description {
  color: var(--text-grey);
  font-size: var(--font-super-small-size);
  line-height: var(--font-super-small-line-height);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-top: 2px;
  min-width: 0;
}

.item-subtitle {
  flex: 1;
  color: var(--text-grey);
  font-size: var(--font-super-small-size);
  line-height: var(--font-super-small-line-height);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-top: 2px;
  min-width: 0;
}

.item-amount {
  min-width: 110px;
  max-width: 110px;
  height: 48px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.amount-main {
  flex: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  min-width: 0;
}

.amount {
  display: flex;
  align-items: center;
  font-size: var(--font-body-size);
  font-weight: var(--font-body-weight);
  line-height: var(--font-body-line-height);
  text-align: right;
  white-space: nowrap;
}

.item-info {
  flex: 1;
  width: 100%;
  text-align: right;
  color: var(--text-grey);
  font-size: var(--font-super-small-size);
  line-height: var(--font-super-small-line-height);
  padding-top: 2px;
}

.item-info.has-info {
  color: var(--text-usual);
  white-space: normal; /* Позволит переносить слова */
  overflow: visible; /* Убираем скрытие переполнения */
}

.color-success {
  color: var(--color-success);
}

.color-warning {
  color: var(--color-warning);
}
</style>