<template>
    <div class="account-selector" @click="showDropdown = !showDropdown">
      <div class="selected-account">
        <div class="account-icon" :style="{ backgroundColor: getAccountColor(selectedAccount.id) }">
          {{ selectedAccount.code.charAt(0) }}
        </div>
        <div class="account-name">{{ selectedAccount.name }}</div>
        <div class="dropdown-icon">
          <n-icon>
            <chevron-down />
          </n-icon>
        </div>
      </div>
      
      <n-dropdown
        v-model:show="showDropdown"
        :options="dropdownOptions"
        @select="handleAccountSelect"
        trigger="manual"
        placement="bottom-start"
      >
        <div ref="dropdownTrigger" style="width: 0; height: 0;"></div>
      </n-dropdown>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { ChevronDown } from '@vicons/tabler'
  import { NIcon, NDropdown } from 'naive-ui'
  
  const props = defineProps({
    selectedAccount: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits(['select-account'])
  
  const accounts = ref([
    { id: 'dollar', name: 'Dollar', symbol: '$', code: 'USD' },
    { id: 'euro', name: 'Euro', symbol: '€', code: 'EUR' },
    { id: 'ruble', name: 'Ruble', symbol: '₽', code: 'RUB' }
  ])
  
  const showDropdown = ref(false)
  const dropdownTrigger = ref(null)
  
  // Формируем опции для выпадающего списка
  const dropdownOptions = computed(() => {
    return accounts.value.map(account => ({
      label: account.name,
      key: account.id,
      icon: () => h('div', { 
        style: { 
          backgroundColor: getAccountColor(account.id),
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          marginRight: '8px'
        } 
      }, account.code.charAt(0))
    }))
  })
  
  const handleAccountSelect = (key) => {
    const account = accounts.value.find(c => c.id === key)
    if (account) {
      emit('select-account', account)
    }
    showDropdown.value = false
  }
  
  // Цвета для иконок счетов
  const getAccountColor = (accountId) => {
    const colors = {
      dollar: '#F9A825', // Золотистый для доллара
      euro: '#1565C0', // Синий для евро
      ruble: '#4CAF50'  // Зеленый для рубля
    }
    return colors[accountId] || '#9E9E9E'
  }
  </script>
  
  <style scoped>
  .account-selector {
    display: flex;
    justify-content: center;
    margin: 16px 0;
  }
  
  .selected-account {
    display: flex;
    align-items: center;
    background-color: #333;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
  }
  
  .account-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    font-weight: 600;
    font-size: 14px;
  }
  
  .account-name {
    font-size: 16px;
    margin-right: 8px;
  }
  
  .dropdown-icon {
    display: flex;
    align-items: center;
  }
  </style>