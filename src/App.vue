<template>
  <n-config-provider :theme="themeStore.isDark ? darkTheme : null">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider>
            <div class="app-container">
              <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                  <component :is="Component" />
                </transition>
              </router-view>
            </div>
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  darkTheme,
  NConfigProvider, 
  NLoadingBarProvider, 
  NDialogProvider, 
  NNotificationProvider,
  NMessageProvider,
  useMessage
} from 'naive-ui';
import { useThemeStore } from './stores/theme';
import { useUserStore } from './stores/user';

// Get stores
const themeStore = useThemeStore();
const userStore = useUserStore();
const router = useRouter();

// Устанавливаем сообщения глобально, чтобы они были доступны в роутере
onMounted(() => {
  // Инициализируем глобальный message provider
  window.$message = useMessage();
  
  console.log('App mounted');
  
  // Инициализируем тему
  themeStore.initTheme();
  
  // Инициализируем пользователя из localStorage
  if (userStore.init) {
    userStore.init();
    console.log('User authenticated:', userStore.isAuthenticated);
  }
  
  console.log('Current route:', router.currentRoute.value.path);
});
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, 
  Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overscroll-behavior: none;
}

.app-container {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--app-background);
}

/* Общие темы */
:root {
  --app-background: #f8f8f8;
  --text-primary: #212121;
  --text-secondary: #616161;
  --border-color: #e0e0e0;
  --accent-color: #4CAF50;
  --error-color: #FF5252;
}

/* Тёмная тема */
.dark-theme {
  --app-background: #121212;
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --border-color: #333333;
  --accent-color: #4CAF50;
  --error-color: #FF5252;
}

/* Анимации переходов */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>