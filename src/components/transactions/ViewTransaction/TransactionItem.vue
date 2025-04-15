<!-- src/components/transactions/TransactionItem.vue -->
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
      <div class="transaction-title">{{ title }}</div>
      <div class="transaction-subtitle">{{ subtitle }}</div>
      <div class="transaction-comment">{{ comment }}</div>
    </div>
    
    <!-- Сумма и счет -->
    <div class="transaction-amount">
      <div class="amount" :class="{ 'negative': isNegative, 'positive': !isNegative }">
        {{ formattedAmount }}
      </div>
      <div class="account-name">{{ accountName }}</div>
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
    default: '#D9D9D9'
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
  if (props.iconColor !== '#D9D9D9') {
    return { backgroundColor: props.iconColor };
  }
  
  // Определяем цвет на основе типа транзакции
  // Сначала проверяем явно заданный тип
  if (props.transactionType === 'income') {
    return { backgroundColor: '#53B794' }; // Зеленый для дохода
  } else if (props.transactionType === 'expense') {
    return { backgroundColor: '#A44942' }; // Красный для расхода
  } else if (props.transactionType === 'transfer') {
    return { backgroundColor: '#FFFFFF' }; // Белый для трансфера
  }
  
  // Если тип не задан явно, определяем по сумме транзакции
  if (props.transaction.amount > 0) {
    return { backgroundColor: '#53B794' }; // Зеленый для положительных сумм
  } else if (props.transaction.amount < 0) {
    return { backgroundColor: '#A44942' }; // Красный для отрицательных сумм
  } else if (props.transaction.type === 'transfer') {
    return { backgroundColor: '#FFFFFF' }; // Белый для трансферов из объекта транзакции
  }
  
  // По умолчанию серый цвет
  return { backgroundColor: '#D9D9D9' };
});

// Цвет текста иконки (для трансферов белый фон, черный текст)
const iconTextColor = computed(() => {
  // Для трансферов используем черный цвет текста
  if (props.transactionType === 'transfer' || props.transaction.type === 'transfer') {
    return 'black';
  }
  
  // Для остальных типов - белый
  return 'white';
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
  padding: 6px 20px 6px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.transaction-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.transaction-item.with-border {
  border-bottom: 0.5px solid #949496;
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
}

.transaction-name {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.transaction-title {
  color: white;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
}

.transaction-subtitle {
  color: white;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
}

.transaction-comment {
  color: white;
  font-size: 10px;
  font-weight: 400;
  line-height: 12px;
}

.transaction-amount {
  width: 88px;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.amount {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
}

.amount.negative {
  color: #A44942;
}

.amount.negative::before {
  content: "";
  width: 3.27px;
  height: 1.06px;
  background: #A44942;
  margin-right: 2px;
}

.amount.positive {
  color: #53B794;
}

.account-name {
  width: 100%;
  text-align: right;
  color: white;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
}
</style>