<!-- /Users/peaker/dev/solar-finance/src/components/transactions/AccountSelector.vue -->
<template>
  <div class="account-element">
    <div class="single-account">
      <div class="account-icon" :style="{ backgroundColor: selectedAccount.color }">
        {{ selectedAccount.symbol }}
      </div>
      <div class="account-name">
        {{ selectedAccount.name }}
      </div>
      <div class="choose-button" @click="toggleAccountSelection">
        <svg width="9" height="6" viewBox="0 0 9 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.9047 6.11346L3.97424 6.25H4.12747H4.87281H5.02604L5.09558 6.11346L8.15148 0.113461L8.3366 -0.25L7.92871 -0.25L6.73616 -0.25L6.57911 -0.25L6.51094 -0.108509L4.50014 4.06517L2.48934 -0.108509L2.42117 -0.25L2.26411 -0.25L1.07157 -0.25L0.66368 -0.25L0.848797 0.113461L3.9047 6.11346Z" fill="#949496" stroke="#949496" stroke-width="0.5"/>
        </svg>
      </div>
    </div>
    
    <div v-if="showAccountSelection" class="account-selection">
      <div 
        v-for="account in accounts" 
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

const props = defineProps({
  accounts: {
    type: Array,
    required: true
  },
  modelValue: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const showAccountSelection = ref(false);

const selectedAccount = computed(() => {
  return props.accounts.find(account => account.id === props.modelValue) || props.accounts[0];
});

const toggleAccountSelection = () => {
  showAccountSelection.value = !showAccountSelection.value;
};

const selectAccount = (accountId) => {
  emit('update:modelValue', accountId);
  showAccountSelection.value = false;
};
</script>

<style scoped>
.account-element {
  width: 100%;
    display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.single-account {
  width: auto;
  min-width: 100px;
  max-width: 200px;
  padding: 6px 14px;
  background: #46484A;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  flex: 1;
  height: 28px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
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
  left: 21px;
  right: 21px;
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

.account-option .account-name {
  justify-content: flex-start;
}

.account-option:hover {
  background: #3A3A3A;
}
</style>