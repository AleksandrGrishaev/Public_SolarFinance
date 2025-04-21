<!-- src/components/navigation/AppTopHeader.vue -->
<template>
    <header class="app-top-header">
      <div class="app-top-header__left">
        <BaseIcon 
          v-if="showBackButton"
          :icon="IconArrowLeft" 
          size="md" 
          clickable
          class="app-top-header__back-button"
          @click="handleBackClick"
        />
      </div>
      <div class="app-top-header__title" v-if="title">
        <h1 class="en-subheading text-usual">{{ title }}</h1>
      </div>
      <div class="app-top-header__right">
        <div class="app-top-header__icon-container">
          <BaseIcon 
            :icon="IconMessage" 
            size="lg" 
            rounded="full"
            class="app-top-header__icon app-top-header__icon--bg"
            :customStyle="{ background: 'var(--bg-field-dark)' }"
            clickable
            @click="handleMessageClick"
          />
          <div 
            v-if="hasNotifications" 
            class="app-top-header__notification-badge"
          ></div>
        </div>
        <BaseIcon 
          :icon="IconUser" 
          size="lg" 
          rounded="full"
          class="app-top-header__icon app-top-header__icon--bg"
          :customStyle="{ background: 'var(--bg-field-dark)' }"
          clickable
          @click="handleProfileClick"
        />
      </div>
    </header>
  </template>
  
  <script setup lang="ts">
  import { IconArrowLeft, IconMessage, IconUser } from '@tabler/icons-vue';
  import BaseIcon from '@/components/ui/icons/BaseIcon.vue';
  
  defineProps({
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
    }
  });
  
  const emit = defineEmits(['back', 'message', 'profile']);
  
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
  
  .app-top-header__icon--bg {
    border: 1px solid var(--bg-field-dark);
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