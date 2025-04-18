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
              <component 
                v-if="icon" 
                :is="icon" 
                :size="iconSize" 
                :color="iconTextColor" 
              />
              <span v-else-if="initials" class="icon-placeholder">{{ initials }}</span>
            </slot>
          </div>
        </slot>
      </div>
      
      <!-- Центральная часть с названием и описанием -->
      <div class="item-content">
        <slot name="content">
          <div class="item-title" v-if="title">{{ title }}</div>
          <div class="item-subtitle" v-if="subtitle">{{ subtitle }}</div>
          <div class="item-description" v-if="description">{{ description }}</div>
        </slot>
      </div>
      
      <!-- Правая часть с суммой и дополнительной информацией -->
      <div class="item-amount">
        <slot name="amount">
          <div class="amount" :class="amountColorClass" v-if="amount !== undefined">
            {{ formattedAmount }}
          </div>
          <div class="item-info" v-if="info">{{ info }}</div>
        </slot>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  
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
      type: [Object, Function],
      default: null
    },
    iconColor: {
      type: String,
      default: ''
    },
    iconSize: {
      type: Number,
      default: 24
    },
    initials: {
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
  
  // Стиль иконки
  const iconStyle = computed(() => {
    // Если задан конкретный цвет, используем его
    if (props.iconColor) {
      return { backgroundColor: props.iconColor };
    }
    
    // В противном случае определяем цвет на основе типа
    if (props.type === 'income' || props.amountType === 'positive') {
      return { backgroundColor: 'var(--color-success)' };
    } 
    else if (props.type === 'expense' || props.amountType === 'negative') {
      return { backgroundColor: 'var(--color-warning)' };
    }
    else if (props.type === 'transfer' || props.amountType === 'neutral') {
      return { backgroundColor: 'var(--text-contrast)' };
    }
    
    // Если тип не определен, но есть сумма
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
  
  // Форматированная сумма
  const formattedAmount = computed(() => {
    if (props.amount === undefined) {
      return '';
    }
    
    const isNegative = props.amount < 0;
    const absAmount = Math.abs(props.amount);
    
    // Для отрицательных сумм, не добавляем префикс, так как
    // он будет добавлен стилем через ::before
    const currency = props.currency || '';
    
    // Форматируем с разделителями тысяч
    return `${props.amountPrefix}${currency} ${absAmount.toLocaleString()}${props.amountSuffix}`;
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
    height: 54px;
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
  
  .item-content {
    flex: 1;
    padding: var(--spacing-sm) 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0; /* Для корректной работы text-overflow */
  }
  
  .item-title {
    color: var(--text-header);
    font-size: var(--font-body-size);
    line-height: var(--font-body-line-height);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .item-subtitle {
    color: var(--text-usual);
    font-size: var(--font-small-size);
    line-height: var(--font-small-line-height);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .item-description {
    color: var(--text-grey);
    font-size: var(--font-super-small-size);
    line-height: var(--font-super-small-line-height);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .item-amount {
    min-width: 110px;
    padding: var(--spacing-xs) 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
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
  
  .color-warning.amount::before {
    content: "";
    width: 3px;
    height: 1px;
    background: var(--color-warning);
    margin-right: 2px;
  }
  
  .item-info {
    width: 100%;
    text-align: right;
    color: var(--text-usual);
    font-size: var(--font-small-size);
    line-height: var(--font-small-line-height);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  </style>