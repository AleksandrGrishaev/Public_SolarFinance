<!-- src/components/transactions/ViewTransaction/TransactionItem.vue -->
<template>
  <BaseTransactionItem
    :item="transaction"
    :title="title"
    :subtitle="subtitle"
    :description="comment"
    :info="accountName"
    :amount="transaction.amount"
    :currency="transaction.currency || 'Rp'"
    :icon="categoryIcon"
    :iconColor="iconColor"
    :initials="getInitials()"
    :type="transactionType || getTransactionTypeFromAmount()"
    :withBorder="withBorder"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseTransactionItem from '@/components/ui/views/BaseTransactionItem.vue';

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

// Определение типа транзакции на основе суммы
const getTransactionTypeFromAmount = () => {
  if (props.transaction.type === 'transfer') {
    return 'transfer';
  } else if (props.transaction.amount > 0) {
    return 'income';
  } else if (props.transaction.amount < 0) {
    return 'expense';
  }
  return '';
};

// Обработчик клика
const handleClick = (event) => {
  emit('click', props.transaction);
};
</script>