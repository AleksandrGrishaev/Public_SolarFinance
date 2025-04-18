<!-- src/components/transactions/ViewTransaction/TransactionItem.vue -->
<template>
  <div 
    class="transaction-item"
    :class="{ 'with-border': withBorder }"
    @click="$emit('click', transaction)"
  >
    <!-- Иконка -->
    <div class="transaction-icon">
      <div class="icon-wrapper" :style="iconBackgroundStyle">
        <component v-if="categoryIcon" :is="categoryIcon" :size="24" :color="iconTextColor" />
        <span v-else class="category-placeholder">{{ getInitials() }}</span>
      </div>
    </div>
    
    <!-- Название и данные -->
    <div class="transaction-name">
      <div class="transaction-title en-body">{{ title }}</div>
      <div class="transaction-subtitle en-small">{{ subtitle }}</div>
      <div class="transaction-comment en-super-small">{{ comment }}</div>
    </div>
    
    <!-- Сумма и счет -->
    <div class="transaction-amount">
      <div class="amount" :class="{ 'color-warning': isNegative, 'color-success': !isNegative }">
        {{ formattedAmount }}
      </div>
      <div class="account-name en-small">{{ accountName }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  transaction: {
    type: Object,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  comment: {
    type: String,
    default: ''
  },
  accountName: {
    type: String,
    default: ''
  },
  iconColor: {
    type: String,
    default: 'var(--bg-light)'
  },
  categoryIcon: {
    type: Object,
    default: null
  },
  withBorder: {
    type: Boolean,
    default: false
  },
  // Добавляем явный тип транзакции для более гибкого контроля
  transactionType: {
    type: String,
    default: '' // 'income', 'expense', 'transfer'
  }
});

const emit = defineEmits(['click']);

// Функция для получения инициалов из названия категории/транзакции
// когда иконка не предоставлена
const getInitials = () => {
  if (props.title) {
    const words = props.title.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1 && words[0].length > 0) {
      return words[0][0].toUpperCase();
    }
  }
  return '';
};

// Стиль фона иконки на основе типа транзакции
const iconBackgroundStyle = computed(() => {
  // Если задан явный цвет, используем его
  if (props.iconColor !== 'var(--bg-light)') {
    return { backgroundColor: props.iconColor };
  }
  
  // Определяем цвет на основе типа транзакции
  // Сначала проверяем явно заданный тип
  if (props.transactionType === 'income') {
    return { backgroundColor: 'var(--color-success)' }; // Зеленый для дохода
  } else if (props.transactionType === 'expense') {
    return { backgroundColor: 'var(--color-warning)' }; // Красный для расхода
  } else if (props.transactionType === 'transfer') {
    return { backgroundColor: 'var(--text-contrast)' }; // Белый для трансфера
  }
  
  // Если тип не задан явно, определяем по сумме транзакции
  if (props.transaction.amount > 0) {
    return { backgroundColor: 'var(--color-success)' }; // Зеленый для положительных сумм
  } else if (props.transaction.amount < 0) {
    return { backgroundColor: 'var(--color-warning)' }; // Красный для отрицательных сумм
  } else if (props.transaction.type === 'transfer') {
    return { backgroundColor: 'var(--text-contrast)' }; // Белый для трансферов из объекта транзакции
  }
  
  // По умолчанию серый цвет
  return { backgroundColor: 'var(--bg-light)' };
});

// Цвет текста иконки (для трансферов белый фон, черный текст)
const iconTextColor = computed(() => {
  // Для трансферов используем черный цвет текста
  if (props.transactionType === 'transfer' || props.transaction.type === 'transfer') {
    return 'black';
  }
  
  // Для остальных типов - белый
  return 'var(--text-contrast)';
});

// Отрицательная ли сумма
const isNegative = computed(() => props.transaction.amount < 0);

// Форматированная сумма
const formattedAmount = computed(() => {
  const prefix = isNegative.value ? '-' : '';
  const absAmount = Math.abs(props.transaction.amount);
  
  // Форматирование с разделителями тысяч
  const currency = props.transaction.currency || 'Rp';
  return `${prefix}${currency} ${absAmount.toLocaleString('id-ID')}`;
});
</script>

<style scoped>
.transaction-item {
  padding: var(--spacing-xs) var(--spacing-md) var(--spacing-xs) var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  transition: all var(--transition-speed);
  position: relative;
}


.transaction-item:active {
  background-color: rgba(255, 255, 255, 0.05);
}

.transaction-item:active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid var(--color-primary);
  pointer-events: none;
  z-index: 1;
  border-radius: 0; /* По умолчанию без скругления */
}

/* 
 * Задаем скругления в зависимости от положения элемента:
 * 1. Для элемента, который является и первым и последним (одиночный) - скругление со всех сторон
 * 2. Для первого элемента - скругление только сверху
 * 3. Для последнего элемента - скругление только снизу
 */
 .transaction-item:first-child:last-child:active::after {
  /* Для одиночного элемента (он и первый, и последний) - полное скругление */
  border-radius: calc(var(--border-radius-xl));
}

.transaction-item:first-child:not(:last-child):active::after {
  /* Для первого элемента (но не последнего) - скругление только сверху */
  border-top-left-radius: calc(var(--border-radius-xl) );
  border-top-right-radius: calc(var(--border-radius-xl) );
}

.transaction-item:last-child:not(:first-child):active::after {
  /* Для последнего элемента (но не первого) - скругление только снизу */
  border-bottom-left-radius: calc(var(--border-radius-xl) );
  border-bottom-right-radius: calc(var(--border-radius-xl) );
}

.transaction-item.with-border {
  border-bottom: 0.5px solid var(--bg-light);
}

.transaction-icon {
  width: 37px;
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
}

.category-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
  color: var(--text-contrast);
}

.transaction-name {
  flex: 1;
  padding: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.transaction-title {
  color: var(--text-header);
}

.transaction-subtitle {
  color: var(--text-usual);
}

.transaction-comment {
  color: var(--text-grey);
}

.transaction-amount {
  min-width: 120px;
  padding: var(--spacing-xs) 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.amount {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: var(--font-body-size);
  font-weight: var(--font-body-weight);
  line-height: var(--font-body-line-height);
  text-align: right;
  word-break: keep-all;
  white-space: nowrap;
}

.amount.color-warning::before {
  content: "";
  width: 3px;
  height: 1px;
  background: var(--color-warning);
  margin-right: 2px;
}

.account-name {
  width: 100%;
  text-align: right;
  color: var(--text-usual);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>