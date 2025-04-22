<!-- src/components/organisms/alerts/AlertContainer.vue -->
<template>
    <div class="alert-container">
      <TransitionGroup name="alert-list">
        <BaseAlert
          v-for="alert in alerts"
          :key="alert.id"
          :model-value="true"
          :type="alert.type"
          :title="alert.title"
          :message="alert.message"
          :duration="alert.duration"
          :closable="alert.closable !== false"
          :show-icon="alert.showIcon !== false"
          :clickable="!!alert.action"
          @close="removeAlert(alert.id)"
          @click="handleAlertClick(alert)"
        />
      </TransitionGroup>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import BaseAlert from '@/components/atoms/alerts/BaseAlert.vue';
  import { useAlertStore, type Alert } from '@/stores/alert/alertService';
  
  const alertStore = useAlertStore();
  
  const alerts = computed(() => alertStore.alerts);
  
  const removeAlert = (id: string) => {
    alertStore.remove(id);
  };
  
  const handleAlertClick = (alert: Alert) => {
    if (alert.action) {
      alert.action();
    }
    
    if (alert.closable !== false) {
      removeAlert(alert.id);
    }
  };
  </script>
  
  <style scoped>
  .alert-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 400px;
    width: calc(100% - 40px);
  }
  
  /* Transition group animations */
  .alert-list-enter-active,
  .alert-list-leave-active {
    transition: all 0.3s ease;
  }
  
  .alert-list-enter-from {
    opacity: 0;
    transform: translateX(30px);
  }
  
  .alert-list-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }
  
  /* Ensure proper positioning and prevent overlap */
  .alert-list-move {
    transition: transform 0.3s ease;
  }
  </style>