<!-- src/layouts/IosLayout.vue -->
<template>
  <div class="ios-layout" :class="{ 'dark-theme': isDarkTheme }">
    <AppTopHeader 
  v-if="showHeader" 
  :showBackButton="showBackButton"
  :title="headerTitle"
  :hasNotifications="hasNotifications"
  :showMessageIcon="showMessageIcon"
  :showProfileIcon="showProfileIcon"
  :applySafeArea="true"
  @back="handleBack"
  @message="handleMessage"
  @profile="handleProfile"
/>
    
    <div class="ios-content">
      <router-view 
        @update:showMenu="updateShowMenu"
        @update:header="updateHeaderSettings"
      ></router-view>
    </div>
    
    <div v-if="showNavMenu" class="menu-container">
      <nav-menu />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavMenu from '../components/navigation/NavMenu.vue';
import AppTopHeader from '../components/navigation/AppTopHeader.vue';

const props = defineProps({
  showNavMenu: {
    type: Boolean,
    default: true
  }
});

// Theme state
const isDarkTheme = ref(true);

// Menu visibility state
const localShowNavMenu = ref(props.showNavMenu);

// Header state
const showHeader = ref(true);
const showBackButton = ref(true);
const headerTitle = ref('');
const hasNotifications = ref(false);
const showMessageIcon = ref(true);
const showProfileIcon = ref(true);

// Router
const router = useRouter();
const route = useRoute();

// Update menu visibility
const updateShowMenu = (value: boolean) => {
  localShowNavMenu.value = value;
};

// Update header settings from child components
// Update header settings from child components
const updateHeaderSettings = (settings: {
  show?: boolean,
  title?: string,
  showBack?: boolean,
  hasNotifications?: boolean,
  showMessageIcon?: boolean,  // Добавьте этот параметр
  showProfileIcon?: boolean   // Добавьте этот параметр
}) => {
  if (settings.show !== undefined) showHeader.value = settings.show;
  if (settings.title !== undefined) headerTitle.value = settings.title;
  if (settings.showBack !== undefined) showBackButton.value = settings.showBack;
  if (settings.hasNotifications !== undefined) hasNotifications.value = settings.hasNotifications;
  if (settings.showMessageIcon !== undefined) showMessageIcon.value = settings.showMessageIcon;  // Обработайте параметр
  if (settings.showProfileIcon !== undefined) showProfileIcon.value = settings.showProfileIcon;  // Обработайте параметр
};

// Event handlers for header actions
const handleBack = () => {
  router.back();
};

const handleMessage = () => {
  // Navigate to messages or open messages panel
  router.push('/messages');
};

const handleProfile = () => {
  // Navigate to profile or open profile panel
  router.push('/profile');
};

// Computed menu visibility
const showNavMenu = computed(() => {
  return props.showNavMenu && localShowNavMenu.value;
});

// Set initial header settings based on route
onMounted(() => {
  // Example of setting header based on route
  headerTitle.value = route.meta.title as string || '';
  showBackButton.value = route.meta.showBack !== false;
  
  // Добавьте инициализацию для иконок из meta
  if (route.meta.header) {
    if (route.meta.header.hasNotifications !== undefined) 
      hasNotifications.value = route.meta.header.hasNotifications;
    if (route.meta.header.showMessageIcon !== undefined) 
      showMessageIcon.value = route.meta.header.showMessageIcon;
    if (route.meta.header.showProfileIcon !== undefined) 
      showProfileIcon.value = route.meta.header.showProfileIcon;
  }
});
</script>

<style scoped>
.ios-layout {
  width: 100%;
  height: 100vh;
  position: relative;
  background-color: var(--bg-screen);
  color: var(--text-usual);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ios-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dark-theme {
  background-color: var(--bg-screen);
  color: var(--text-usual);
}

.menu-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  padding-bottom: 20px; /* Отступ в 20px от низа экрана */
  z-index: 100;
}
</style>