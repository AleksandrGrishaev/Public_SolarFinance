<!-- src/layouts/ConsoleLayout.vue -->
<template>
    <n-layout has-sider position="absolute">
      <!-- Side Panel -->
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="240"
        :collapsed="collapsed"
        show-trigger
        @collapse="collapsed = true"
        @expand="collapsed = false"
        class="console-sider"
      >
        <!-- Logo -->
        <div class="logo-container">
          <n-icon size="24" class="logo-icon">
            <icon-app-window-filled />
          </n-icon>
          <span class="logo-text" v-if="!collapsed">Console App</span>
        </div>
  
        <!-- Navigation Menu -->
        <n-menu
          :value="activeKey"
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
          @update:value="handleMenuUpdate"
        />
  
        <!-- User Section at Bottom -->
        <div class="user-section" :class="{ 'user-section-collapsed': collapsed }">
          <n-dropdown
            trigger="click"
            :options="userMenuOptions"
            @select="handleLogout"
          >
            <div class="user-dropdown-trigger">
              <n-avatar round size="medium">
                {{ userInitials }}
              </n-avatar>
              <div class="user-info" v-if="!collapsed">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-role">{{ user.role }}</div>
              </div>
            </div>
          </n-dropdown>
        </div>
      </n-layout-sider>
  
      <!-- Main Content -->
      <n-layout>
        <!-- Header -->
        <n-layout-header bordered class="console-header">
          <div class="header-content">
            <div class="page-title">{{ pageTitle }}</div>
            <div class="header-actions">
              <n-tooltip trigger="hover" placement="bottom">
                <template #trigger>
                  <n-button quaternary circle @click="toggleDarkMode">
                    <template #icon>
                      <icon-moon v-if="isDarkMode" />
                      <icon-sun v-else />
                    </template>
                  </n-button>
                </template>
                {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
              </n-tooltip>
              
              <n-tooltip trigger="hover" placement="bottom">
                <template #trigger>
                  <n-button quaternary circle @click="logout">
                    <template #icon>
                      <icon-logout />
                    </template>
                  </n-button>
                </template>
                Logout
              </n-tooltip>
            </div>
          </div>
        </n-layout-header>
  
        <!-- Content -->
        <n-layout-content class="console-content">
          <!-- Слот для контента дочерних маршрутов -->
          <router-view />
        </n-layout-content>
  
        <!-- Footer -->
        <n-layout-footer bordered class="console-footer">
          <div class="footer-content">
            Console App © {{ new Date().getFullYear() }} | Version 1.0.0
          </div>
        </n-layout-footer>
      </n-layout>
    </n-layout>
  </template>
  
  <script setup lang="ts">
  import { ref, h, computed } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { 
    NLayout, 
    NLayoutSider, 
    NLayoutHeader, 
    NLayoutContent, 
    NLayoutFooter,
    NMenu,
    NButton, 
    NDropdown,
    NAvatar,
    NTooltip,
    NIcon
  } from 'naive-ui';
  import { 
    IconDashboard,
    IconUsers,
    IconMoon,
    IconSun,
    IconLogout,
    IconAppWindowFilled
  } from '@tabler/icons-vue';
  import { useUserStore } from '@/stores/user';
  import { useThemeStore } from '@/stores/theme';
  
  // Router and route
  const router = useRouter();
  const route = useRoute();
  
  // User store
  const userStore = useUserStore();
  const user = computed(() => userStore.user || { name: 'Guest', role: 'User' });
  const userInitials = computed(() => {
    const name = user.value.name;
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });
  
  // Theme store
  const themeStore = useThemeStore();
  const isDarkMode = computed(() => themeStore.isDark);
  const toggleDarkMode = () => themeStore.toggleDarkMode();
  
  // Sidebar collapse state
  const collapsed = ref(false);
  
  // Active menu item
  const activeKey = computed(() => {
    const path = route.path;
    if (path.startsWith('/accounts')) return 'accounts';
    if (path.startsWith('/dashboard')) return 'dashboard';
    return '';
  });
  
  // Page title based on route
  const pageTitle = computed(() => {
    return route.meta.title as string || 'Console';
  });
  
  // Helper function to render icons
  function renderIcon(icon: any) {
    return () => h(icon);
  }
  
  // Menu options
  const menuOptions = [
    {
      label: 'Dashboard',
      key: 'dashboard',
      icon: renderIcon(IconDashboard),
    },
    {
      label: 'Accounts',
      key: 'accounts',
      icon: renderIcon(IconUsers),
    }
  ];
  
  // User menu dropdown options
  const userMenuOptions = [
    {
      label: 'Logout',
      key: 'logout',
      icon: renderIcon(IconLogout)
    }
  ];
  
  // Handle menu item click
  const handleMenuUpdate = (key: string) => {
    switch (key) {
      case 'dashboard':
        router.push('/dashboard');
        break;
      case 'accounts':
        router.push('/accounts');
        break;
    }
  };
  
  // Handle user menu selection - simplified to only handle logout
  const handleLogout = (key: string) => {
    if (key === 'logout') {
      logout();
    }
  };
  
  // Logout function
  const logout = () => {
    userStore.logout();
    router.push('/login');
  };
  </script>
  
  <style scoped>
  .console-sider {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .logo-container {
    height: 64px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .logo-icon {
    color: var(--primary-color, #18a058);
  }
  
  .logo-text {
    font-size: 18px;
    font-weight: 600;
    transition: opacity 0.3s ease;
  }
  
  .user-section {
    margin-top: auto;
    padding: 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
  }
  
  .user-section-collapsed {
    display: flex;
    justify-content: center;
    padding: 16px 0;
  }
  
  .user-dropdown-trigger {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    transition: background-color 0.3s;
  }
  
  .user-dropdown-trigger:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
  }
  
  .user-name {
    font-weight: 500;
    font-size: 14px;
  }
  
  .user-role {
    font-size: 12px;
    opacity: 0.7;
  }
  
  .console-header {
    height: 64px;
    padding: 0 24px;
  }
  
  .header-content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .page-title {
    font-size: 18px;
    font-weight: 500;
  }
  
  .header-actions {
    display: flex;
    gap: 8px;
  }
  
  .console-content {
    padding: 24px;
    min-height: calc(100vh - 64px - 50px); /* Viewport height minus header and footer */
  }
  
  .console-footer {
    height: 50px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .footer-content {
    font-size: 14px;
    opacity: 0.7;
  }
  
  :deep(.n-layout-toggle-button) {
    margin-top: 8px;
  }
  </style>