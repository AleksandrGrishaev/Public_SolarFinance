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
      <div class="debug-info" v-if="debugMode">
        <div>Book ID from props: {{ props.initialBookId }}</div>
        <div>Current selected book: {{ localSelectedBook }}</div>
        <div>Total accounts: {{ accountStore.accounts.length }}</div>
        <div>Accounts in book: {{ accountsInBook.size }}</div>
      </div>
      
      <!-- Селектор книг с использованием BookSelector -->
      <BookSelector 
        v-model="localSelectedBook"
        class="book-selector"
        @update:modelValue="handleBookChange"
      />

      <!-- Список аккаунтов с информацией о принадлежности к выбранной книге -->
      <div class="account-list">
        <ListItemWithToggle
          v-for="account in sortedAccounts"
          :key="account.id"
          :title="account.name"
          :active="accountsInBook.has(account.id)"
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
import { ref, computed, onMounted, watch, onBeforeMount } from 'vue';
import { useAccountStore } from '../../../stores/account';
import { useBookStore } from '../../../stores/book';
import BasePopup from '../../../components/ui/BasePopup.vue';
import ListItemWithToggle from '../../../components/ui/lists/ListItemWithToggle.vue';
import BookSelector from '../../../components/ui/selectors/BookSelector.vue';
import CreateActionButton from '../../../components/ui/buttons/CreateActionButton.vue';
import AccountIcon from '../../../components/ui/icons/AccountIcon.vue';
import { IconPlus } from '@tabler/icons-vue';
import { useFormatBalance } from '../../../composables/transaction/useFormatBalance';

// Включаем режим отладки для дополнительной информации
const debugMode = ref(true);

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

// Используем локальную переменную для хранения выбранной книги
const localSelectedBook = ref('');

// Используем Set для эффективного хранения и проверки аккаунтов в текущей книге
const accountsInBook = ref(new Set<string>());

// Проверка, был ли уже выполнен первичный перерасчет аккаунтов
const initialAccountsLoaded = ref(false);

// Обновляет список аккаунтов в текущей книге
const updateAccountsInBook = () => {
  if (!localSelectedBook.value) {
    accountsInBook.value.clear();
    return;
  }
  
  console.log('[BookAccountsPopup] Updating accounts for book:', localSelectedBook.value);
  
  // Создаем новый Set для аккаунтов в текущей книге
  const accountsSet = new Set<string>();
  
  // Проходим по всем аккаунтам и проверяем принадлежность к книге
  accountStore.accounts.forEach(account => {
    if (account.bookIds && account.bookIds.includes(localSelectedBook.value)) {
      accountsSet.add(account.id);
    }
  });
  
  // Обновляем реактивный Set
  accountsInBook.value = accountsSet;
  
  console.log(`[BookAccountsPopup] Found ${accountsSet.size} accounts in book ${localSelectedBook.value}`);
  initialAccountsLoaded.value = true;
};

// Отслеживаем изменение props.initialBookId и обновляем локальную переменную
watch(() => props.initialBookId, (newBookId) => {
  console.log('[BookAccountsPopup] props.initialBookId changed to:', newBookId);
  
  if (newBookId) {
    localSelectedBook.value = newBookId;
    console.log('[BookAccountsPopup] localSelectedBook updated to:', localSelectedBook.value);
    
    // Обновляем список аккаунтов в книге
    updateAccountsInBook();
  }
}, { immediate: true });

// При изменении видимости попапа
watch(isVisible, (newValue) => {
  if (newValue) {
    if (props.initialBookId) {
      localSelectedBook.value = props.initialBookId;
      console.log('[BookAccountsPopup] localSelectedBook set on popup open:', localSelectedBook.value);
    }
    
    // Всегда обновляем список аккаунтов в книге при открытии
    updateAccountsInBook();
  }
});

// При изменении выбранной книги обновляем список аккаунтов
watch(() => localSelectedBook.value, (newBookId) => {
  if (newBookId && initialAccountsLoaded.value) {
    updateAccountsInBook();
  }
});

// Отслеживаем изменения в хранилище аккаунтов, чтобы мгновенно отображать изменения
watch(() => accountStore.accounts, () => {
  if (localSelectedBook.value) {
    updateAccountsInBook();
  }
}, { deep: true });

// Отсортированные аккаунты: сначала те что в книге, потом активные, затем неактивные
const sortedAccounts = computed(() => {
  // Проверяем, что у нас есть выбранная книга и загружены аккаунты
  if (!localSelectedBook.value || !initialAccountsLoaded.value) {
    return [...accountStore.accounts].sort((a, b) => {
      // Сортируем по активности: активные вверху, неактивные внизу
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      
      // Если оба активны или оба неактивны, сортируем по имени
      return a.name.localeCompare(b.name);
    });
  }
  
  return [...accountStore.accounts].sort((a, b) => {
    const aInBook = accountsInBook.value.has(a.id);
    const bInBook = accountsInBook.value.has(b.id);
    
    // Сначала отображаем счета из текущей книги
    if (aInBook && !bInBook) return -1;
    if (!aInBook && bInBook) return 1;
    
    // Затем сортируем по активности
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    
    // Если оба в книге или оба не в книге, и оба активны или оба неактивны, сортируем по имени
    return a.name.localeCompare(b.name);
  });
});

// Обработчик изменения выбранной книги
const handleBookChange = (newBookId) => {
  console.log('[BookAccountsPopup] Book changed to:', newBookId);
  localSelectedBook.value = newBookId;
};

// Переключение аккаунта в книге
const toggleAccountInBook = async (accountId, isChecked) => {
  if (!localSelectedBook.value) return;
  
  try {
    console.log(`[BookAccountsPopup] Toggling account ${accountId} in book ${localSelectedBook.value} to ${isChecked}`);
    
    // Немедленно обновляем UI для лучшего отклика
    if (isChecked) {
      accountsInBook.value.add(accountId);
    } else {
      accountsInBook.value.delete(accountId);
    }
    
    // Асинхронно обновляем данные
    if (isChecked) {
      // Добавляем аккаунт в книгу
      await accountStore.addAccountToBook(accountId, localSelectedBook.value);
      console.log(`[BookAccountsPopup] Account ${accountId} added to book ${localSelectedBook.value}`);
    } else {
      // Удаляем аккаунт из книги
      await accountStore.removeAccountFromBook(accountId, localSelectedBook.value);
      console.log(`[BookAccountsPopup] Account ${accountId} removed from book ${localSelectedBook.value}`);
    }
  } catch (error) {
    // В случае ошибки возвращаем предыдущее состояние UI
    if (isChecked) {
      accountsInBook.value.delete(accountId);
    } else {
      accountsInBook.value.add(accountId);
    }
    console.error('[BookAccountsPopup] Error toggling account in book:', error);
  }
};

// Выбор аккаунта
const selectAccount = (account) => {
  console.log('[BookAccountsPopup] Selected account:', account.name);
};

// Обработка изменения видимости
const handleVisibilityChange = (value) => {
  if (!value) {
    console.log('[BookAccountsPopup] Popup closed');
  }
};

// Добавление нового аккаунта
const handleAddAccount = () => {
  emit('add-account', localSelectedBook.value);
  isVisible.value = false;
};

// Показать меню аккаунта (редактирование, удаление и т.д.)
const showAccountMenu = (account) => {
  emit('edit-account', account);
};

onBeforeMount(() => {
  // Проверяем initialBookId или устанавливаем значение по умолчанию
  if (!props.initialBookId && bookStore.books.length > 0) {
    localSelectedBook.value = bookStore.books[0].id;
    console.log('[BookAccountsPopup] Set initial book to first available:', localSelectedBook.value);
  }
});

onMounted(async () => {
  // Инициализируем хранилища, если они ещё не инициализированы
  if (!bookStore.isInitialized) {
    await bookStore.init();
  }
  
  if (!accountStore.isInitialized) {
    await accountStore.init();
  }
  
  // Проверяем снова после инициализации и обновляем аккаунты
  if (!localSelectedBook.value && bookStore.books.length > 0) {
    localSelectedBook.value = bookStore.books[0].id;
  }
  
  // Загружаем аккаунты для выбранной книги
  updateAccountsInBook();
  
  console.log('[BookAccountsPopup] Mounted with selected book:', localSelectedBook.value);
});
</script>

<style scoped>
.book-accounts-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 20px;
}

.debug-info {
  padding: 4px 16px;
  background-color: rgba(255, 255, 255, 0.1);
  color: yellow;
  font-size: 12px;
  margin-bottom: 16px;
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