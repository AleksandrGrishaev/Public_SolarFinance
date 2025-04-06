<template>
  <div class="empty-layout">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// Пустой макет без дополнительного функционала
</script>

<style scoped>
.empty-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>