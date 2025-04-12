<!-- src/components/NavigationMenu.vue -->
<template>
    <n-menu
      :value="activeKey"
      :collapsed="collapsed"
      :collapsed-width="64"
      :collapsed-icon-size="22"
      :options="menuOptions"
      @update:value="handleMenuUpdate"
    />
  </template>
  
  <script setup lang="ts">
  import { h, computed } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { NMenu } from 'naive-ui';
  import { IconDashboard, IconUsers } from '@tabler/icons-vue';
  
  // Props
  defineProps<{
    collapsed: boolean;
  }>();
  
  // Router and route
  const router = useRouter();
  const route = useRoute();
  
  // Active menu item
  const activeKey = computed(() => {
    const path = route.path;
    if (path.startsWith('/accounts')) return 'accounts';
    if (path.startsWith('/dashboard')) return 'dashboard';
    return '';
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
  </script>