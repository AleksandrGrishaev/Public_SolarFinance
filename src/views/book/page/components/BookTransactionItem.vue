<!-- src/views/book/page/components/BookTransactionItem.vue -->
<template>
  <BaseTransactionItem 
    :title="categoryName"
    :subtitle="ownerName"
    :description="transaction.description"
    :info="accountInfoWithAmount"
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
import { computed, onMounted, ref } from 'vue';
import BaseTransactionItem from '@/components/ui/views/BaseTransactionItem.vue';
import { useUserStore } from '@/stores/user';
import { useAccountStore } from '@/stores/account';
import { useCategoryStore } from '@/stores/category';
import { useBookContext } from '../composables/useBookContext';

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
const { currentBook } = useBookContext();
const accountsInitialized = ref(false);

// Инициализация хранилища аккаунтов, если оно еще не было инициализировано
onMounted(async () => {
  if (!accountStore.isInitialized) {
    await accountStore.init();
  }
  accountsInitialized.value = true;
});

// Получаем информацию о категории
const category = computed(() => {
  if (!props.transaction.categoryId) return null;

  return categoryStore.getCategoryById(props.transaction.categoryId);
});

// Имя категории (для отображения в первой строке)
const categoryName = computed(() => {
  if (category.value && category.value.name) {
    return category.value.name;
  }
  return 'Unnamed category';
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

// Получение данных аккаунта с проверкой
const getAccount = (accountId) => {
  if (!accountId) return null;
  if (!accountsInitialized.value) return null;

  return accountStore.getAccountById(accountId);
};

// Определяем, отличается ли валюта счета от валюты книги
const isAccountCurrencyDifferent = (account) => {
  if (!account || !account.currency) return false;
  if (!props.transaction.bookCurrency) return false;

  return account.currency !== props.transaction.bookCurrency;
};

// Форматирование суммы с символом валюты
const formatAmountWithCurrency = (amount, currency) => {
  if (amount === undefined || amount === null) return '';

  const absAmount = Math.abs(amount);
  let currencySymbol = '';

  // Определяем символ валюты
  if (currency) {
    if (currency === 'IDR' || currency === 'Rp') {
      currencySymbol = 'Rp ';
    } else if (currency === 'USD') {
      currencySymbol = '$ ';
    } else if (currency === 'RUB') {
      currencySymbol = '₽ ';
    } else {
      currencySymbol = `${currency} `;
    }
  }

  return `${currencySymbol}${absAmount.toLocaleString()}`;
};

// Информация о счете
const accountInfo = computed(() => {
  if (props.transaction.type === 'income') {
    // Для дохода показываем счет назначения
    const accountId = props.transaction.destinationEntityId;
    if (!accountId) return '';
    
    const account = getAccount(accountId);
    return account ? account.name : '';
  } else if (props.transaction.type === 'expense') {
    // Для расхода показываем счет источника
    const accountId = props.transaction.sourceEntityId;
    if (!accountId) return '';
    
    const account = getAccount(accountId);
    return account ? account.name : '';
  } else if (props.transaction.type === 'transfer') {
    // Для перевода показываем оба счета
    const sourceId = props.transaction.sourceEntityId;
    const destId = props.transaction.destinationEntityId;
    
    const sourceAccount = sourceId ? getAccount(sourceId) : null;
    const destAccount = destId ? getAccount(destId) : null;
    
    if (sourceAccount && destAccount) {
      return `${sourceAccount.name} → ${destAccount.name}`;
    } else if (sourceAccount) {
      return `From: ${sourceAccount.name}`;
    } else if (destAccount) {
      return `To: ${destAccount.name}`;
    }
  }

  return '';
});

// Информация о счете с оригинальной суммой в валюте счета
const accountInfoWithAmount = computed(() => {
  let account = null;

  if (props.transaction.type === 'income') {
    const accountId = props.transaction.destinationEntityId;
    account = getAccount(accountId);
  } else if (props.transaction.type === 'expense') {
    const accountId = props.transaction.sourceEntityId;
    account = getAccount(accountId);
  } else if (props.transaction.type === 'transfer') {
    // Для переводов используем стандартную информацию о счетах
    return accountInfo.value;
  }

  // Если счет не найден, возвращаем стандартную информацию
  if (!account) return accountInfo.value;

  // Проверяем, отличается ли валюта счета от валюты книги
  if (!isAccountCurrencyDifferent(account)) {
    return account.name;
  }

  // Формируем строку с суммой в валюте счета
  const originalAmount = props.transaction.amount;
  const originalCurrency = props.transaction.currency;
  const formattedAmount = formatAmountWithCurrency(originalAmount, originalCurrency);

  // Возвращаем информацию в формате "Счет | символ сумма"
  return `${account.name} | ${formattedAmount}`;
});
</script>

<style scoped>
/* При необходимости можно добавить дополнительные стили для компонента */
</style>