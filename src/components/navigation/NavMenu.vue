<!-- /Users/peaker/dev/solar-finance/src/components/navigation/NavMenu.vue -->
<template>
    <div class="menu-float-element">
      <div class="menu">
        <div class="buttons">
          <div 
            v-for="item in menuItems" 
            :key="item.id"
            class="menu-item"
            :class="{ 'active': activeItem === item.id }"
            @click="activeItem = item.id"
          >
            <div v-if="item.id === 'new'" class="icon new-transaction">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.32121 8V0H4.67879V8H3.32121ZM0 4.67879V3.32121H8V4.67879H0Z" fill="white"/>
              </svg>
            </div>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  const menuItems = [
    { id: 'new' },
    { id: 'books', label: 'Books' },
    { id: 'assets', label: 'Assets' },
    { id: 'charts', label: 'Charts' },
    { id: 'more', label: 'More' }
  ];
  
  const activeItem = ref('new');
  </script>
  
  <style scoped>
  .menu-float-element {
    width: 100%;
    padding: 3px 20px 10px;
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #000;
  }
  
  .menu {
    padding: 6px 8px 6px 12px;
    background: #DBDADD;
    border-radius: 16px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  
  .buttons {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
  }
  
  .menu-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #444444;
    font-size: 12px;
    cursor: pointer;
  }
  
  .icon.new-transaction {
    width: 30px;
    height: 30px;
    padding: 10px;
    background: #444444;
    border-radius: 12px;
    outline: 1px #444444 solid;
    outline-offset: -1px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .active {
    font-weight: 500;
  }
  </style>