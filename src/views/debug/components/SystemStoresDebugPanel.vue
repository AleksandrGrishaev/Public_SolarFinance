<!-- src/views/debug/components/SystemStoresDebugPanel.vue -->
<template>
  <div class="system-stores-panel">
    <n-tabs type="segment" animated>
      <!-- Уведомления -->
      <n-tab-pane name="notification" tab="Уведомления">
        <n-card title="Уведомления">
          <n-space vertical>
            <n-alert title="Информация об уведомлениях" type="info">
              Всего уведомлений: {{ notificationStore.notifications.length }}, 
              Непрочитанных: {{ notificationStore.unreadCount }},
              Системных: {{ notificationStore.systemNotifications.length }},
              Пользовательских: {{ notificationStore.userNotifications.length }}
            </n-alert>

            <!-- Кнопки управления уведомлениями - убрана кнопка создания тестовых уведомлений -->
            <n-space>
              <n-button @click="notificationStore.markAllAsRead()" :disabled="!notificationStore.hasUnread">
                Пометить все как прочитанные
              </n-button>
              <n-button @click="notificationStore.clearReadNotifications()">
                Удалить прочитанные
              </n-button>
              <n-button @click="notificationStore.clearExpiredNotifications()">
                Удалить просроченные
              </n-button>
            </n-space>

            <n-tabs type="line">
              <n-tab-pane name="all" tab="Все уведомления">
                <n-data-table
                  :columns="notificationColumns"
                  :data="notificationStore.sortedNotifications"
                  :bordered="false"
                  :pagination="{ pageSize: 10 }"
                />
              </n-tab-pane>
              <n-tab-pane name="unread" tab="Непрочитанные">
                <n-data-table
                  :columns="notificationColumns"
                  :data="notificationStore.sortedNotifications.filter(n => !n.read)"
                  :bordered="false"
                  :pagination="{ pageSize: 10 }"
                />
              </n-tab-pane>
              <n-tab-pane name="system" tab="Системные">
                <n-data-table
                  :columns="notificationColumns"
                  :data="notificationStore.systemNotifications"
                  :bordered="false"
                  :pagination="{ pageSize: 10 }"
                />
              </n-tab-pane>
              <n-tab-pane name="user" tab="Пользовательские">
                <n-data-table
                  :columns="notificationColumns"
                  :data="notificationStore.userNotifications"
                  :bordered="false"
                  :pagination="{ pageSize: 10 }"
                />
              </n-tab-pane>
              <n-tab-pane name="priority" tab="По приоритету">
                <n-data-table
                  :columns="notificationColumns"
                  :data="notificationStore.prioritySortedNotifications"
                  :bordered="false"
                  :pagination="{ pageSize: 10 }"
                />
              </n-tab-pane>
              <n-tab-pane name="raw" tab="Raw JSON">
                <n-code language="json">{{ formatJson(notificationStore.$state) }}</n-code>
              </n-tab-pane>
            </n-tabs>
          </n-space>
        </n-card>
      </n-tab-pane>

      <!-- LocalStorage -->
      <n-tab-pane name="localStorage" tab="LocalStorage">
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
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue';
import { 
  NTabs, 
  NTabPane, 
  NCard, 
  NSpace, 
  NAlert, 
  NDataTable, 
  NCode, 
  NCollapse, 
  NCollapseItem, 
  NDivider,
  NButton,
  NTag
} from 'naive-ui';

// Импорт хранилищ и сервисов уведомлений
import { useNotificationStore } from '@/stores/notification/notificationStore';
import { useNotificationService } from '@/stores/notification/notificationService';
import { NotificationType, NotificationSubtype } from '@/stores/notification/types';

// Инициализация хранилищ и сервисов
const notificationStore = useNotificationStore();
const notificationService = useNotificationService();

// Форматирование JSON для отображения
const formatJson = (obj: any): string => {
  return JSON.stringify(obj, null, 2);
};

// Удален метод createTestNotifications

// Столбцы для таблицы уведомлений
const notificationColumns = [
  { title: 'ID', key: 'id', width: 120 },
  { 
    title: 'Тип', 
    key: 'type',
    width: 50,
    render: (row: any) => {
      const type = row.type === NotificationType.SYSTEM ? 'info' : 'success';
      return h(
        NTag,
        { type },
        { default: () => row.type }
      );
    }
  },
  { 
    title: 'Подтип', 
    key: 'subtype',
    width: 50,
    render: (row: any) => {
      let type = 'default';
      if (row.subtype === NotificationSubtype.ERROR) type = 'error';
      if (row.subtype === NotificationSubtype.WARNING) type = 'warning';
      if (row.subtype === NotificationSubtype.INFO) type = 'info';
      if (row.subtype === NotificationSubtype.PROMO) type = 'success';
      
      return h(
        NTag,
        { type },
        { default: () => row.subtype }
      );
    }
  },
  { title: 'Заголовок', key: 'title', width: 100 }, // Расширено поле Заголовок
  { title: 'Сообщение', key: 'message', width: 300 },
  { 
    title: 'Прочитано', 
    key: 'read',
    width: 50,
    render: (row: any) => h(
      NTag,
      { type: row.read ? 'success' : 'warning' },
      { default: () => row.read ? 'Да' : 'Нет' }
    )
  },
  { 
    title: 'Дата', 
    key: 'date',
    width: 100,
    render: (row: any) => {
      return new Date(row.date).toLocaleString();
    }
  },
  { 
    title: 'Истекает', 
    key: 'expireAt',
    width: 100,
    render: (row: any) => {
      return row.expireAt ? new Date(row.expireAt).toLocaleString() : '-';
    }
  },
  { 
    title: 'Приоритет', 
    key: 'priority',
    width: 50
  },
  {
    title: 'Действия',
    key: 'actions',
    width: 100,
    render: (row: any) => {
      return h(
        NSpace, 
        { justify: 'center' },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                onClick: () => notificationStore.markAsRead(row.id),
                disabled: row.read
              },
              { default: () => 'Прочитать' }
            ),
            h(
              NButton,
              {
                size: 'small',
                onClick: () => notificationStore.deleteNotification(row.id)
              },
              { default: () => 'Удалить' }
            )
          ]
        }
      );
    }
  }
];

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
</script>

<style scoped>
.system-stores-panel {
  width: 100%;
}

:deep(.n-data-table .n-data-table-base-table-body) {
  overflow: auto;
  max-height: 70vh;
}
</style>