<!-- src/views/DebugStoreView.vue -->
<template>
  <div class="debug-store-view">
    <n-layout has-sider>
      <!-- Боковая панель с вкладками -->
      <n-layout-sider
        content-style="padding: 24px;"
        :width="240"
        :collapsed-width="64"
        :native-scrollbar="false"
        :bordered="true"
      >
        <n-menu
          v-model:value="activeKey"
          :options="menuOptions"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          default-value="user"
        />
      </n-layout-sider>

      <!-- Основное содержимое -->
      <n-layout content-style="padding: 24px;">
        <n-page-header 
          title="Debug Store" 
          subtitle="Инструмент отладки хранилищ"
        >
          <template #extra>
            <n-space>
              <n-button @click="refreshStores" :loading="isRefreshing">
                <template #icon>
                  <n-icon><icon-refresh /></n-icon>
                </template>
                Обновить
              </n-button>
              <n-button type="error" @click="clearStores" :loading="isClearing">
                <template #icon>
                  <n-icon><icon-trash /></n-icon>
                </template>
                Очистить localStorage
              </n-button>
            </n-space>
          </template>
        </n-page-header>

        <n-divider />

        <!-- Панель с данными выбранного стора -->
        <div class="store-content">
          <template v-if="activeKey === 'user'">
            <n-card title="Данные пользователя">
              <n-descriptions bordered>
                <n-descriptions-item label="Текущий пользователь">
                  {{ userStore.currentUser ? userStore.currentUser.name : 'Нет' }}
                </n-descriptions-item>
                <n-descriptions-item label="ID пользователя">
                  {{ userStore.currentUser ? userStore.currentUser.id : '-' }}
                </n-descriptions-item>
                <n-descriptions-item label="Аутентифицирован">
                  <n-tag :type="userStore.isAuthenticated ? 'success' : 'error'">
                    {{ userStore.isAuthenticated ? 'Да' : 'Нет' }}
                  </n-tag>
                </n-descriptions-item>
              </n-descriptions>

              <n-divider title-placement="left">Настройки пользователя</n-divider>
              <n-descriptions bordered v-if="userStore.currentUser?.settings">
                <n-descriptions-item label="Тема">
                  {{ userStore.currentUser.settings.theme }}
                </n-descriptions-item>
                <n-descriptions-item label="Язык">
                  {{ userStore.currentUser.settings.language }}
                </n-descriptions-item>
                <n-descriptions-item label="Базовая валюта">
                  {{ userStore.currentUser.settings.baseCurrency || '-' }}
                </n-descriptions-item>
              </n-descriptions>

              <n-divider title-placement="left">Детали пользователя</n-divider>
              <n-tabs type="line">
                <n-tab-pane name="user-data" tab="Пользователь">
                  <n-code language="json">{{ formatJson(userStore.currentUser) }}</n-code>
                </n-tab-pane>
                <n-tab-pane name="raw" tab="Raw JSON">
                  <n-code language="json">{{ formatJson(userStore.$state) }}</n-code>
                </n-tab-pane>
              </n-tabs>
            </n-card>
          </template>

          <template v-else-if="activeKey === 'book'">
            <n-card title="Книги">
              <n-space vertical>
                <n-alert title="Информация о книгах" type="info">
                  Всего книг: {{ bookStore.books.length }}, 
                  Активных: {{ bookStore.activeBooks.length }},
                  Доступных пользователю: {{ bookStore.userAccessibleBooks.length }}
                </n-alert>

                <n-tabs type="line">
                  <n-tab-pane name="all" tab="Все книги">
                    <n-data-table
                      :columns="bookColumns"
                      :data="bookStore.books"
                      :bordered="false"
                      :pagination="{ pageSize: 5 }"
                    />
                  </n-tab-pane>
                  <n-tab-pane name="active" tab="Активные">
                    <n-data-table
                      :columns="bookColumns"
                      :data="bookStore.activeBooks"
                      :bordered="false"
                      :pagination="{ pageSize: 5 }"
                    />
                  </n-tab-pane>
                  <n-tab-pane name="user" tab="Пользовательские">
                    <n-data-table
                      :columns="bookColumns"
                      :data="bookStore.userAccessibleBooks"
                      :bordered="false"
                      :pagination="{ pageSize: 5 }"
                    />
                  </n-tab-pane>
                  <n-tab-pane name="raw" tab="Raw JSON">
                    <n-code :code="formatJson(bookStore.$state)" language="json" />
                  </n-tab-pane>
                </n-tabs>
              </n-space>
            </n-card>
          </template>

          <template v-else-if="activeKey === 'account'">
            <n-card title="Счета">
              <n-space vertical>
                <n-alert title="Информация о счетах" type="info">
                  Всего счетов: {{ accountStore.accounts.length }}, 
                  Активных: {{ accountStore.activeAccounts.length }},
                  Общий баланс: {{ formatCurrency(accountStore.totalBalance) }}
                </n-alert>

                <n-tabs type="line">
                  <n-tab-pane name="all" tab="Все счета">
                    <n-data-table
                      :columns="accountColumns"
                      :data="accountStore.accounts"
                      :bordered="false"
                      :pagination="{ pageSize: 5 }"
                    />
                  </n-tab-pane>
                  <n-tab-pane name="active" tab="Активные">
                    <n-data-table
                      :columns="accountColumns"
                      :data="accountStore.activeAccounts"
                      :bordered="false"
                      :pagination="{ pageSize: 5 }"
                    />
                  </n-tab-pane>
                  <n-tab-pane name="by-type" tab="По типам">
                    <n-collapse>
                      <n-collapse-item v-for="type in accountTypes" :key="type.value" :title="type.label">
                        <n-data-table
                          :columns="accountColumns"
                          :data="accountStore.getAccountsByType(type.value)"
                          :bordered="false"
                          :pagination="{ pageSize: 5 }"
                        />
                      </n-collapse-item>
                    </n-collapse>
                  </n-tab-pane>
                  <n-tab-pane name="raw" tab="Raw JSON">
                    <n-code :code="formatJson(accountStore.$state)" language="json" />
                  </n-tab-pane>
                </n-tabs>
              </n-space>
            </n-card>
          </template>

          <template v-else-if="activeKey === 'transaction'">
            <n-card title="Транзакции">
              <n-space vertical>
                <n-alert title="Информация о транзакциях" type="info">
                  Всего транзакций: {{ transactionStore.transactions.length }}, 
                  С фильтрами: {{ transactionStore.filteredTransactions.length }}
                </n-alert>

                <n-tabs type="line">
                  <n-tab-pane name="all" tab="Все транзакции">
                    <n-data-table
                      :columns="transactionColumns"
                      :data="transactionStore.transactions"
                      :bordered="false"
                      :pagination="{ pageSize: 10 }"
                    />
                  </n-tab-pane>
                  <n-tab-pane name="filtered" tab="Отфильтрованные">
                    <n-data-table
                      :columns="transactionColumns"
                      :data="transactionStore.filteredTransactions"
                      :bordered="false"
                      :pagination="{ pageSize: 10 }"
                    />
                  </n-tab-pane>
                  <n-tab-pane name="by-type" tab="По типам">
                    <n-collapse>
                      <n-collapse-item v-for="type in transactionTypes" :key="type.id" :title="type.name">
                        <n-data-table
                          :columns="transactionColumns"
                          :data="transactionStore.getTransactionsByType(type.id)"
                          :bordered="false"
                          :pagination="{ pageSize: 5 }"
                        />
                      </n-collapse-item>
                    </n-collapse>
                  </n-tab-pane>
                  <n-tab-pane name="raw" tab="Raw JSON">
                    <n-code :code="formatJson(transactionStore.$state)" language="json" />
                  </n-tab-pane>
                </n-tabs>
              </n-space>
            </n-card>
          </template>

          <template v-else-if="activeKey === 'category'">
            <n-card title="Категории">
              <n-space vertical>
                <n-alert title="Информация о категориях" type="info">
                  Всего категорий: {{ categoryStore.categories.length }}
                </n-alert>

                <n-tabs type="line">
                  <n-tab-pane name="all" tab="Все категории">
                    <n-data-table
                      :columns="categoryColumns"
                      :data="categoryStore.categories"
                      :bordered="false"
                      :pagination="{ pageSize: 10 }"
                    />
                  </n-tab-pane>
                  <n-tab-pane name="raw" tab="Raw JSON">
                    <n-code :code="formatJson(categoryStore.$state)" language="json" />
                  </n-tab-pane>
                </n-tabs>
              </n-space>
            </n-card>
          </template>

          <template v-else-if="activeKey === 'currency'">
            <n-card title="Валюты">
              <n-space vertical>
                <n-alert title="Информация о валютах" type="info">
                  Всего валют: {{ currencyStore.currencies.length }},
                  Базовая валюта: {{ currencyStore.appBaseCurrency }},
                  Базовая валюта пользователя: {{ currencyStore.userBaseCurrency }}
                </n-alert>

                <n-tabs type="line">
                  <n-tab-pane name="currencies" tab="Валюты">
                    <n-data-table
                      :columns="currencyColumns"
                      :data="currencyStore.currencies"
                      :bordered="false"
                      :pagination="{ pageSize: 10 }"
                    />
                  </n-tab-pane>
                  <n-tab-pane name="rates" tab="Курсы обмена">
                    <n-data-table
                      :columns="exchangeRateColumns"
                      :data="currencyStore.exchangeRates"
                      :bordered="false"
                      :pagination="{ pageSize: 10 }"
                    />
                  </n-tab-pane>
                  <n-tab-pane name="raw" tab="Raw JSON">
                    <n-code :code="formatJson({
                      currencies: currencyStore.currencies,
                      exchangeRates: currencyStore.exchangeRates,
                      appBaseCurrency: currencyStore.appBaseCurrency,
                      userBaseCurrency: currencyStore.userBaseCurrency
                    })" language="json" />
                  </n-tab-pane>
                </n-tabs>
              </n-space>
            </n-card>
          </template>

          <template v-else-if="activeKey === 'theme'">
            <n-card title="Тема">
              <n-descriptions bordered>
                <n-descriptions-item label="Текущая тема">
                  {{ themeStore.currentTheme }}
                </n-descriptions-item>
                <n-descriptions-item label="Темная тема">
                  <n-tag :type="themeStore.isDarkTheme ? 'success' : 'default'">
                    {{ themeStore.isDarkTheme ? 'Да' : 'Нет' }}
                  </n-tag>
                </n-descriptions-item>
                <n-descriptions-item label="CSS класс темы">
                  {{ themeStore.themeClass }}
                </n-descriptions-item>
                <n-descriptions-item label="Авто-определено">
                  <n-tag :type="themeStore.isAutoDetected ? 'info' : 'default'">
                    {{ themeStore.isAutoDetected ? 'Да' : 'Нет' }}
                  </n-tag>
                </n-descriptions-item>
                <n-descriptions-item label="Тема в настройках пользователя">
                  {{ userStore.currentUser?.settings?.theme || 'не установлена' }}
                </n-descriptions-item>
                <n-descriptions-item label="Классы на documentElement">
                  {{ document.documentElement.className }}
                </n-descriptions-item>
              </n-descriptions>

              <n-divider />

              <n-button-group>
                <n-button @click="setTheme('light')">Светлая тема</n-button>
                <n-button @click="setTheme('dark')">Темная тема</n-button>
                <n-button @click="setTheme('blue')">Синяя тема</n-button>
                <n-button @click="setTheme('high-contrast')">Высокий контраст</n-button>
                <n-button @click="setTheme('system')">Системная</n-button>
              </n-button-group>
              
              <n-divider />
              
              <n-card title="Текущие CSS-переменные">
                <n-descriptions bordered :column="1">
                  <n-descriptions-item v-for="(cssVar, index) in cssVariables" 
                    :key="index" 
                    :label="cssVar.name">
                    {{ cssVar.value }}
                  </n-descriptions-item>
                </n-descriptions>
              </n-card>
            </n-card>
          </template>

          <template v-else-if="activeKey === 'localStorage'">
            <n-card title="LocalStorage">
              <n-alert title="Данные локального хранилища" type="warning">
                Здесь отображаются все данные, хранящиеся в localStorage браузера для этого приложения.
              </n-alert>

              <n-divider />

              <n-tabs type="line">
                <n-tab-pane name="keys" tab="По ключам">
                  <n-collapse>
                    <n-collapse-item v-for="key in localStorageKeys" :key="key" :title="key">
                      <n-code language="json">{{ formatLocalStorageItem(key) }}</n-code>
                    </n-collapse-item>
                  </n-collapse>
                </n-tab-pane>
                <n-tab-pane name="raw" tab="Raw JSON">
                  <n-code language="json">{{ formatRawLocalStorage() }}</n-code>
                </n-tab-pane>
              </n-tabs>
            </n-card>
          </template>
        </div>
      </n-layout>
    </n-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue';
import { 
  NLayout, 
  NLayoutSider, 
  NMenu, 
  NButton, 
  NSpace, 
  NPageHeader, 
  NDivider,
  NCard, 
  NDescriptions, 
  NDescriptionsItem, 
  NTag, 
  NCollapse, 
  NCollapseItem,
  NCode, 
  NAlert, 
  NTabs, 
  NTabPane, 
  NDataTable, 
  NButtonGroup,
  NIcon
} from 'naive-ui';
import { 
  IconUser, 
  IconBook, 
  IconCreditCard, 
  IconArrowsExchange, 
  IconTags,
  IconCurrencyDollar, 
  IconMoon, 
  IconDatabase, 
  IconRefresh, 
  IconTrash
} from '@tabler/icons-vue';

// Импорт хранилищ
import { useUserStore } from '@/stores/user';
import { useBookStore } from '@/stores/book';
import { useAccountStore } from '@/stores/account';
import { useTransactionStore } from '@/stores/transaction';
import { useCategoryStore } from '@/stores/category';
import { useCurrencyStore } from '@/stores/currency';
// Импорт ThemeStore вместо useSimpleTheme
import { useThemeStore } from '@/stores/theme/themeStore';

// Инициализация хранилищ
const userStore = useUserStore();
const bookStore = useBookStore();
const accountStore = useAccountStore();
const transactionStore = useTransactionStore();
const categoryStore = useCategoryStore();
const currencyStore = useCurrencyStore();
// Используем ThemeStore
const themeStore = useThemeStore();

// Активный элемент меню
const activeKey = ref('user');

// Состояние загрузки
const isRefreshing = ref(false);
const isClearing = ref(false);

// CSS-переменные для отображения
const cssVariables = computed(() => {
  const style = getComputedStyle(document.documentElement);
  return [
    { name: '--text-header', value: style.getPropertyValue('--text-header').trim() },
    { name: '--text-usual', value: style.getPropertyValue('--text-usual').trim() },
    { name: '--color-primary', value: style.getPropertyValue('--color-primary').trim() },
    { name: '--bg-main', value: style.getPropertyValue('--bg-main').trim() },
    { name: '--bg-screen', value: style.getPropertyValue('--bg-screen').trim() },
    { name: '--app-background', value: style.getPropertyValue('--app-background').trim() }
  ];
});

// Функция для установки темы
const setTheme = (theme) => {
  themeStore.setTheme(theme);
};

// Опции меню - используем вычисляемое свойство для правильного обновления
const menuOptions = computed(() => [
  {
    label: 'Пользователь',
    key: 'user',
    icon: () => h(NIcon, null, { default: () => h(IconUser) })
  },
  {
    label: 'Книги',
    key: 'book',
    icon: () => h(NIcon, null, { default: () => h(IconBook) })
  },
  {
    label: 'Счета',
    key: 'account',
    icon: () => h(NIcon, null, { default: () => h(IconCreditCard) })
  },
  {
    label: 'Транзакции',
    key: 'transaction',
    icon: () => h(NIcon, null, { default: () => h(IconArrowsExchange) })
  },
  {
    label: 'Категории',
    key: 'category',
    icon: () => h(NIcon, null, { default: () => h(IconTags) })
  },
  {
    label: 'Валюты',
    key: 'currency',
    icon: () => h(NIcon, null, { default: () => h(IconCurrencyDollar) })
  },
  {
    label: 'Тема',
    key: 'theme',
    icon: () => h(NIcon, null, { default: () => h(IconMoon) })
  },
  {
    label: 'LocalStorage',
    key: 'localStorage',
    icon: () => h(NIcon, null, { default: () => h(IconDatabase) })
  }
]);

// Форматирование JSON для отображения
const formatJson = (obj: any): string => {
  return JSON.stringify(obj, null, 2);
};

// Форматирование валюты
const formatCurrency = (amount: number): string => {
  return currencyStore.formatCurrency(amount, currencyStore.appBaseCurrency);
};

// Получение ключей localStorage
const localStorageKeys = computed(() => {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      keys.push(key);
    }
  }
  return keys;
});

// Форматирование элемента localStorage
const formatLocalStorageItem = (key: string): string => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return '';
    
    // Пытаемся распарсить JSON
    const parsed = JSON.parse(item);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    // Если не удалось распарсить, возвращаем как строку
    return localStorage.getItem(key) || '';
  }
};

// Форматирование всего содержимого localStorage
const formatRawLocalStorage = (): string => {
  const storage: Record<string, any> = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      try {
        const value = localStorage.getItem(key);
        storage[key] = value ? JSON.parse(value) : null;
      } catch (e) {
        storage[key] = localStorage.getItem(key);
      }
    }
  }
  
  return JSON.stringify(storage, null, 2);
};

// Столбцы для таблицы книг
const bookColumns = [
  { title: 'ID', key: 'id' },
  { title: 'Название', key: 'name' },
  { title: 'Тип', key: 'type' },
  { 
    title: 'Активна', 
    key: 'isActive',
    render: (row: any) => h(
      NTag,
      { type: row.isActive ? 'success' : 'error' },
      { default: () => row.isActive ? 'Да' : 'Нет' }
    )
  },
  { title: 'Цвет', key: 'color' }
];

// Типы счетов для отображения
const accountTypes = [
  { label: 'Наличные', value: 'cash' },
  { label: 'Банковские счета', value: 'bank' },
  { label: 'Карты', value: 'card' },
  { label: 'Кредитные карты', value: 'credit_card' },
  { label: 'Сбережения', value: 'savings' },
  { label: 'Инвестиции', value: 'investment' }
];

// Столбцы для таблицы счетов
const accountColumns = [
  { title: 'ID', key: 'id' },
  { title: 'Название', key: 'name' },
  { title: 'Валюта', key: 'currency' },
  { 
    title: 'Баланс', 
    key: 'currentBalance',
    render: (row: any) => {
      return accountStore.getFormattedAccountBalance(row.id);
    }
  },
  { title: 'Тип', key: 'type' },
  { 
    title: 'Активен', 
    key: 'isActive',
    render: (row: any) => h(
      NTag,
      { type: row.isActive ? 'success' : 'error' },
      { default: () => row.isActive ? 'Да' : 'Нет' }
    )
  }
];

// Типы транзакций
const transactionTypes = transactionStore.transactionTypes;

// Столбцы для таблицы транзакций
const transactionColumns = [
  { title: 'ID', key: 'id' },
  { 
    title: 'Дата', 
    key: 'date',
    render: (row: any) => {
      return new Date(row.date).toLocaleDateString();
    }
  },
  { title: 'Тип', key: 'type' },
  { 
    title: 'Сумма', 
    key: 'amount',
    render: (row: any) => {
      return currencyStore.formatCurrency(row.amount, row.currency);
    }
  },
  { title: 'Описание', key: 'description' },
  { title: 'Книга', key: 'bookId' }
];

// Столбцы для таблицы категорий
const categoryColumns = [
  { title: 'ID', key: 'id' },
  { title: 'Название', key: 'name' },
  { title: 'Тип', key: 'type' },
  { title: 'Родительская', key: 'parentId' },
  { title: 'Цвет', key: 'color' }
];

// Столбцы для таблицы валют
const currencyColumns = [
  { title: 'Код', key: 'code' },
  { title: 'Название', key: 'name' },
  { title: 'Символ', key: 'symbol' },
  { title: 'Десятичные разряды', key: 'decimalPlaces' }
];

// Столбцы для таблицы курсов обмена
const exchangeRateColumns = [
  { title: 'Из', key: 'fromCurrency' },
  { title: 'В', key: 'toCurrency' },
  { title: 'Курс', key: 'rate' },
  { 
    title: 'Обновлено', 
    key: 'timestamp',
    render: (row: any) => {
      return new Date(row.timestamp).toLocaleString();
    }
  },
  { title: 'Источник', key: 'source' }
];

// Обновление данных хранилищ
const refreshStores = async () => {
  isRefreshing.value = true;
  try {
    await Promise.all([
      userStore.init(),
      bookStore.refreshBooks(),
      accountStore.refreshAccounts(),
      transactionStore.refreshTransactions(),
      currencyStore.fetchLatestRates(),
      themeStore.init() // Добавляем инициализацию темы
    ]);
  } catch (error) {
    console.error('Error refreshing stores:', error);
  } finally {
    isRefreshing.value = false;
  }
};

// Очистка localStorage
const clearStores = async () => {
  if (!confirm('Вы уверены, что хотите очистить все данные из localStorage? Это приведет к сбросу приложения до начального состояния.')) {
    return;
  }
  
  isClearing.value = true;
  try {
    localStorage.clear();
    alert('LocalStorage очищен. Перезагрузите страницу для применения изменений.');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  } finally {
    isClearing.value = false;
  }
};

// Инициализация всех хранилищ при монтировании компонента
onMounted(async () => {
  try {
    console.log('Initializing stores...');
    
    if (!userStore.isInitialized) await userStore.init();
    if (!bookStore.isInitialized) await bookStore.init();
    if (!accountStore.isInitialized) await accountStore.init();
    if (!transactionStore.isInitialized) await transactionStore.init();
    if (!categoryStore.isInitialized) await categoryStore.init();
    if (!themeStore.isInitialized) themeStore.init();
    
    console.log('All stores initialized successfully');
    
    // Принудительное обновление, чтобы отобразить данные
    activeKey.value = activeKey.value;
  } catch (error) {
    console.error('Error initializing stores:', error);
  }
});
</script>

<style scoped>
.debug-store-view {
  padding-bottom: 20px;
  height: 100%;
}

.store-content {
  margin-top: 16px;
}

/* Стили для корректной работы со скроллом */
:deep(.n-layout) {
  height: 100%;
  overflow: visible;
}

:deep(.n-layout-scroll-container) {
  overflow: visible;
}

:deep(.n-layout-sider) {
  height: 100%;
  overflow-y: auto;
}

:deep(.n-layout-sider-scroll-container) {
  overflow-y: auto;
}

:deep(.n-data-table .n-data-table-base-table-body) {
  overflow: auto;
  max-height: 70vh;
}
</style>