<template>
    <div class="bottom-navigation">
      <div class="navigation-content">
        <div 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['nav-item', { active: activeTab === tab.id }]"
          @click="selectTab(tab.id)"
        >
          <n-icon size="20" class="nav-icon">
            <component :is="tab.icon" />
          </n-icon>
          <span class="nav-label">{{ tab.name }}</span>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { NIcon } from 'naive-ui'
  import { 
    Book, 
    CreditCard, 
    ChartBar, 
    DotsCircleHorizontal 
  } from '@vicons/tabler'
  
  const props = defineProps({
    activeTab: {
      type: String,
      required: true
    }
  })
  
  const emit = defineEmits(['change-tab'])
  
  const tabs = ref([
    { id: 'books', name: 'Books', icon: Book },
    { id: 'assets', name: 'Assets', icon: CreditCard },
    { id: 'charts', name: 'Charts', icon: ChartBar },
    { id: 'more', name: 'More', icon: DotsCircleHorizontal }
  ])
  
  const selectTab = (tabId) => {
    emit('change-tab', tabId)
  }
  </script>
  
  <style scoped>
  .bottom-navigation {
    position: relative;
    margin-top: 16px;
    padding: 0 8px;
  }
  
  .navigation-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    background-color: #333;
    border-radius: 24px;
    z-index: 10;
  }
  
  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 16px;
    border-radius: 16px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .nav-item.active {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .nav-icon {
    margin-bottom: 4px;
  }
  
  .nav-label {
    font-size: 12px;
  }
  </style>