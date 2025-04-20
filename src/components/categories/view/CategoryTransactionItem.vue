<!-- src/components/categories/view/CategoryTransactionItem.vue -->
<template>
    <BaseTransactionItem
      :item="transaction"
      :title="title"
      :subtitle="subtitle"
      :description="transaction.description"
      :info="accountName"
      :amount="transaction.amount"
      :currency="transaction.currency || 'Rp'"
      :iconColor="iconColor"
      :initials="getInitials()"
      :type="transaction.type || getTransactionTypeFromAmount()"
      :withBorder="withBorder"
      @click="handleClick"
    />
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import BaseTransactionItem from '@/components/ui/views/BaseTransactionItem.vue';
  import * as TablerIcons from '@tabler/icons-vue';
  
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
    accountName: {
      type: String,
      default: ''
    },
    iconName: {
      type: String,
      default: ''
    },
    iconColor: {
      type: String,
      default: '#D9D9D9'
    },
    withBorder: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['click']);
  
  // Получение иконки из TablerIcons
  const categoryIcon = computed(() => {
    if (!props.iconName) return null;
    
    // Формируем имя иконки в формате Tabler (например, 'shopping' -> 'IconShoppingCart')
    const iconMap = {
      'shopping': 'IconShoppingCart',
      'coin': 'IconCoin',
      'wallet': 'IconWallet',
      'credit-card': 'IconCreditCard'
    };
    
    const iconName = iconMap[props.iconName] || `Icon${props.iconName.charAt(0).toUpperCase() + props.iconName.slice(1)}`;
    
    return TablerIcons[iconName] || null;
  });
  
  // Функция для получения инициалов из названия транзакции
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
    if (props.transaction.amount > 0) {
      return 'income';
    } else if (props.transaction.amount < 0) {
      return 'expense';
    }
    return 'transfer';
  };
  
  // Обработчик клика
  const handleClick = () => {
    emit('click', props.transaction);
  };
  </script>