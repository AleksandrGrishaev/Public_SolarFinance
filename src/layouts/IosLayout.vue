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
import { ref } from 'vue';
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
import { computed } from 'vue';

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
  overflow-y: auto;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.dark-theme {
  background-color: black;
  color: white;
}

.menu-container {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  padding-bottom: 20px; /* Отступ в 20px от низа экрана */
}
</style>