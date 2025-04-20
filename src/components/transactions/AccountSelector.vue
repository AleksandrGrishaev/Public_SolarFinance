<!-- src/components/transactions/AccountSelector.vue -->
<template>
  <div class="account-element">
    <!-- For regular transactions (not transfer) -->
    <div v-if="!isTransfer" class="single-account">
      <div 
        class="account-section"
        @click="showAccountSelector('source')"
      >
        <div class="account-icon" :style="{ backgroundColor: selectedAccount.color || '#5B8FF9' }">
          <!-- Если есть иконка, рендерим её -->
          <component 
            v-if="selectedAccount.icon && getTablerIcon(selectedAccount.icon)" 
            :is="getTablerIcon(selectedAccount.icon)" 
            size="14" 
            color="white" 
            stroke-width="1.5"
          />
          <!-- Иначе используем символ валюты -->
          <template v-else>
            {{ selectedAccount.symbol || getCurrencySymbol(selectedAccount.currency) }}
          </template>
        </div>
        <div class="account-name">
          {{ truncateName(selectedAccount.name) }}
        </div>
        <div class="choose-button">
          <svg width="9" height="6" viewBox="0 0 9 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.9047 6.11346L3.97424 6.25H4.12747H4.87281H5.02604L5.09558 6.11346L8.15148 0.113461L8.3366 -0.25L7.92871 -0.25L6.73616 -0.25L6.57911 -0.25L6.51094 -0.108509L4.50014 4.06517L2.48934 -0.108509L2.42117 -0.25L2.26411 -0.25L1.07157 -0.25L0.66368 -0.25L0.848797 0.113461L3.9047 6.11346Z" fill="#949496" stroke="#949496" stroke-width="0.5"/>
          </svg>
        </div>
      </div>
      
      <!-- Иконка для управления слайдером (показана только если showDistributionToggle = true) -->
      <div 
        v-if="showDistributionToggle" 
        class="distribution-toggle"
        :class="{ 'active': isDistributionVisible }"
        @click="toggleDistribution"
      >
        <component 
          :is="getTablerIcon('IconChartPie')" 
          size="16" 
          :color="isDistributionVisible ? (selectedAccount.color || '#5B8FF9') : '#949496'" 
          stroke-width="1.5"
        />
      </div>
    </div>
    
    <!-- For transfers (with two accounts) -->
    <div v-else class="transfer-accounts">
      <div class="account-box" @click="showAccountSelector('source')">
        <div class="account-icon" :style="{ backgroundColor: selectedAccount.color || '#5B8FF9' }">
          <!-- Если есть иконка, рендерим её -->
          <component 
            v-if="selectedAccount.icon && getTablerIcon(selectedAccount.icon)" 
            :is="getTablerIcon(selectedAccount.icon)" 
            size="14" 
            color="white" 
            stroke-width="1.5"
          />
          <!-- Иначе используем символ валюты -->
          <template v-else>
            {{ selectedAccount.symbol || getCurrencySymbol(selectedAccount.currency) }}
          </template>
        </div>
        <div class="account-name">
          {{ truncateName(selectedAccount.name) }}
        </div>
      </div>
      
      <div class="transfer-arrow">
        &gt;
      </div>
      
      <div class="account-box" @click="showAccountSelector('destination')">
        <div class="account-icon" :style="{ backgroundColor: destinationAccount.color || '#61DDAA' }">
          <!-- Если есть иконка, рендерим её -->
          <component 
            v-if="destinationAccount.icon && getTablerIcon(destinationAccount.icon)" 
            :is="getTablerIcon(destinationAccount.icon)" 
            size="14" 
            color="white" 
            stroke-width="1.5"
          />
          <!-- Иначе используем символ валюты -->
          <template v-else>
            {{ destinationAccount.symbol || getCurrencySymbol(destinationAccount.currency) }}
          </template>
        </div>
        <div class="account-name">
          {{ truncateName(destinationAccount.name) }}
        </div>
      </div>
    </div>
    
    <!-- Account selector popup -->
    <account-selector-popup
      v-model="accountSelectorVisible"
      :accounts="displayableAccounts"
      :bookId="bookId"
      @select="selectAccount"
      @add="handleAddAccount"
      @edit="handleEditAccounts"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Account } from '../../stores/account/types';
import AccountSelectorPopup from '../../views/account/popup/AccountSelectorPopup.vue';
import { useCurrencyStore } from '../../stores/currency';
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
  bookId: {  // Добавляем prop для передачи ID книги
    type: String,
    default: ''
  },
  showDistributionToggle: { // Новый проп для отображения иконки управления слайдером
    type: Boolean,
    default: false
  },
  isDistributionVisible: { // Новый проп для отслеживания состояния видимости слайдера
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'update:modelValue', 
  'update:destinationAccountId', 
  'add', 
  'edit',
  'toggle-distribution' // Новое событие для управления отображением слайдера
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

const selectedAccount = computed(() => {
  return props.accounts.find(account => account.id === props.modelValue) || props.accounts[0] || { 
    id: '', 
    name: 'No account', 
    currency: 'USD', 
    color: '#5B8FF9'
  };
});

const destinationAccount = computed(() => {
  // If destinationAccountId is specified and different from current selected account,
  // use it, otherwise take the second account from the list or the first if the list has only one item
  if (props.destinationAccountId && props.destinationAccountId !== props.modelValue) {
    const account = props.accounts.find(account => account.id === props.destinationAccountId);
    if (account) return account;
  }
  
  // If there's more than one account, select the first one different from current
  if (props.accounts.length > 1) {
    const otherAccount = props.accounts.find(account => account.id !== props.modelValue);
    if (otherAccount) return otherAccount;
  }
  
  // Fallback to the first account or default
  return props.accounts[0] || { 
    id: '', 
    name: 'Destination', 
    currency: 'USD', 
    color: '#61DDAA'
  };
});

// Displayable accounts in the selector popup
const displayableAccounts = computed(() => {
  // For non-transfer mode or when selecting source account, show all accounts
  if (!props.isTransfer || selectionMode.value === 'source') {
    return props.accounts;
  }
  
  // When selecting destination account, exclude the current source account
  return props.accounts.filter(account => account.id !== props.modelValue);
});

// Get currency symbol if not available in account
const getCurrencySymbol = (currencyCode) => {
  if (!currencyCode) return '$';
  
  const currency = currencyStore.getCurrency(currencyCode);
  if (currency && currency.symbol) return currency.symbol;
  
  // Fallback symbols for common currencies
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

// Function to limit account name length
const truncateName = (name: string) => {
  if (!name) return 'Account';
  const maxLength = 15;
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 3) + '...';
};

// Show the account selector popup
const showAccountSelector = (mode = 'source') => {
  selectionMode.value = mode;
  accountSelectorVisible.value = true;
};

// Handle account selection from popup
const selectAccount = (account) => {
  if (selectionMode.value === 'source') {
    emit('update:modelValue', account.id);
    
    // If selected source account matches destination, change destination to another account
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

// Handle add account request
const handleAddAccount = () => {
  emit('add');
  accountSelectorVisible.value = false;
};

// Handle edit accounts request
const handleEditAccounts = () => {
  emit('edit');
  accountSelectorVisible.value = false;
};

// Обработчик переключения отображения слайдера распределения
const toggleDistribution = () => {
  emit('toggle-distribution');
};
</script>

<style scoped>
.account-element {
  width: 100%;
  height: 42px; /* Fixed height for stability */
  display: flex;
  justify-content: center; /* Center content */
  align-items: center;
  position: relative;
}

/* For regular transactions (single account) */
.single-account {
  display: flex;
  align-items: center;
  height: 100%;
  width: auto;
  gap: 8px; /* Пространство между селектором аккаунта и иконкой распределения */
  background-color: var(--bg-light, #949496);
  border-radius: var(--border-radius-lg, 28px);
  padding: 0 2px 0 0px;
}

.account-section {
  padding: 6px 14px;
  background: #46484A;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  min-width: 50px;
  max-width: 200px;
  cursor: pointer;
}

/* Стиль для иконки переключения слайдера */
.distribution-toggle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #46484A;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.distribution-toggle:hover {
  opacity: 0.8;
}

/* Активное состояние кнопки распределения (когда слайдер видим) */
.distribution-toggle.active {
  background: #46484A; /* Оставляем фон серым */
  opacity: 1;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
}

/* For transfers (two accounts) */
.transfer-accounts {
  display: flex;
  justify-content: center; /* Center content */
  align-items: center;
  gap: 8px;
  height: 100%;
  width: 100%;
}

.account-box {
  padding: 6px 14px;
  background: #46484A;
  border-radius: 28px;
  display: flex;
  align-items: center;
  height: 100%;
  cursor: pointer;
  min-width: 80px;
  max-width: 150px; /* Limit each account width */
  overflow: hidden;
  flex: 1;
}

.transfer-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #949496;
  font-size: 16px;
}

.account-icon {
  width: 28px;
  height: 28px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}

.account-name {
  padding: 0 8px;
  color: white;
  font-size: 16px;
  font-family: Inter, sans-serif;
  font-weight: 500;
  line-height: 24px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 0 1 auto; /* Don't grow but can shrink, base size on content */
  min-width: 0; /* Prevent flex item from overflowing */
}

.choose-button {
  padding: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}
</style>