<!-- src/views/MoreView.vue -->
<template>
  <div class="more-view">
    <div class="more-content">
      <!-- User Info Section -->
      <div class="user-info-section">
        <div class="user-avatar">
          <n-avatar
            round
            size="large"
            :src="userStore.avatar"
            :style="{ background: userStore.avatar ? 'transparent' : '#4CAF50' }"
          >
            {{ userInitials }}
          </n-avatar>
        </div>
        <div class="user-details">
          <h2 class="user-name">{{ userStore.username }}</h2>
          <p class="user-role">Пользователь</p>
        </div>
      </div>
      
      <!-- Settings List -->
      <div class="settings-list">
        <!-- Profile Settings -->
        <div class="settings-item">
          <div class="settings-item-label">
            <n-icon size="20" class="settings-icon">
              <icon-user />
            </n-icon>
            <span>Профиль</span>
          </div>
          <n-button 
            size="small" 
            @click="router.push('/profile')"
            ghost
          >
            <template #icon>
              <n-icon>
                <icon-settings />
              </n-icon>
            </template>
            Настройки
          </n-button>
        </div>
        
        <!-- App Version -->
        <div class="settings-item">
          <div class="settings-item-label">
            <n-icon size="20" class="settings-icon">
              <icon-info-circle />
            </n-icon>
            <span>Версия приложения</span>
          </div>
          <span class="settings-value">1.0.0</span>
        </div>
        
        <!-- Logout Button -->
        <n-button 
          class="logout-button" 
          type="error" 
          @click="handleLogout"
          :loading="isLoggingOut"
        >
          <template #icon>
            <n-icon>
              <icon-logout />
            </n-icon>
          </template>
          Выйти
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  NAvatar, 
  NButton, 
  NIcon, 
  useMessage 
} from 'naive-ui';
import { 
  IconInfoCircle, 
  IconLogout,
  IconUser,
  IconSettings
} from '@tabler/icons-vue';
import { useUserStore } from '@/stores/user';

// Router
const router = useRouter();

// Stores
const userStore = useUserStore();

// Message provider
const message = useMessage();

// Local state
const isLoggingOut = ref(false);

// User initials for avatar
const userInitials = computed(() => {
  const name = userStore.username || 'User';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
});

// Logout handler
const handleLogout = async () => {
  try {
    isLoggingOut.value = true;
    
    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Выход из системы
    userStore.logout();
    
    // Сообщение об успешном выходе
    message.success('Выход выполнен успешно');
    
    // Перенаправление на страницу входа
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
    message.error('Произошла ошибка при выходе из системы');
  } finally {
    isLoggingOut.value = false;
  }
};
</script>

<style scoped>
.more-view {
  display: flex;
  flex-direction: column;
  background-color: var(--app-background);
  color: var(--text-primary);
  padding-bottom: 100px; /* Для отступа от нижнего меню */
  min-height: calc(100vh - 50px); /* Учитываем высоту заголовка в IosLayout */
}

.more-content {
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
  flex-grow: 1;
}

.user-info-section {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding: 16px;
  background-color: var(--bg-field-light);
  border-radius: 12px;
}

.user-avatar {
  margin-right: 16px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--text-header);
}

.user-role {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: var(--bg-field-light);
  border-radius: 12px;
}

.settings-item-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
}

.settings-icon {
  color: var(--color-primary);
}

.settings-value {
  font-size: 14px;
  color: var(--text-secondary);
}

.logout-button {
  margin-top: 20px;
  padding: 16px;
  font-size: 16px;
}
</style>