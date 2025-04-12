<!-- /Users/peaker/dev/solar-finance/src/layouts/IosLayout.vue -->
<template>
  <div class="ios-layout" :class="{ 'dark-theme': isDarkTheme }">
    <div class="ios-content">
      <router-view @update:showMenu="updateShowMenu"></router-view>
    </div>
    
    <div v-if="showNavMenu" class="menu-container">
      <nav-menu />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import NavMenu from '../components/navigation/NavMenu.vue';

const props = defineProps({
  showNavMenu: {
    type: Boolean,
    default: true
  }
});

const isDarkTheme = ref(true);
const localShowNavMenu = ref(props.showNavMenu);

// Этот метод будет вызываться из дочерних компонентов
const updateShowMenu = (value: boolean) => {
  localShowNavMenu.value = value;
};

// Вычисляемое свойство, учитывающее как пропсы, так и локальное состояние
const showNavMenu = computed(() => {
  return props.showNavMenu && localShowNavMenu.value;
});
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
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dark-theme {
  background-color: black;
  color: white;
}

.menu-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  padding-bottom: 20px; /* Отступ в 20px от низа экрана */
  z-index: 100;
}
</style>