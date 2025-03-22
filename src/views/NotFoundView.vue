<!-- src/views/NotFoundView.vue -->
<template>
    <div class="not-found-container">
      <n-result
        status="404"
        title="404 Not Found"
        description="Sorry, the page you are looking for does not exist."
      >
        <template #footer>
          <n-button type="primary" @click="goHome">
            Go to Dashboard
          </n-button>
        </template>
      </n-result>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useRouter } from 'vue-router';
  import { NResult, NButton } from 'naive-ui';
  
  const router = useRouter();
  
  const goHome = () => {
    router.push('/dashboard');
  };
  </script>
  
  <style scoped>
  .not-found-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 24px;
  }
  </style>