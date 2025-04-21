<!-- src/components/ui/icons/AccountIcon.vue -->
<template>
    <div 
      class="account-icon"
      :style="{ 
        backgroundColor: backgroundColor || account?.color || '#808080',
        width: `${size}px`, 
        height: `${size}px`,
        fontSize: `${Math.round(size * 0.4)}px`
      }"
    >
      <!-- Если есть иконка, рендерим её -->
      <component 
        v-if="iconComponent"
        :is="iconComponent" 
        :size="Math.round(size * 0.6)" 
        :color="iconColor" 
        :stroke-width="strokeWidth"
      />
      <!-- Иначе используем символ валюты -->
      <template v-else>
        {{ displaySymbol }}
      </template>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import * as TablerIcons from '@tabler/icons-vue';
  import { useFormatBalance } from '../../../../composables/transaction/useFormatBalance.ts';
  
  const props = defineProps({
    account: {
      type: Object,
      default: null
    },
    icon: {
      type: [String, Object],
      default: null
    },
    backgroundColor: {
      type: String,
      default: null
    },
    size: {
      type: Number,
      default: 30
    },
    iconColor: {
      type: String,
      default: 'white'
    },
    symbol: {
      type: String,
      default: null
    },
    strokeWidth: {
      type: Number,
      default: 1.5
    }
  });
  
  // Используем утилиту форматирования
  const { getCurrencySymbol } = useFormatBalance();
  
  // Функция для получения иконки Tabler по имени
  const getTablerIcon = (iconName) => {
    if (!iconName) return null;
    
    // Если начинается с "Icon", используем как есть
    const lookupName = iconName.startsWith('Icon') 
      ? iconName 
      : `Icon${iconName.charAt(0).toUpperCase()}${iconName.slice(1)}`;
    
    return TablerIcons[lookupName] || null;
  };
  
  // Компонент иконки
  const iconComponent = computed(() => {
    // Приоритет 1: Явно указанная иконка
    if (props.icon) {
      // Если это уже компонент
      if (typeof props.icon === 'object') return props.icon;
      // Если это строка, пытаемся найти иконку Tabler
      return getTablerIcon(props.icon);
    }
    
    // Приоритет 2: Иконка из аккаунта
    if (props.account?.icon) {
      return getTablerIcon(props.account.icon);
    }
    
    return null;
  });
  
  // Символ для отображения (валюта)
  const displaySymbol = computed(() => {
    // Приоритет 1: Явно указанный символ
    if (props.symbol) return props.symbol;
    
    // Приоритет 2: Символ из аккаунта
    if (props.account?.symbol) return props.account.symbol;
    
    // Приоритет 3: Символ из валюты аккаунта
    if (props.account?.currency) {
      return getCurrencySymbol(props.account.currency);
    }
    
    // По умолчанию
    return '$';
  });
  </script>
  
  <style scoped>
  .account-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    color: white;
    font-weight: bold;
    transition: all 0.2s ease;
  }
  </style>