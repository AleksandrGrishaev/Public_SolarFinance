<!-- src/views/DashboardView.vue -->
<template>
    <div class="dashboard-container">
      <n-h2>Dashboard</n-h2>
      
      <!-- Stats Cards -->
      <n-grid :cols="3" :x-gap="12" :y-gap="12" responsive="screen" :item-responsive="true">
        <n-grid-item span="1 m:1 l:1">
          <n-card>
            <template #header>
              <div class="stat-header">
                <div class="stat-title">Active Users</div>
                <n-icon size="24" class="stat-icon">
                  <icon-users />
                </n-icon>
              </div>
            </template>
            <div class="stat-value">128</div>
            <div class="stat-trend stat-trend-up">+5.2%</div>
          </n-card>
        </n-grid-item>
        <n-grid-item span="1 m:1 l:1">
          <n-card>
            <template #header>
              <div class="stat-header">
                <div class="stat-title">Total Revenue</div>
                <n-icon size="24" class="stat-icon">
                  <icon-chart-bar />
                </n-icon>
              </div>
            </template>
            <div class="stat-value">$9,275</div>
            <div class="stat-trend stat-trend-up">+12.3%</div>
          </n-card>
        </n-grid-item>
        <n-grid-item span="1 m:1 l:1">
          <n-card>
            <template #header>
              <div class="stat-header">
                <div class="stat-title">Average Response</div>
                <n-icon size="24" class="stat-icon">
                  <icon-clock />
                </n-icon>
              </div>
            </template>
            <div class="stat-value">18m</div>
            <div class="stat-trend stat-trend-down">-2.7%</div>
          </n-card>
        </n-grid-item>
      </n-grid>
      
      <!-- Recent Activity -->
      <div class="dashboard-section">
        <n-h3>Recent Activity</n-h3>
        <n-card>
          <n-list>
            <n-list-item v-for="(activity, index) in recentActivities" :key="index">
              <n-thing :title="activity.title" :description="activity.time">
                <template #avatar>
                  <n-avatar round :style="{ backgroundColor: activity.color }">
                    <n-icon>
                      <component :is="activity.icon" />
                    </n-icon>
                  </n-avatar>
                </template>
                <template #description>
                  {{ activity.description }}
                </template>
              </n-thing>
            </n-list-item>
          </n-list>
        </n-card>
      </div>
      
      <!-- Quick Actions -->
      <div class="dashboard-section">
        <n-h3>Quick Actions</n-h3>
        <n-grid :cols="4" :x-gap="12" responsive="screen" :item-responsive="true">
          <n-grid-item span="1 m:2 l:1" v-for="action in quickActions" :key="action.name">
            <n-card hoverable @click="action.handler">
              <div class="action-card">
                <n-icon size="24" class="action-icon">
                  <component :is="action.icon" />
                </n-icon>
                <div class="action-name">{{ action.name }}</div>
              </div>
            </n-card>
          </n-grid-item>
        </n-grid>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { 
    NH2, 
    NH3,
    NGrid, 
    NGridItem, 
    NCard, 
    NList,
    NListItem,
    NThing,
    NAvatar,
    NIcon, 
    useMessage
  } from 'naive-ui';
  import { 
    IconUsers, 
    IconChartBar, 
    IconClock,
    IconPlus,
    IconSettings,
    IconFileImport,
    IconRefresh,
    IconUserPlus,
    IconAlertCircle,
    IconDeviceAnalytics
  } from '@tabler/icons-vue';
  
  const router = useRouter();
  const message = useMessage();
  
  // Sample recent activities
  const recentActivities = ref([
    {
      title: 'New User Registered',
      description: 'User "Alex Smith" completed registration',
      time: '10 minutes ago',
      icon: IconUserPlus,
      color: '#18a058'
    },
    {
      title: 'System Update',
      description: 'System updated to version 2.4.0',
      time: '2 hours ago',
      icon: IconRefresh,
      color: '#2080f0'
    },
    {
      title: 'Alert Triggered',
      description: 'High CPU usage detected on server #8',
      time: '5 hours ago',
      icon: IconAlertCircle,
      color: '#d03050'
    },
    {
      title: 'Report Generated',
      description: 'Monthly analytics report is ready',
      time: 'Yesterday, 3:25 PM',
      icon: IconDeviceAnalytics,
      color: '#f0a020'
    }
  ]);
  
  // Quick actions
  const quickActions = [
    {
      name: 'Add User',
      icon: IconUserPlus,
      handler: () => router.push('/accounts/new')
    },
    {
      name: 'Settings',
      icon: IconSettings,
      handler: () => router.push('/settings')
    },
    {
      name: 'Import Data',
      icon: IconFileImport,
      handler: () => message.info('Import functionality would open here')
    },
    {
      name: 'New Report',
      icon: IconPlus,
      handler: () => message.info('Report creation would start here')
    }
  ];
  </script>
  
  <style scoped>
  .dashboard-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .dashboard-section {
    margin-top: 12px;
  }
  
  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .stat-title {
    font-weight: 500;
  }
  
  .stat-icon {
    opacity: 0.7;
  }
  
  .stat-value {
    font-size: 28px;
    font-weight: 600;
    margin: 12px 0 8px;
  }
  
  .stat-trend {
    font-size: 14px;
    font-weight: 500;
  }
  
  .stat-trend-up {
    color: #18a058;
  }
  
  .stat-trend-down {
    color: #d03050;
  }
  
  .action-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 8px;
    text-align: center;
    cursor: pointer;
  }
  
  .action-icon {
    margin-bottom: 12px;
    color: var(--primary-color);
  }
  
  .action-name {
    font-weight: 500;
  }
  </style>