<!-- src/views/transaction/components/AccountSelector.vue -->
<template>
    <base-account-selector
      :sourceAccount="selectedAccount"
      :destinationAccount="destinationAccount"
      :isTransfer="isTransfer"
      :showDistributionToggle="showDistributionToggle"
      :isDistributionVisible="isDistributionVisible"
      :iconComponent="getTablerIcon"
      @account-click="showAccountSelector"
      @toggle-distribution="toggleDistribution"
    >
      <template #popups>
        <!-- Account selector popup -->
        <account-selector-popup
          v-model="accountSelectorVisible"
          :accounts="displayableAccounts"
          :bookId="bookId"
          @select="selectAccount"
          @add="handleAddAccount"
          @edit="handleEditAccounts"
        />
      </template>
    </base-account-selector>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import type { Account } from '../../../stores/account/types';
  import BaseAccountSelector from '../../../components/ui/selectors/BaseAccountSelector.vue';
  import AccountSelectorPopup from '../../../views/account/popup/AccountSelectorPopup.vue';
  import { useCurrencyStore } from '../../../stores/currency';
  import * as TablerIcons from '@tabler/icons-vue';
  
  const props = defineProps({
    accounts: {
      type: Array as () => Account[],
      required: true
    },
    modelValue: {
      type: String,
      required: true
    },
    isTransfer: {
      type: Boolean,
      default: false
    },
    destinationAccountId: {
      type: String,
      default: ''
    },
    bookId: {
      type: String,
      default: ''
    },
    showDistributionToggle: {
      type: Boolean,
      default: false
    },
    isDistributionVisible: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits([
    'update:modelValue', 
    'update:destinationAccountId', 
    'add', 
    'edit',
    'toggle-distribution'
  ]);
  
  const accountSelectorVisible = ref(false);
  const selectionMode = ref('source'); // 'source' or 'destination'
  
  const currencyStore = useCurrencyStore();
  
  // Функция для получения иконки Tabler по имени
  const getTablerIcon = (iconName) => {
    if (!iconName) return null;
    
    // Если начинается с "Icon", используем как есть
    const lookupName = iconName.startsWith('Icon') 
      ? iconName 
      : `Icon${iconName.charAt(0).toUpperCase()}${iconName.slice(1)}`;
    
    return TablerIcons[lookupName] || null;
  };
  
  // Получаем выбранный аккаунт
  const selectedAccount = computed(() => {
    const account = props.accounts.find(account => account.id === props.modelValue);
    
    if (account) {
      // Добавляем символ валюты, если он отсутствует в аккаунте
      if (!account.symbol) {
        account.symbol = getCurrencySymbol(account.currency);
      }
      return account;
    }
    
    // Если аккаунт не найден, возвращаем первый доступный или дефолтный
    return props.accounts[0] || { 
      id: '', 
      name: 'No account', 
      currency: 'USD', 
      color: '#5B8FF9'
    };
  });
  
  // Получаем аккаунт назначения для переводов
  const destinationAccount = computed(() => {
    // Если ID аккаунта назначения указан и отличается от текущего выбранного
    if (props.destinationAccountId && props.destinationAccountId !== props.modelValue) {
      const account = props.accounts.find(account => account.id === props.destinationAccountId);
      if (account) {
        // Добавляем символ валюты, если он отсутствует
        if (!account.symbol) {
          account.symbol = getCurrencySymbol(account.currency);
        }
        return account;
      }
    }
    
    // Если есть больше одного аккаунта, выбираем первый, отличный от текущего
    if (props.accounts.length > 1) {
      const otherAccount = props.accounts.find(account => account.id !== props.modelValue);
      if (otherAccount) {
        if (!otherAccount.symbol) {
          otherAccount.symbol = getCurrencySymbol(otherAccount.currency);
        }
        return otherAccount;
      }
    }
    
    // Если ничего не нашли, возвращаем первый или дефолтный
    const fallbackAccount = props.accounts[0] || { 
      id: '', 
      name: 'Destination', 
      currency: 'USD', 
      color: '#61DDAA'
    };
    
    if (!fallbackAccount.symbol) {
      fallbackAccount.symbol = getCurrencySymbol(fallbackAccount.currency);
    }
    
    return fallbackAccount;
  });
  
  // Отображаемые аккаунты в селекторе
  const displayableAccounts = computed(() => {
    // Для не-переводов или при выборе исходного аккаунта показываем все
    if (!props.isTransfer || selectionMode.value === 'source') {
      return props.accounts;
    }
    
    // Для выбора аккаунта назначения исключаем исходный аккаунт
    return props.accounts.filter(account => account.id !== props.modelValue);
  });
  
  // Получение символа валюты если он не указан в аккаунте
  const getCurrencySymbol = (currencyCode) => {
    if (!currencyCode) return '$';
    
    const currency = currencyStore.getCurrency(currencyCode);
    if (currency && currency.symbol) return currency.symbol;
    
    // Резервные символы для основных валют
    const symbolMap = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'RUB': '₽',
      'IDR': 'Rp',
      'INR': '₹',
      'CNY': '¥'
    };
    
    return symbolMap[currencyCode] || currencyCode.substring(0, 1);
  };
  
  // Показать попап выбора аккаунта
  const showAccountSelector = ({ mode = 'source' }) => {
    selectionMode.value = mode;
    accountSelectorVisible.value = true;
  };
  
  // Обработка выбора аккаунта из попапа
  const selectAccount = (account) => {
    if (selectionMode.value === 'source') {
      emit('update:modelValue', account.id);
      
      // Если выбранный аккаунт совпадает с аккаунтом назначения, меняем его
      if (props.isTransfer && account.id === props.destinationAccountId) {
        const otherAccount = props.accounts.find(acc => acc.id !== account.id);
        if (otherAccount) {
          emit('update:destinationAccountId', otherAccount.id);
        }
      }
    } else {
      emit('update:destinationAccountId', account.id);
    }
    
    accountSelectorVisible.value = false;
  };
  
  // Обработка запроса на добавление аккаунта
  const handleAddAccount = () => {
    emit('add');
    accountSelectorVisible.value = false;
  };
  
  // Обработка запроса на редактирование аккаунтов
  const handleEditAccounts = () => {
    emit('edit');
    accountSelectorVisible.value = false;
  };
  
  // Обработчик переключения отображения слайдера распределения
  const toggleDistribution = () => {
    emit('toggle-distribution');
  };
  </script>