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
import { onMounted } from 'vue';
import { useTheme } from '@/composables/useTheme';

// Инициализируем тему
const { initTheme } = useTheme();

onMounted(() => {
  // Инициализируем тему при загрузке приложения
  initTheme();
  console.log('[App] Тема инициализирована');
});
</script>

<style>
/* Переопределение стилей для компонентов Naive UI */
.n-card {
  background-color: var(--bg-main) !important;
  color: var(--text-usual) !important;
}

.n-card-header__title {
  color: var(--text-header) !important;
}

.n-button:not(.n-button--primary):not(.n-button--info):not(.n-button--success):not(.n-button--warning):not(.n-button--error) {
  background-color: var(--bg-contrast) !important;
  color: var(--text-usual) !important;
}

.n-tag:not(.n-tag--primary):not(.n-tag--info):not(.n-tag--success):not(.n-tag--warning):not(.n-tag--error) {
  background-color: var(--bg-contrast) !important;
  color: var(--text-usual) !important;
}

/* Анимации для плавного переключения тем */
html {
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app-container {
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>