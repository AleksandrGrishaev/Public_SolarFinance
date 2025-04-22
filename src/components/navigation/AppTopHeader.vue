<!-- src/components/navigation/AppTopHeader.vue -->
<template>
  <header 
    class="app-top-header" 
    :class="{ 'with-safe-area': applySafeArea }"
    :style="headerStyle"
  >
    <div class="app-top-header__left">
      <BaseIcon 
        v-if="showBackButton"
        :icon="IconArrowLeft" 
        size="xl" 
        clickable
        class="app-top-header__back-button"
        @click="handleBackClick"
      />
      <slot name="left"></slot>
    </div>
    <div class="app-top-header__title" v-if="title || $slots.title">
      <h1 v-if="title" class="en-subheading text-usual">{{ title }}</h1>
      <slot name="title"></slot>
    </div>
    <div class="app-top-header__right">
      <slot name="pre-icons"></slot>
      <div class="app-top-header__icon-container" v-if="showNotificationIcon">
        <BaseIcon 
          :icon="IconBell" 
          :size="18" 
          rounded="full"
          class="app-top-header__icon"
          clickable
          :background="background"
          :color="iconColor"
          :bordered="bordered"
          :borderColor="borderColor"
          :padding="padding"
          :autoSize="true"
          @click="handleNotificationClick"
        />
        <div 
          v-if="hasUnreadNotifications" 
          class="app-top-header__notification-badge"
        ></div>
      </div>
      <BaseIcon 
        v-if="showProfileIcon"
        :icon="IconUser" 
        :size="18"
        rounded="full"
        class="app-top-header__icon"
        clickable
        :background="background"
        :color="iconColor"
        :bordered="true"
        :borderColor="isProfilePage ? 'var(--icon-borderActive)' : borderColor"
        :padding="padding"
        :autoSize="true"
        @click="handleProfileClick"
      />
      <slot name="right"></slot>
    </div>
    
    <!-- Notification popup component -->
    <NotificationPopup ref="notificationPopupRef" />
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { IconArrowLeft, IconBell as IconBellOrig, IconUser } from '@tabler/icons-vue';
// Create refs for icons to use in template
const IconBell = IconBellOrig;
import BaseIcon from '@/components/ui/icons/BaseIcon.vue';
import { usePlatform } from '@/stores/system/composables/usePlatform';
import { useApp } from '@/stores/system/composables/useApp';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user/userStore';
import { useNotifications } from '@/stores/notification/composables/useNotifications';
import NotificationPopup from '@/views/notification/components/NotificationPopup.vue';

const props = defineProps({
  /**
   * Show back button
   */
  showBackButton: {
    type: Boolean,
    default: true
  },
  /**
   * Title to show in the header center
   */
  title: {
    type: String,
    default: ''
  },
  /**
   * Show notification icon
   */
  showNotificationIcon: {
    type: Boolean,
    default: true
  },
  /**
   * Show profile icon
   */
  showProfileIcon: {
    type: Boolean,
    default: true
  },
  /**
   * Apply platform-specific safe area (for mobile devices)
   */
  applySafeArea: {
    type: Boolean,
    default: true
  },
  /**
   * Background color for icons
   */
  background: {
    type: String,
    default: null
  },
  /**
   * Icon color
   */
  iconColor: {
    type: String,
    default: 'white'
  },
  /**
   * Apply border to icons
   */
  bordered: {
    type: Boolean,
    default: false
  },
  /**
   * Border color for icons
   */
  borderColor: {
    type: String,
    default: null
  },
  /**
   * Padding for icons
   */
  padding: {
    type: [String, Number],
    default: 10
  },
  /**
   * Icon size
   */
  iconSize: {
    type: Number,
    default: 18
  }
});

const emit = defineEmits(['back', 'profile', 'notification']);

// Platform detection and safe area
const { safeAreaInsets } = usePlatform();
const { goBack } = useApp();
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { hasUnread } = useNotifications();
const notificationPopupRef = ref<InstanceType<typeof NotificationPopup> | null>(null);

// Проверяем, находимся ли мы на странице профиля
const isProfilePage = computed(() => {
  return route.path.includes('/profile');
});

// Check if there are unread notifications
const hasUnreadNotifications = computed(() => {
  return hasUnread.value;
});

// No need to ref the icons since they're already imported above

// Compute dynamic style for header based on platform
const headerStyle = computed(() => {
  if (!props.applySafeArea) return {};
  
  return {
    paddingTop: `${safeAreaInsets.value.top}px`,
    // Учитываем дополнительное внутреннее пространство при вычислении общей высоты
    height: safeAreaInsets.value.top > 0 ? `calc(34px + ${safeAreaInsets.value.top}px)` : '34px'
  };
});

/**
 * Handle back button click
 */
const handleBackClick = () => {
  emit('back');
  goBack();
};

/**
 * Handle notification icon click
 */
const handleNotificationClick = () => {
  emit('notification');
  if (notificationPopupRef.value) {
    notificationPopupRef.value.open();
  }
};

/**
 * Handle profile icon click
 */
const handleProfileClick = () => {
  emit('profile');
  // Переходим на страницу профиля
  router.push('/profile');
};

// Добавляем для отладки
onMounted(() => {
  // Получаем информацию о теме пользователя
  const currentTheme = userStore.currentUser?.settings?.theme || 'system';
  
  console.log('[AppTopHeader] Mounted with props:', {
    showNotificationIcon: props.showNotificationIcon,
    background: props.background,
    padding: props.padding,
    bordered: props.bordered,
    isProfilePage: isProfilePage.value,
    userTheme: currentTheme,
    hasUnread: hasUnreadNotifications.value
  });
});
</script>

<style scoped>
.app-top-header {
  padding: var(--spacing-xs) var(--spacing-lg);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 34px;
  width: 100%;
  background-color: transparent;
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden;
}

.app-top-header.with-safe-area {
  box-sizing: border-box;
  height: auto;
  min-height: 34px;
}

.app-top-header__left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  z-index: 2;
}

.app-top-header__back-button {
  cursor: pointer;
}

.app-top-header__title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50%;
  z-index: 1;
}

.app-top-header__right {
  display: flex;
  flex-direction: row;
  gap: var(--spacing-sm);
  align-items: center;
  flex-shrink: 0;
  z-index: 2;
}

.app-top-header__icon-container {
  position: relative;
}

.app-top-header__notification-badge {
  background-color: var(--color-warning);
  border-radius: 50%;
  width: 10px;
  height: 10px;
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 3;
}
</style>