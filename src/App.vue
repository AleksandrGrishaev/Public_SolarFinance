<template>
  <n-config-provider :theme="themeStore.isDark ? darkTheme : null">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider>
            <message-provider>
              <!-- Добавляем ключ для принудительной перерисовки при изменении темы -->
              <div class="app-container" :key="themeVersion">
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
import { useThemeStore } from './stores/theme';
import MessageProvider from './components/system/MessageProvider.vue';
import { useSimpleTheme } from './composables/useSimpleTheme.ts';

// Получение хранилища темы
const themeStore = useThemeStore();

// Получаем ссылку на версию темы для обновления DOM
const { themeVersion } = useSimpleTheme();
</script>