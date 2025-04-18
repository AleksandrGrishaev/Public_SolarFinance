<template>
    <div class="account-type-selector">
      <div class="dropdown-select" @click="isOpen = !isOpen">
        <div class="selected-type">
          <div v-if="selectedIcon" class="type-icon">
            <component :is="selectedIcon" size="18" stroke-width="1.5" />
          </div>
          <span>{{ displayValue }}</span>
        </div>
        <svg width="7" height="6" viewBox="0 0 7 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.05569 6L-0.000210353 0L1.19234 0L3.40973 4.60249L3.33519 4.56522H3.52153L3.447 4.60249L5.66439 0L6.85693 0L3.80103 6H3.05569Z" fill="#404040"/>
        </svg>
      </div>
      
      <div v-if="isOpen" class="dropdown-menu">
        <div 
          v-for="option in typeOptions" 
          :key="option.value"
          class="dropdown-item"
          @click="selectType(option.value)"
        >
          <div class="type-icon" v-if="getIconForType(option.value)">
            <component :is="getIconForType(option.value)" size="18" stroke-width="1.5" />
          </div>
          <div 
            class="type-color-dot" 
            :style="{ backgroundColor: getColorForType(option.value) }"
          ></div>
          <span>{{ option.label }}</span>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import type { AccountType } from '../../../stores/account/types';
  import { useAccountTypes } from '../composables/useAccountTypes';
  
  // Импортируем иконки из @tabler/icons-vue
  import { 
    IconWallet, 
    IconBuilding, 
    IconCreditCard, 
    IconPigMoney, 
    IconChartLine 
  } from '@tabler/icons-vue';
  
  const props = defineProps({
    modelValue: {
      type: String as () => AccountType,
      required: true
    }
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  const isOpen = ref(false);
  const { typeOptions, getDefaultIconForAccountType, getDefaultColorForAccountType } = useAccountTypes();
  
  // Получаем иконку для типа аккаунта
    const getIconForType = (type: AccountType) => {
    const iconName = getDefaultIconForAccountType(type);
    
    switch (iconName) {
      case 'IconWallet': return IconWallet;
      case 'IconBuilding': return IconBuilding;
      case 'IconCreditCard': return IconCreditCard;
      case 'IconPigMoney': return IconPigMoney;
      case 'IconLineChart': return IconChartLine; // Изменено на IconChartLine из @tabler/icons-vue
      default: return IconWallet;
    }
  };
  
  // Получаем цвет для типа аккаунта
  const getColorForType = (type: AccountType) => {
    return getDefaultColorForAccountType(type);
  };
  
  // Иконка выбранного типа
  const selectedIcon = computed(() => {
    return getIconForType(props.modelValue);
  });
  
  // Текст для отображения
  const displayValue = computed(() => {
    const selectedType = typeOptions.value.find(option => option.value === props.modelValue);
    return selectedType ? selectedType.label : 'Select type';
  });
  
  // Выбор типа аккаунта
  const selectType = (type: AccountType) => {
    emit('update:modelValue', type);
    isOpen.value = false;
  };
  
  // Закрыть выпадающий список при клике вне компонента
  const handleOutsideClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.account-type-selector')) {
      isOpen.value = false;
    }
  };
  
  // Обработчики событий
  onMounted(() => {
    document.addEventListener('click', handleOutsideClick);
  });
  
  onUnmounted(() => {
    document.removeEventListener('click', handleOutsideClick);
  });
  </script>
  
  <style scoped>
  .account-type-selector {
    position: relative;
    width: 100%;
  }
  
  .dropdown-select {
    height: 36px;
    background-color: #949496;
    border-radius: 14px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;
    font-size: 14px;
    cursor: pointer;
  }
  
  .selected-type {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .type-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background-color: #555555;
    border-radius: 8px;
    padding: 8px 0;
    z-index: 10;
    max-height: 240px;
    overflow-y: auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .dropdown-item {
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: #FFFFFF;
    font-size: 14px;
    transition: background-color 0.2s;
  }
  
  .dropdown-item:hover {
    background-color: #666666;
  }
  
  .type-color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  </style>