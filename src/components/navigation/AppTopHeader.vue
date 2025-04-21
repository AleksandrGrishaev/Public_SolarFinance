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
          size="md" 
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
        <div class="app-top-header__icon-container" v-if="showMessageIcon">
          <BaseIcon 
            :icon="IconMessage" 
            size="xl" 
            rounded="full"
            class="app-top-header__icon"
            clickable
            @click="handleMessageClick"
          />
          <div 
            v-if="hasNotifications" 
            class="app-top-header__notification-badge"
          ></div>
        </div>
        <BaseIcon 
          v-if="showProfileIcon"
          :icon="IconUser" 
          size="xl" 
          rounded="full"
          class="app-top-header__icon"
          clickable
          @click="handleProfileClick"
        />
        <slot name="right"></slot>
      </div>
    </header>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import { IconArrowLeft, IconMessage, IconUser } from '@tabler/icons-vue';
  import BaseIcon from '@/components/ui/icons/BaseIcon.vue';
  import { usePlatform } from '@/composables/usePlatform';
  
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
     * Show notification badge on message icon
     */
    hasNotifications: {
      type: Boolean,
      default: false
    },
    /**
     * Show message icon
     */
    showMessageIcon: {
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
    }
  });
  
  const emit = defineEmits(['back', 'message', 'profile']);
  
  // Platform detection
  const { safeAreaInsets, platform } = usePlatform();
  
  // Compute dynamic style for header based on platform
  const headerStyle = computed(() => {
    if (!props.applySafeArea) return {};
    
    return {
      paddingTop: `${safeAreaInsets.value.top}px`
    };
  });
  
  /**
   * Handle back button click
   */
  const handleBackClick = () => {
    emit('back');
  };
  
  /**
   * Handle message icon click
   */
  const handleMessageClick = () => {
    emit('message');
  };
  
  /**
   * Handle profile icon click
   */
  const handleProfileClick = () => {
    emit('profile');
  };
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
  }
  
  .app-top-header.with-safe-area {
    box-sizing: content-box;
  }
  
  .app-top-header__left {
    display: flex;
    align-items: center;
  }
  
  .app-top-header__back-button {
    cursor: pointer;
  }
  
  .app-top-header__title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .app-top-header__right {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-sm);
    align-items: center;
  }
  
  .app-top-header__icon-container {
    position: relative;
  }
  
  .app-top-header__notification-badge {
    background-color: var(--color-warning);
    border-radius: 50%;
    width: 8px;
    height: 8px;
    position: absolute;
    top: 0;
    right: 0;
  }
  </style>