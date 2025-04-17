<!-- src/views/account/popup/BookAccountsPopup.vue -->
<template>
  <BasePopup
    v-model="isVisible"
    title="Book accounts"
    :rightIcon="IconPlus"
    @rightIconClick="handleAddAccount"
    @update:modelValue="handleVisibilityChange"
  >
    <div class="book-accounts-container">
      <!-- Селектор книг с использованием BookSelector -->
      <BookSelector 
        v-model="selectedBook"
        class="book-selector"
      />

      <!-- Список аккаунтов в книге с использованием общего компонента -->
      <div class="account-list">
        <ListItemWithToggle
          v-for="account in filteredAccounts"
          :key="account.id"
          :title="account.name"
          :active="isAccountInSelectedBook(account.id)"
          :icon-background-color="account.color || '#808080'"
          @select="selectAccount(account)"
          @toggle="(isActive) => toggleAccountInBook(account.id, isActive)"
          @menu="showAccountMenu(account)"
        >

        <template #icon-content>
            <AccountIcon :account="account" :size="20" />
          </template>

          <template #subtitle>
            <div class="account-balance">{{ formatAccountBalance(account) }}</div>
          </template>
        </ListItemWithToggle>
      </div>

      <!-- Кнопка добавления нового аккаунта с использованием CreateActionButton -->
      <CreateActionButton 
        @click="handleAddAccount"
        text="Add account"
        color="white"
        class="add-button"
      />
    </div>
  </BasePopup>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAccountStore } from '../../../stores/account';
import { useBookStore } from '../../../stores/book';
import BasePopup from '../../../components/ui/BasePopup.vue';
import ListItemWithToggle from '../../../components/ui/lists/ListItemWithToggle.vue';
import BookSelector from '../../../components/ui/selectors/BookSelector.vue';
import CreateActionButton from '../../../components/ui/buttons/CreateActionButton.vue';
import AccountIcon from '../../../components/ui/icons/AccountIcon.vue';
import { IconPlus } from '@tabler/icons-vue';
import { useFormatBalance } from '../../../composables/transaction/useFormatBalance';

// Инициализируем форматирование баланса
const { getCurrencySymbol, formatAccountBalance } = useFormatBalance();


// Props и Emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  initialBookId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'add-account', 'edit-account']);

// Видимость попапа
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Инициализация хранилищ
const accountStore = useAccountStore();
const bookStore = useBookStore();

// Состояние компонента
const selectedBook = ref(props.initialBookId);
const books = computed(() => bookStore.books);

// Фильтрованные аккаунты для выбранной книги
const filteredAccounts = computed(() => {
  // Если книга не выбрана, показываем все аккаунты
  if (!selectedBook.value) {
    return accountStore.accounts;
  }
  
  // Сортируем - сначала те, что в книге, потом все остальные
  return [...accountStore.accounts].sort((a, b) => {
    const aInBook = isAccountInSelectedBook(a.id);
    const bInBook = isAccountInSelectedBook(b.id);
    
    if (aInBook && !bInBook) return -1;
    if (!aInBook && bInBook) return 1;
    
    // Если оба в книге или оба не в книге, сортируем по имени
    return a.name.localeCompare(b.name);
  });
});

// Проверяет, находится ли аккаунт в выбранной книге
const isAccountInSelectedBook = (accountId) => {
  if (!selectedBook.value) return false;
  
  const account = accountStore.getAccountById(accountId);
  return account && account.bookIds && account.bookIds.includes(selectedBook.value);
};

// Переключение аккаунта в книге
const toggleAccountInBook = async (accountId, isChecked) => {
  if (!selectedBook.value) return;
  
  if (isChecked) {
    await accountStore.addAccountToBook(accountId, selectedBook.value);
  } else {
    await accountStore.removeAccountFromBook(accountId, selectedBook.value);
  }
};

// Выбор аккаунта
const selectAccount = (account) => {
  // Можно добавить дополнительную логику при выборе аккаунта
  console.log('Selected account:', account.name);
};

// Обработка изменения видимости
const handleVisibilityChange = (value) => {
  if (!value) {
    // Сброс к начальному состоянию при закрытии
    selectedBook.value = props.initialBookId;
  }
};

// Добавление нового аккаунта
const handleAddAccount = () => {
  emit('add-account', selectedBook.value);
  isVisible.value = false;
};

// Показать меню аккаунта (редактирование, удаление и т.д.)
const showAccountMenu = (account) => {
  emit('edit-account', account);
};

onMounted(() => {
  // Если начальная книга не выбрана, выбираем первую доступную
  if (!selectedBook.value && books.value.length > 0) {
    selectedBook.value = books.value[0].id;
  }
});
</script>

<style scoped>
.book-accounts-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 20px;
}

/* Селектор книг */
.book-selector {
  margin-bottom: 20px;
  width: 100%;
}

/* Список аккаунтов */
.account-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
  width: 100%;
}

/* Для дополнительных стилей внутри слотов */
.account-balance {
  color: #AEAEAE;
  font-size: 12px;
  line-height: 16px;
}

</style>