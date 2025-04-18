<!-- src/components/ui/views/BaseTransactionGroup.vue -->
<template>
    <div class="base-transaction-group">
      <!-- Заголовок группы с датой или другой информацией -->
      <div class="group-header">
        <slot name="header">
          <div class="group-title">{{ title }}</div>
          <div class="group-amount" :class="amountClass">
            {{ formattedAmount }}
          </div>
        </slot>
      </div>
      
      <!-- Контейнер для списка элементов -->
      <div class="group-content" :class="{ 'custom-content': $slots.default }">
        <slot>
          <!-- Если дочерних элементов нет, показываем заглушку или пустое состояние -->
          <div class="empty-state" v-if="showEmptyState">
            <slot name="empty">
              <div class="empty-message">{{ emptyMessage }}</div>
            </slot>
          </div>
        </slot>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  
  const props = defineProps({
    // Основная информация группы
    title: {
      type: String,
      default: ''
    },
    
    // Данные о сумме
    amount: {
      type: Number,
      default: 0
    },
    amountType: {
      type: String,
      default: '' // 'positive', 'negative', 'neutral'
    },
    currency: {
      type: String,
      default: ''
    },
    
    // Дополнительные опции
    showEmptyState: {
      type: Boolean,
      default: false
    },
    emptyMessage: {
      type: String,
      default: 'No items to display'
    },
    
    // Форматирование
    amountFormatter: {
      type: Function,
      default: null
    },
    
    // Стили
    headerClass: {
      type: String,
      default: ''
    },
    contentClass: {
      type: String,
      default: ''
    }
  });
  
  // Определяем класс для суммы (положительная/отрицательная)
  const amountClass = computed(() => {
    // Если задан тип суммы, используем его
    if (props.amountType === 'positive') {
      return 'color-success';
    } 
    else if (props.amountType === 'negative') {
      return 'color-warning';
    }
    
    // Иначе определяем по значению
    if (props.amount > 0) {
      return 'color-success';
    } 
    else if (props.amount < 0) {
      return 'color-warning';
    }
    
    return ''; // Нейтральный цвет
  });
  
  // Форматируем сумму
  const formattedAmount = computed(() => {
    // Используем пользовательский форматер, если он задан
    if (typeof props.amountFormatter === 'function') {
      return props.amountFormatter(props.amount, props.currency);
    }
    
    // Стандартное форматирование
    const absAmount = Math.abs(props.amount);
    const currency = props.currency ? `${props.currency} ` : '';
    
    // Форматирование с разделителями тысяч, без префикса минус
    // Он будет добавлен через CSS для отрицательных сумм
    return `${currency}${absAmount.toLocaleString()}`;
  });
  </script>
  
  <style scoped>
  .base-transaction-group {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-bottom: var(--spacing-md);
  }
  
  .group-header {
    width: 100%;
    padding: 0 var(--spacing-md);
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xs);
  }
  
  .group-title {
    padding: var(--spacing-sm);
    color: var(--text-header);
    font-size: var(--font-small-size);
    font-weight: var(--font-small-weight);
    line-height: var(--font-small-line-height);
  }
  
  .group-amount {
    padding: var(--spacing-sm);
    padding-right: var(--spacing-xl);
    color: var(--text-header);
    display: flex;
    align-items: center;
    gap: 3px;
    text-align: right;
    min-width: 120px;
    justify-content: flex-end;
    font-size: var(--font-small-size);
    font-weight: var(--font-small-weight);
    line-height: var(--font-small-line-height);
  }
  
  .group-content {
    width: 100%;
    background: var(--bg-dropdown);
    border-radius: var(--border-radius-lg);
    display: flex;
    flex-direction: column;
    overflow: hidden; /* Для соблюдения скругления углов */
  }
  
  .custom-content {
    /* Пользовательский контент может иметь свои стили */
  }
  
  .empty-state {
    padding: var(--spacing-lg);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .empty-message {
    color: var(--text-inactive);
    font-size: var(--font-small-size);
    text-align: center;
  }
  
  /* Стили для цветового выделения сумм */
  .color-success {
    color: var(--color-success);
  }
  
  .color-warning {
    color: var(--color-warning);
  }
  
  .color-warning.group-amount::before {
    content: "";
    width: 3px;
    height: 1px;
    background: var(--color-warning);
    margin-right: 2px;
  }
  </style>