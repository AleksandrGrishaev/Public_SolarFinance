<!-- src/App.vue -->
<template>
  <n-config-provider :theme="themeStore.theme" :theme-overrides="themeStore.themeOverrides">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider>
            <router-view></router-view>
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
  NConfigProvider, 
  NLoadingBarProvider, 
  NDialogProvider, 
  NNotificationProvider,
  NMessageProvider
} from 'naive-ui';
import { useThemeStore } from '@/stores/theme';
import { useUserStore } from '@/stores/user';

// Get stores
const themeStore = useThemeStore();
const userStore = useUserStore();
const router = useRouter();

// Initialize theme and user on app mount
onMounted(() => {
  // Простое логирование
  console.log('App mounted');
  console.log('Current route:', router.currentRoute.value.path);
  console.log('User authenticated:', userStore.isAuthenticated);
  
  // Initialize theme
  themeStore.initTheme();
  
  // Initialize user authentication from localStorage
  userStore.init();
});
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Inter', sans-serif;
}

#app {
  height: 100%;
}

/* Import font (optional) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
</style>