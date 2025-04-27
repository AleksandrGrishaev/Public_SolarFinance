<!-- src/layouts/IosLayout.vue -->
<template>
  <div class="ios-layout">
    <AppTopHeader 
      v-if="showHeader" 
      :showBackButton="showBackButton"
      :title="headerTitle"
      :hasNotifications="hasNotifications"
      :showMessageIcon="showMessageIcon"
      :showProfileIcon="showProfileIcon"
      :applySafeArea="true"
      :background="'var(--bg-dropdown)'"
      :iconColor="'var(--text-usual)'"
      :bordered="true"
      :borderColor="'var(--bg-dropdown)'"
      :padding="10"
      :iconSize="18"
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
const updateHeaderSettings = (settings: {
  show?: boolean,
  title?: string,
  showBack?: boolean,
  hasNotifications?: boolean,
  showMessageIcon?: boolean,
  showProfileIcon?: boolean,
  background?: string,
  iconColor?: string,
  bordered?: boolean,
  borderColor?: string,
  padding?: number | string,
  iconSize?: number
}) => {
  console.log('[IosLayout] Updating header settings:', settings);
  
  if (settings.show !== undefined) showHeader.value = settings.show;
  if (settings.title !== undefined) headerTitle.value = settings.title;
  if (settings.showBack !== undefined) showBackButton.value = settings.showBack;
  if (settings.hasNotifications !== undefined) hasNotifications.value = settings.hasNotifications;
  if (settings.showMessageIcon !== undefined) {
    console.log('[IosLayout] Updating showMessageIcon to:', settings.showMessageIcon);
    showMessageIcon.value = settings.showMessageIcon;
  }
  if (settings.showProfileIcon !== undefined) showProfileIcon.value = settings.showProfileIcon;
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
  console.log('[IosLayout] Mounted, initializing from route meta:', route.meta);
  
  // Example of setting header based on route
  headerTitle.value = route.meta.title as string || '';
  showBackButton.value = route.meta.showBack !== false;
  
  // Используем значения из meta, или значения по умолчанию
  if (route.meta.header) {
    if (route.meta.header.hasNotifications !== undefined) 
      hasNotifications.value = route.meta.header.hasNotifications;
    
    if (route.meta.header.showMessageIcon !== undefined) {
      showMessageIcon.value = route.meta.header.showMessageIcon;
      console.log('[IosLayout] Setting showMessageIcon from route meta:', showMessageIcon.value);
    }
    
    if (route.meta.header.showProfileIcon !== undefined) 
      showProfileIcon.value = route.meta.header.showProfileIcon;
  }
  
  // Явно вывести состояние header после инициализации
  console.log('[IosLayout] Header state after initialization:', {
    showHeader: showHeader.value,
    title: headerTitle.value,
    showBackButton: showBackButton.value,
    hasNotifications: hasNotifications.value,
    showMessageIcon: showMessageIcon.value,
    showProfileIcon: showProfileIcon.value
  });
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
  overflow-y: auto;
}

.ios-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* Для плавности на iOS */
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