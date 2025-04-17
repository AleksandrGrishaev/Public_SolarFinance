<template>
    <slot></slot>
  </template>
  
  <script setup lang="ts">
  import { useMessage } from 'naive-ui';
  import { messageService } from '@/services/system/MessageService';
  
  // Получаем провайдер сообщений в контексте setup
  const message = useMessage();
  
  // Устанавливаем его в наш сервис сразу
  messageService.setProvider(message);
  </script>