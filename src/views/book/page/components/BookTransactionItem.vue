<!-- src/views/book/page/components/BookTransactionItem.vue -->
<template>
    <BaseTransactionItem 
      :title="transaction.description || 'Unnamed transaction'"
      :subtitle="ownerName"
      :info="accountInfo"
      :amount="transaction.amount"
      :type="transaction.type"
      withBorder
      @click="$emit('click', transaction)"
    >
      <template #icon>
        <div class="icon-wrapper" :style="iconStyle">
          <span class="icon-placeholder">{{ initials }}</span>
        </div>
      </template>
    </BaseTransactionItem>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import BaseTransactionItem from '@/components/ui/views/BaseTransactionItem.vue';
  import { useUserStore } from '@/stores/user';
  import { useAccountStore } from '@/stores/account';
  
  const props = defineProps({
    transaction: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['click']);
  
  // Хранилища
  const userStore = useUserStore();
  const accountStore = useAccountStore();
  
  // Определение инициалов для иконки
  const initials = computed(() => {
    const description = props.transaction.description || '';
    if (!description) return '?';
    
    // Берем первую букву первого слова
    const words = description.split(' ');
    if (words.length > 0 && words[0].length > 0) {
      return words[0][0].toUpperCase();
    }
    
    return '?';
  });
  
  // Имя владельца транзакции
  const ownerName = computed(() => {
    const ownerId = props.transaction.executedByOwnerId;
    const user = userStore.getAllUsers().find(user => user.id === ownerId);
    return user ? user.name : 'Unknown';
  });
  
  // Информация о счете
  const accountInfo = computed(() => {
    if (props.transaction.type === 'income') {
      // Для дохода показываем счет назначения
      const accountId = props.transaction.destinationEntityId;
      if (!accountId) return '';
      
      const account = accountStore.getAccountById(accountId);
      return account ? account.name : '';
    } else {
      // Для расхода показываем счет источника
      const accountId = props.transaction.sourceEntityId;
      if (!accountId) return '';
      
      const account = accountStore.getAccountById(accountId);
      return account ? account.name : '';
    }
  });
  
  // Стиль иконки в зависимости от типа транзакции
  const iconStyle = computed(() => {
    if (props.transaction.type === 'income') {
      return { backgroundColor: 'var(--color-success)' };
    } else if (props.transaction.type === 'expense') {
      return { backgroundColor: 'var(--color-warning)' };
    } else {
      return { backgroundColor: 'var(--bg-light)' };
    }
  });
  </script>
  
  <style scoped>
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
  </style>