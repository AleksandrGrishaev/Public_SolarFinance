<!-- src/views/debug/DebugStoreView.vue -->
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
          default-value="base"
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

        <!-- Панель с данными выбранного раздела -->
        <div class="store-content">
          <BaseStoresDebugPanel v-if="activeKey === 'base'" />
          <FinanceStoresDebugPanel v-else-if="activeKey === 'finance'" />
          <SystemStoresDebugPanel v-else-if="activeKey === 'system'" />
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
  NIcon
} from 'naive-ui';
import { 
  IconSettings, 
  IconCurrencyDollar, 
  IconServerCog, 
  IconRefresh, 
  IconTrash
} from '@tabler/icons-vue';

// Импорт панелей отладки
import BaseStoresDebugPanel from './components/BaseStoresDebugPanel.vue';
import FinanceStoresDebugPanel from './components/FinanceStoresDebugPanel.vue';
import SystemStoresDebugPanel from './components/SystemStoresDebugPanel.vue';

// Импорт хранилищ для инициализации
import { useUserStore } from '@/stores/user';
import { useBookStore } from '@/stores/book';
import { useAccountStore } from '@/stores/account';
import { useTransactionStore } from '@/stores/transaction';
import { useCategoryStore } from '@/stores/category';
import { useCurrencyStore } from '@/stores/currency';
import { useThemeStore } from '@/stores/theme/themeStore';
import { useNotificationService } from '@/stores/notification/notificationService';

// Инициализация хранилищ
const userStore = useUserStore();
const bookStore = useBookStore();
const accountStore = useAccountStore();
const transactionStore = useTransactionStore();
const categoryStore = useCategoryStore();
const currencyStore = useCurrencyStore();
const themeStore = useThemeStore();
const notificationService = useNotificationService();

// Активный элемент меню
const activeKey = ref('base');

// Состояние загрузки
const isRefreshing = ref(false);
const isClearing = ref(false);

// Опции меню
const menuOptions = computed(() => [
  {
    label: 'Базовые хранилища',
    key: 'base',
    icon: () => h(NIcon, null, { default: () => h(IconSettings) })
  },
  {
    label: 'Финансовые хранилища',
    key: 'finance',
    icon: () => h(NIcon, null, { default: () => h(IconCurrencyDollar) })
  },
  {
    label: 'Системные хранилища',
    key: 'system',
    icon: () => h(NIcon, null, { default: () => h(IconServerCog) })
  }
]);

// Обновление данных хранилищ
const refreshStores = async () => {
  isRefreshing.value = true;
  try {
    await Promise.all([
      userStore.init(),
      bookStore.refreshBooks(),
      accountStore.refreshAccounts(),
      transactionStore.refreshTransactions(),
      categoryStore.init(),
      currencyStore.fetchLatestRates(),
      themeStore.init(),
      // Инициализируем также уведомления
      notificationService.init()
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
    if (!currencyStore.isInitialized) await currencyStore.init();
    if (!themeStore.isInitialized) themeStore.init();
    
    // Инициализируем сервис уведомлений
    notificationService.init();
    
    console.log('All stores initialized successfully');
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
</style>