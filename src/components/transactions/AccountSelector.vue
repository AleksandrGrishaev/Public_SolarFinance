<!-- src/components/transactions/AccountSelector.vue -->
<template>
  <div class="account-element">
    <!-- Для обычных транзакций (не transfer) -->
    <div v-if="!isTransfer" class="single-account">
      <div class="account-icon" :style="{ backgroundColor: selectedAccount.color }">
        {{ selectedAccount.symbol }}
      </div>
      <div class="account-name">
        {{ selectedAccount.name }}
      </div>
      <div class="choose-button" @click="toggleAccountSelection('source')">
        <svg width="9" height="6" viewBox="0 0 9 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.9047 6.11346L3.97424 6.25H4.12747H4.87281H5.02604L5.09558 6.11346L8.15148 0.113461L8.3366 -0.25L7.92871 -0.25L6.73616 -0.25L6.57911 -0.25L6.51094 -0.108509L4.50014 4.06517L2.48934 -0.108509L2.42117 -0.25L2.26411 -0.25L1.07157 -0.25L0.66368 -0.25L0.848797 0.113461L3.9047 6.11346Z" fill="#949496" stroke="#949496" stroke-width="0.5"/>
        </svg>
      </div>
    </div>
    
    <!-- Для transfer -->
    <div v-else class="transfer-accounts">
      <div class="account-box" @click="toggleAccountSelection('source')">
        <div class="account-icon" :style="{ backgroundColor: selectedAccount.color }">
          {{ selectedAccount.symbol }}
        </div>
        <div class="account-name">
          {{ selectedAccount.name }}
        </div>
      </div>
      
      <div class="transfer-arrow">
        &gt;
      </div>
      
      <div class="account-box" @click="toggleAccountSelection('destination')">
        <div class="account-icon" :style="{ backgroundColor: destinationAccount.color }">
          {{ destinationAccount.symbol }}
        </div>
        <div class="account-name">
          {{ destinationAccount.name }}
        </div>
      </div>
    </div>
    
    <!-- Выпадающий список аккаунтов -->
    <div v-if="showAccountSelection" class="account-selection">
      <div 
        v-for="account in displayableAccounts" 
        :key="account.id"
        class="account-option"
        @click="selectAccount(account.id)"
      >
        <div class="account-icon" :style="{ backgroundColor: account.color }">
          {{ account.symbol }}
        </div>
        <div class="account-name">
          {{ account.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Account } from '../../stores/account/types';

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
  }
});

const emit = defineEmits(['update:modelValue', 'update:destinationAccountId']);

const showAccountSelection = ref(false);
const selectionMode = ref('source'); // 'source' или 'destination'

const selectedAccount = computed(() => {
  return props.accounts.find(account => account.id === props.modelValue) || props.accounts[0];
});

const destinationAccount = computed(() => {
  // Если указан destinationAccountId и он отличается от текущего выбранного аккаунта,
  // то используем его, иначе берем второй аккаунт из списка или первый, если список состоит из одного элемента
  if (props.destinationAccountId && props.destinationAccountId !== props.modelValue) {
    const account = props.accounts.find(account => account.id === props.destinationAccountId);
    if (account) return account;
  }
  
  // Если доступно более одного аккаунта, выбираем первый отличный от текущего
  if (props.accounts.length > 1) {
    const otherAccount = props.accounts.find(account => account.id !== props.modelValue);
    if (otherAccount) return otherAccount;
  }
  
  // В крайнем случае возвращаем первый аккаунт
  return props.accounts[0];
});

// Отображаемые аккаунты в выпадающем списке
const displayableAccounts = computed(() => {
  // Если не в режиме transfer или выбираем исходный аккаунт, показываем все счета
  if (!props.isTransfer || selectionMode.value === 'source') {
    return props.accounts;
  }
  
  // Если выбираем целевой аккаунт, исключаем из списка текущий исходный аккаунт
  return props.accounts.filter(account => account.id !== props.modelValue);
});

const toggleAccountSelection = (mode = 'source') => {
  selectionMode.value = mode;
  showAccountSelection.value = !showAccountSelection.value;
};

const selectAccount = (accountId) => {
  if (selectionMode.value === 'source') {
    emit('update:modelValue', accountId);
    
    // Если выбранный исходный аккаунт совпал с целевым, меняем целевой на другой
    if (props.isTransfer && accountId === props.destinationAccountId) {
      const otherAccount = props.accounts.find(acc => acc.id !== accountId);
      if (otherAccount) {
        emit('update:destinationAccountId', otherAccount.id);
      }
    }
  } else {
    emit('update:destinationAccountId', accountId);
  }
  
  showAccountSelection.value = false;
};
</script>

<style scoped>
.account-element {
  width: 100%;
  height: 42px; /* Фиксированная высота для стабильности */
  display: flex;
  justify-content: center; /* Центрируем содержимое */
  align-items: center;
  position: relative;
}

/* Для обычных транзакций (одиночный счет) */
.single-account {
  padding: 6px 14px;
  background: #46484A;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 200px; /* Ограничиваем ширину для центрирования */
  cursor: pointer;
}

/* Для переводов (режим transfer с двумя счетами) */
.transfer-accounts {
  display: flex;
  justify-content: center; /* Центрируем содержимое */
  align-items: center;
  gap: 8px;
  height: 100%;
}

.account-box {
  padding: 6px 14px;
  background: #46484A;
  border-radius: 28px;
  display: flex;
  align-items: center;
  height: 100%;
  cursor: pointer;
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
}

.choose-button {
  padding: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.account-selection {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #2A2A2A;
  border-radius: 16px;
  padding: 8px;
  margin-top: 8px;
  z-index: 10;
}

.account-option {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 8px;
}

.account-option:hover {
  background: #3A3A3A;
}
</style>