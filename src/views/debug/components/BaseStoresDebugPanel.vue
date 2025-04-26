<!-- src/views/debug/components/BaseStoresDebugPanel.vue -->
<template>
  <div class="base-stores-panel">
    <n-tabs type="segment" animated>
      <!-- Пользователь -->
      <n-tab-pane name="user" tab="Пользователь">
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
              <!-- Замена n-code на JsonViewer -->
              <json-viewer :json="userStore.currentUser" :show-card="false" />
            </n-tab-pane>
            <n-tab-pane name="raw" tab="Raw JSON">
              <!-- Замена n-code на JsonViewer -->
              <json-viewer :json="userStore.$state" :show-card="false" />
            </n-tab-pane>
          </n-tabs>
        </n-card>
      </n-tab-pane>

      <!-- Тема -->
      <n-tab-pane name="theme" tab="Тема">
        <n-card title="Тема приложения">
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
      </n-tab-pane>

      <!-- Валюты -->
      <n-tab-pane name="currency" tab="Валюты">
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
                <!-- Замена n-code на JsonViewer -->
                <json-viewer 
                  :json="{
                    currencies: currencyStore.currencies,
                    exchangeRates: currencyStore.exchangeRates,
                    appBaseCurrency: currencyStore.appBaseCurrency,
                    userBaseCurrency: currencyStore.userBaseCurrency
                  }"
                  :show-card="false"
                />
              </n-tab-pane>
            </n-tabs>
          </n-space>
        </n-card>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  NTabs, 
  NTabPane, 
  NCard, 
  NDescriptions, 
  NDescriptionsItem, 
  NTag, 
  NDivider,
  NCode, 
  NAlert, 
  NSpace, 
  NDataTable, 
  NButtonGroup,
  NButton
} from 'naive-ui';

// Импорт хранилищ
import { useUserStore } from '@/stores/user';
import { useCurrencyStore } from '@/stores/currency';
import { useThemeStore } from '@/stores/theme/themeStore';

// Импорт нового JsonViewer компонента
import JsonViewer from './JsonViewerComponent.vue';

// Инициализация хранилищ
const userStore = useUserStore();
const currencyStore = useCurrencyStore();
const themeStore = useThemeStore();

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
const setTheme = (theme: string) => {
  themeStore.setTheme(theme);
};

// Форматирование JSON для отображения - оставляем для обратной совместимости
const formatJson = (obj: any): string => {
  return JSON.stringify(obj, null, 2);
};

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
</script>

<style scoped>
.base-stores-panel {
  width: 100%;
}

:deep(.n-data-table .n-data-table-base-table-body) {
  overflow: auto;
  max-height: 70vh;
}
</style>