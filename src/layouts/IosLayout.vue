<!-- /Users/peaker/dev/solar-finance/src/layouts/IosLayout.vue -->
<template>
    <div class="ios-layout" :class="{ 'dark-theme': isDarkTheme }">
      <div class="ios-content">
        <router-view></router-view>
      </div>
      
      <nav-menu v-if="showNavMenu" />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import NavMenu from '../components/navigation/NavMenu.vue';
  
  const props = defineProps({
    showNavMenu: {
      type: Boolean,
      default: true
    }
  });
  
  const isDarkTheme = ref(true);
  </script>
  
  <style scoped>
  .ios-layout {
    width: 100%;
    height: 100vh;
    position: relative;
    background-color: black;
    color: white;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .ios-content {
    flex: 1;
    overflow-y: auto;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
  
  .dark-theme {
    background-color: black;
    color: white;
  }
  </style>