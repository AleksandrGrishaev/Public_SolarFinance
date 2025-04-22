<template>
  <n-config-provider :theme="darkTheme">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider>
            <message-provider>
              <div class="app-container">
                <router-view v-slot="{ Component }">
                  <transition name="fade" mode="out-in">
                    <component :is="Component" />
                  </transition>
                </router-view>
              </div>
            </message-provider>
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { 
  darkTheme,
  NConfigProvider, 
  NLoadingBarProvider, 
  NDialogProvider, 
  NNotificationProvider,
  NMessageProvider
} from 'naive-ui';
import MessageProvider from './components/system/MessageProvider.vue';
import { useThemeStore } from '@/stores/theme/themeStore';

// Получаем store темы
const themeStore = useThemeStore();

// Инициализируем тему если не инициализирована через AppInitService
if (!themeStore.isInitialized) {
  themeStore.init();
  console.log('[App] Тема инициализирована');
}
</script>