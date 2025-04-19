<!-- src/views/book/page/components/BookTransactionItem.vue -->
<template>
  <BaseTransactionItem 
    :title="transaction.description || 'Unnamed transaction'"
    :subtitle="ownerName"
    :info="accountInfo"
    :amount="transaction.bookAmount"
    :currency="transaction.bookCurrency"
    :type="transaction.type"
    :categoryIcon="categoryIcon"
    :categoryColor="categoryColor"
    :initials="initials"
    withBorder
    @click="$emit('click', transaction)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseTransactionItem from '@/components/ui/views/BaseTransactionItem.vue';
import { useUserStore } from '@/stores/user';
import { useAccountStore } from '@/stores/account';
import { useCategoryStore } from '@/stores/category';

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
const categoryStore = useCategoryStore();

// Получаем информацию о категории
const category = computed(() => {
  if (!props.transaction.categoryId) return null;
  
  return categoryStore.getCategoryById(props.transaction.categoryId);
});

// Иконка категории (если есть)
const categoryIcon = computed(() => {
  if (!category.value || !category.value.icon) return null;
  
  return category.value.icon;
});

// Цвет категории (если есть)
const categoryColor = computed(() => {
  if (!category.value || !category.value.color) return '';
  
  return category.value.color;
});

// Определение инициалов для иконки (если нет иконки категории)
const initials = computed(() => {
  // Если есть категория, используем первую букву названия категории
  if (category.value && category.value.name) {
    return category.value.name[0].toUpperCase();
  }
  
  // Иначе используем первую букву описания транзакции
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
</script>