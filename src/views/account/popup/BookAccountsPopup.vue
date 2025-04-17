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
        <div v-if="isLoading" class="loading-indicator">
          Loading accounts...
        </div>
        <template v-else>
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
        </template>
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
  
  <!-- Попап добавления счета -->
  <AccountAddPopup
    v-model="showAddAccountPopup"
    :initialBookId="localSelectedBook"
    @save="handleAccountAdded"
  />
  
  <!-- Попап редактирования счета -->
  <AccountEditPopup
    v-model="showEditAccountPopup"
    :account="selectedAccount"
    @save="handleAccountUpdated"
    @delete="handleAccountDeleted"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeMount, nextTick } from 'vue';
import { useAccountStore } from '../../../stores/account';
import { useBookStore } from '../../../stores/book';
import BasePopup from '../../../components/ui/BasePopup.vue';
import ListItemWithToggle from '../../../components/ui/lists/ListItemWithToggle.vue';
import BookSelector from '../../../components/ui/selectors/BookSelector.vue';
import CreateActionButton from '../../../components/ui/buttons/CreateActionButton.vue';
import AccountIcon from '../../../components/ui/icons/AccountIcon.vue';
import { IconPlus } from '@tabler/icons-vue';
import { useFormatBalance } from '../../../composables/transaction/useFormatBalance';
import AccountAddPopup from './AccountAddPopup.vue';
import AccountEditPopup from './AccountEditPopup.vue';
import { useAccountManagement } from './composables/useAccountManagement';

// Используем composable для управления счетами
const { init: initAccounts } = useAccountManagement();

// Включаем режим отладки для дополнительной информации
const debugMode = ref(true);

// Состояние загрузки для отображения индикатора
const isLoading = ref(false);

// Состояние видимости попапов
const showAddAccountPopup = ref(false);
const showEditAccountPopup = ref(false);

// Выбранный счет для редактирования
const selectedAccount = ref(null);

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

// Обновляет список аккаунтов в текущей книге
const updateAccountsInBook = () => {
  if (!localSelectedBook.value) {
    accountsInBook.value = new Set<string>();
    return;
  }
  
  isLoading.value = true;
  console.log('[BookAccountsPopup] Updating accounts for book:', localSelectedBook.value);
  
  try {
    // Создаем новый Set для аккаунтов в текущей книге
    const accountsSet = new Set<string>();
    
    // Проходим по всем аккаунтам и проверяем принадлежность к книге
    accountStore.accounts.forEach(account => {
      if (account.bookIds && account.bookIds.includes(localSelectedBook.value)) {
        accountsSet.add(account.id);
      }
    });
    
    // Обновляем реактивный Set - ВАЖНО: присваиваем новый Set вместо изменения существующего
    accountsInBook.value = accountsSet;
    
    console.log(`[BookAccountsPopup] Found ${accountsSet.size} accounts in book ${localSelectedBook.value}`);
    console.log(`[BookAccountsPopup] Accounts in book:`, [...accountsSet]);
  } catch (error) {
    console.error('[BookAccountsPopup] Error updating accounts:', error);
  } finally {
    // Принудительно обновляем информацию в UI, чтобы удостовериться, что переключатели корректны
    nextTick(() => {
      // Этот блок выполнится после обновления DOM
      console.log('[BookAccountsPopup] UI updated after accounts refresh');
      isLoading.value = false;
    });
  }
};

// Отслеживаем изменение props.initialBookId и обновляем локальную переменную
watch(() => props.initialBookId, (newBookId) => {
  console.log('[BookAccountsPopup] props.initialBookId changed to:', newBookId);
  
  if (newBookId) {
    localSelectedBook.value = newBookId;
    console.log('[BookAccountsPopup] localSelectedBook updated to:', localSelectedBook.value);
    
    // Обновляем список аккаунтов в книге с небольшой задержкой, чтобы гарантировать, 
    // что все данные обновились
    setTimeout(() => {
      updateAccountsInBook();
    }, 10);
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
    setTimeout(() => {
      updateAccountsInBook();
    }, 10);
  }
});

// При изменении выбранной книги обновляем список аккаунтов
watch(() => localSelectedBook.value, (newBookId, oldBookId) => {
  console.log(`[BookAccountsPopup] Book selection changed from ${oldBookId} to ${newBookId}`);
  
  if (newBookId) {
    // Очищаем предыдущий набор аккаунтов для избежания путаницы при переключении
    accountsInBook.value = new Set<string>();
    
    // Обновляем список аккаунтов с небольшой задержкой
    setTimeout(() => {
      updateAccountsInBook();
    }, 10);
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
  // Получаем текущий выбранный ID книги
  const currentBookId = localSelectedBook.value;
  const currentAccountsInBook = accountsInBook.value;
  
  // Вывод для отладки
  console.log(`[BookAccountsPopup] Computing sortedAccounts: currentBookId=${currentBookId}, accounts in book=${currentAccountsInBook.size}`);
  
  // Если нет выбранной книги, просто сортируем по активности
  if (!currentBookId) {
    return [...accountStore.accounts].sort((a, b) => {
      // Сортируем по активности: активные вверху, неактивные внизу
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      
      // Если оба активны или оба неактивны, сортируем по имени
      return a.name.localeCompare(b.name);
    });
  }
  
  // Дополнительно проверяем, что аккаунт реально принадлежит книге
  const accountsByBook = accountStore.getAccountsByBookId(currentBookId).map(acc => acc.id);
  console.log(`[BookAccountsPopup] Accounts for book ${currentBookId} (from store):`, accountsByBook);
  
  // Если есть выбранная книга, используем полную сортировку
  return [...accountStore.accounts].sort((a, b) => {
    // Надежно проверяем, принадлежит ли аккаунт выбранной книге
    // Проверяем с помощью двух источников данных для надежности
    const aInBook = currentAccountsInBook.has(a.id) || 
                   (a.bookIds && a.bookIds.includes(currentBookId));
                   
    const bInBook = currentAccountsInBook.has(b.id) || 
                   (b.bookIds && b.bookIds.includes(currentBookId));
    
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
const handleBookChange = async (newBookId) => {
  console.log('[BookAccountsPopup] Book changed to:', newBookId);
  
  // Важно сначала обновить данные аккаунтов, а затем изменить localSelectedBook
  // Устанавливаем временно значение, которое покажет, что идет переключение книги
  accountsInBook.value = new Set<string>();
  
  // Обновляем аккаунты для новой книги перед изменением выбранной книги
  if (newBookId) {
    // Получаем аккаунты для новой книги напрямую из хранилища
    const accountsForNewBook = accountStore.getAccountsByBookId(newBookId);
    const newAccountsSet = new Set<string>();
    
    // Заполняем Set ID аккаунтов для новой книги
    accountsForNewBook.forEach(account => {
      newAccountsSet.add(account.id);
    });
    
    console.log(`[BookAccountsPopup] Pre-loaded accounts for book ${newBookId}:`, [...newAccountsSet]);
    
    // Устанавливаем новый Set перед обновлением выбранной книги
    accountsInBook.value = newAccountsSet;
  }
  
  // После подготовки данных, обновляем выбранную книгу
  localSelectedBook.value = newBookId;
  
  // Дополнительно запускаем обновление для уверенности, что все синхронизировано
  nextTick(() => {
    updateAccountsInBook();
  });
};

// Переключение аккаунта в книге
const toggleAccountInBook = async (accountId, isChecked) => {
  if (!localSelectedBook.value) return;
  
  try {
    console.log(`[BookAccountsPopup] Toggling account ${accountId} in book ${localSelectedBook.value} to ${isChecked}`);
    
    // Немедленно обновляем UI для лучшего отклика
    // Создаем новый Set для обеспечения реактивности
    const newAccountsInBook = new Set(accountsInBook.value);
    
    if (isChecked) {
      newAccountsInBook.add(accountId);
    } else {
      newAccountsInBook.delete(accountId);
    }
    
    // Присваиваем новый Set вместо изменения существующего
    accountsInBook.value = newAccountsInBook;
    console.log(`[BookAccountsPopup] UI updated: account ${accountId} in book: ${isChecked}`);
    
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
    
    // После завершения операции, проверяем, что UI соответствует актуальному состоянию
    await nextTick();
    const actualState = (accountStore.getAccountById(accountId)?.bookIds || []).includes(localSelectedBook.value);
    if (actualState !== isChecked) {
      console.warn(`[BookAccountsPopup] State mismatch: UI shows ${isChecked} but actual state is ${actualState}`);
      
      // Принудительно синхронизируем состояние UI с реальным состоянием
      const syncedSet = new Set(accountsInBook.value);
      if (actualState) {
        syncedSet.add(accountId);
      } else {
        syncedSet.delete(accountId);
      }
      accountsInBook.value = syncedSet;
    }
  } catch (error) {
    // В случае ошибки возвращаем предыдущее состояние UI
    // Снова создаем новый Set для обеспечения реактивности
    const newAccountsInBook = new Set(accountsInBook.value);
    
    if (isChecked) {
      newAccountsInBook.delete(accountId);
    } else {
      newAccountsInBook.add(accountId);
    }
    
    accountsInBook.value = newAccountsInBook;
    console.error('[BookAccountsPopup] Error toggling account in book:', error);
  }
};

// Выбор аккаунта
const selectAccount = (account) => {
  console.log('[BookAccountsPopup] Selected account:', account.name);
  showAccountMenu(account);
};

// Обработка изменения видимости
const handleVisibilityChange = (value) => {
  if (!value) {
    console.log('[BookAccountsPopup] Popup closed');
  }
};

// Добавление нового аккаунта
const handleAddAccount = () => {
  // Вместо эмита события, открываем попап добавления аккаунта
  showAddAccountPopup.value = true;
};

// Обработчик успешного добавления аккаунта
const handleAccountAdded = (account) => {
  console.log('[BookAccountsPopup] Account added:', account);
  // Обновляем список аккаунтов
  updateAccountsInBook();
};

// Показать меню аккаунта (редактирование, удаление и т.д.)
const showAccountMenu = (account) => {
  // Вместо эмита события, устанавливаем выбранный аккаунт и открываем попап редактирования
  selectedAccount.value = account;
  showEditAccountPopup.value = true;
};

// Обработчик успешного обновления аккаунта
const handleAccountUpdated = (account) => {
  console.log('[BookAccountsPopup] Account updated:', account);
  // Обновляем список аккаунтов
  updateAccountsInBook();
};

// Обработчик успешного удаления аккаунта
const handleAccountDeleted = (accountId) => {
  console.log('[BookAccountsPopup] Account deleted:', accountId);
  // Обновляем список аккаунтов
  updateAccountsInBook();
};

onBeforeMount(() => {
  // Проверяем initialBookId или устанавливаем значение по умолчанию
  if (!props.initialBookId && bookStore.books.length > 0) {
    localSelectedBook.value = bookStore.books[0].id;
    console.log('[BookAccountsPopup] Set initial book to first available:', localSelectedBook.value);
  }
});

onMounted(async () => {
  console.log('[BookAccountsPopup] Component mounting...');
  
  // Инициализируем хранилища, если они ещё не инициализированы
  if (!bookStore.isInitialized) {
    await bookStore.init();
    console.log('[BookAccountsPopup] Book store initialized');
  }
  
  if (!accountStore.isInitialized) {
    await accountStore.init();
    console.log('[BookAccountsPopup] Account store initialized');
  }
  
  // Инициализация хранилищ через composable
  await initAccounts();
  
  // Проверяем снова после инициализации и обновляем аккаунты
  if (!localSelectedBook.value && bookStore.books.length > 0) {
    localSelectedBook.value = bookStore.books[0].id;
    console.log('[BookAccountsPopup] Selected first available book:', localSelectedBook.value);
  }
  
  // Даем небольшую задержку для инициализации компонента
  setTimeout(() => {
    // Загружаем аккаунты для выбранной книги
    updateAccountsInBook();
    
    // Проверяем, что все отображается корректно
    nextTick(() => {
      console.log('[BookAccountsPopup] Component fully mounted and updated');
      console.log('[BookAccountsPopup] Current accountsInBook:', [...accountsInBook.value]);
    });
  }, 50);
  
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

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: #AEAEAE;
  font-size: 14px;
}
</style>